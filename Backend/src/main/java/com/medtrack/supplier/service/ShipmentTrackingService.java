package com.medtrack.supplier.service;

import com.medtrack.exception.DuplicateTrackingNumberException;
import com.medtrack.exception.InvalidStatusTransitionException;
import com.medtrack.exception.ResourceNotFoundException;
import com.medtrack.model.EquipmentOrder;
import com.medtrack.repository.EquipmentOrderRepository;
import com.medtrack.supplier.dto.CreateShipmentRequest;
import com.medtrack.supplier.dto.ShipmentTrackingDetailResponse;
import com.medtrack.supplier.dto.ShipmentTrackingResponse;
import com.medtrack.supplier.dto.ShipmentTimelineResponse;
import com.medtrack.supplier.dto.UpdateShipmentStatusRequest;
import com.medtrack.supplier.model.ShipmentStatus;
import com.medtrack.supplier.model.ShipmentTimelineEntry;
import com.medtrack.supplier.model.ShipmentTracking;
import com.medtrack.supplier.repository.ShipmentTrackingRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Phase 22 – strengthened shipment tracking service.
 *
 * <p>
 * Improvements over Phase 21:
 * </p>
 * <ul>
 * <li>Tracking number format validation (non-blank, max 100 chars,
 * alphanumeric/dash)</li>
 * <li>DELIVERED requires a non-blank tracking number on the shipment
 * record</li>
 * <li>ETA-before-now validation enforced both at creation and when status is
 * updated</li>
 * <li>Duplicate timeline entry guard (prevents same-status entries on Kafka
 * retry)</li>
 * <li>{@code delayDetected} surfaced in every response</li>
 * <li>New supplier-facing {@link #getShipmentTrackingDetail(Long)}
 * operation</li>
 * </ul>
 */
@Service
@RequiredArgsConstructor
public class ShipmentTrackingService {

    private static final String TRACKING_NUMBER_PATTERN = "^[A-Za-z0-9\\-]{3,100}$";

    private final ShipmentTrackingRepository shipmentTrackingRepository;
    private final EquipmentOrderRepository orderRepository;

    // -------------------------------------------------------------------------
    // Create
    // -------------------------------------------------------------------------

    @Transactional
    public ShipmentTrackingResponse createShipment(CreateShipmentRequest request) {
        // 1. Verify associated order exists
        EquipmentOrder order = orderRepository.findById(request.getOrderId())
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with ID: " + request.getOrderId()));

        // 2. Prevent duplicate shipment creation for same order
        shipmentTrackingRepository.findByOrderId(request.getOrderId()).ifPresent(s -> {
            throw new IllegalArgumentException(
                    "Shipment tracking already exists for Order ID: " + request.getOrderId());
        });

        // 3. Validate tracking number format
        validateTrackingNumberFormat(request.getShipmentTrackingNumber());

        // 4. Ensure tracking number uniqueness
        shipmentTrackingRepository.findByShipmentTrackingNumber(request.getShipmentTrackingNumber()).ifPresent(s -> {
            throw new DuplicateTrackingNumberException(
                    "Tracking number already in use: " + request.getShipmentTrackingNumber());
        });

        // 5. Validate ETA is in the future
        validateEtaInFuture(request.getEstimatedDeliveryDate());

        // 6. Create and persist ShipmentTracking
        ShipmentTracking shipment = ShipmentTracking.builder()
                .orderId(request.getOrderId())
                .shipmentTrackingNumber(request.getShipmentTrackingNumber())
                .estimatedDeliveryDate(request.getEstimatedDeliveryDate())
                .shipmentStatus(ShipmentStatus.PENDING)
                .supplierId(request.getSupplierId())
                .createdAt(LocalDateTime.now())
                .build();
        shipment.addTimelineEvent(null, ShipmentStatus.PENDING, "Shipment tracking created");

        ShipmentTracking savedShipment = shipmentTrackingRepository.save(shipment);

        // 7. Update order details
        order.setTrackingNo(request.getShipmentTrackingNumber());
        order.setCarrier(request.getCarrier());
        order.setStatus("CONFIRMED");
        order.setShippingStatus("Processing");
        order.setUpdatedAt(LocalDateTime.now());
        orderRepository.save(order);

        return mapToResponse(savedShipment);
    }

    // -------------------------------------------------------------------------
    // Update status
    // -------------------------------------------------------------------------

    @Transactional
    public ShipmentTrackingResponse updateShipmentStatus(Long id, UpdateShipmentStatusRequest request) {
        // 1. Retrieve the tracking record
        ShipmentTracking shipment = shipmentTrackingRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Shipment tracking not found with ID: " + id));

        // 2. Map and validate status enum
        ShipmentStatus newStatus;
        try {
            newStatus = ShipmentStatus.valueOf(request.getShipmentStatus().toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("Invalid shipment status value: " + request.getShipmentStatus());
        }

        ShipmentStatus currentStatus = shipment.getShipmentStatus();

        // 3. Duplicate DELIVERED event is harmless; all other same-state requests fail
        if (newStatus == currentStatus) {
            if (newStatus == ShipmentStatus.DELIVERED) {
                return mapToResponse(shipment);
            }
            throw new InvalidStatusTransitionException("Shipment is already in " + currentStatus + " status");
        }

        // 4. Prevent backwards transitions
        if (newStatus.ordinal() < currentStatus.ordinal()) {
            throw new InvalidStatusTransitionException(
                    "Cannot revert status from " + currentStatus + " to " + newStatus);
        }

        // 5. DELIVERED requires a tracking number on the record
        if (newStatus == ShipmentStatus.DELIVERED) {
            if (shipment.getShipmentTrackingNumber() == null
                    || shipment.getShipmentTrackingNumber().isBlank()) {
                throw new IllegalArgumentException(
                        "Cannot mark shipment as DELIVERED: tracking number is missing");
            }
        }

        // 6. Guard against duplicate timeline entries (idempotency on Kafka retry)
        List<ShipmentTimelineEntry> timeline = shipment.getTimeline();
        if (!timeline.isEmpty()) {
            ShipmentTimelineEntry last = timeline.get(timeline.size() - 1);
            if (last.getNewStatus() == newStatus) {
                // Same transition already recorded – skip the timeline entry, just save
                shipment.setShipmentStatus(newStatus);
                if (newStatus == ShipmentStatus.DELIVERED && shipment.getActualDeliveryDate() == null) {
                    shipment.setActualDeliveryDate(LocalDateTime.now());
                }
                shipment.setUpdatedAt(LocalDateTime.now());
                ShipmentTracking saved = shipmentTrackingRepository.save(shipment);
                syncOrder(saved, newStatus, request.getSupplierNotes());
                return mapToResponse(saved);
            }
        }

        // 7. Update shipment record
        shipment.setShipmentStatus(newStatus);
        if (newStatus != currentStatus && newStatus != ShipmentStatus.DELIVERED) {
            shipment.setDelayDetected(false);
        }
        if (newStatus == ShipmentStatus.DELIVERED) {
            shipment.setActualDeliveryDate(LocalDateTime.now());
        }
        String trackingInfo = request.getSupplierNotes() != null ? request.getSupplierNotes()
                : "Status updated to " + newStatus;
        shipment.addTimelineEvent(currentStatus, newStatus, trackingInfo);
        shipment.setUpdatedAt(LocalDateTime.now());
        ShipmentTracking updatedShipment = shipmentTrackingRepository.save(shipment);

        // 8. Update associated order
        syncOrder(updatedShipment, newStatus, request.getSupplierNotes());

        return mapToResponse(updatedShipment);
    }

    // -------------------------------------------------------------------------
    // Read operations
    // -------------------------------------------------------------------------

    @Transactional(readOnly = true)
    public ShipmentTrackingResponse getShipmentById(Long id) {
        ShipmentTracking shipment = shipmentTrackingRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Shipment tracking not found with ID: " + id));
        return mapToResponse(shipment);
    }

    @Transactional(readOnly = true)
    public ShipmentTrackingResponse getShipmentByTrackingNumber(String trackingNumber) {
        ShipmentTracking shipment = shipmentTrackingRepository.findByShipmentTrackingNumber(trackingNumber)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Shipment tracking not found for tracking number: " + trackingNumber));
        return mapToResponse(shipment);
    }

    @Transactional(readOnly = true)
    public ShipmentTrackingResponse getShipmentByOrderId(Long orderId) {
        ShipmentTracking shipment = shipmentTrackingRepository.findByOrderId(orderId)
                .orElseThrow(
                        () -> new ResourceNotFoundException("Shipment tracking not found for Order ID: " + orderId));
        return mapToResponse(shipment);
    }

    @Transactional(readOnly = true)
    public List<ShipmentTrackingResponse> getShipmentsBySupplier(Long supplierId) {
        return shipmentTrackingRepository.findBySupplierId(supplierId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    /**
     * Phase 22 – Shipment Tracking Detail.
     *
     * <p>
     * Returns an enriched view combining order status with shipment
     * tracking state, the full timeline, and delay status.
     * </p>
     *
     * @param orderId the equipment order ID
     * @return populated {@link ShipmentTrackingDetailResponse}
     * @throws ResourceNotFoundException if the order or its shipment does not exist
     */
    @Transactional(readOnly = true)
    public ShipmentTrackingDetailResponse getShipmentTrackingDetail(Long orderId) {
        EquipmentOrder order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with ID: " + orderId));

        ShipmentTracking shipment = shipmentTrackingRepository.findByOrderId(orderId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Shipment tracking not found for Order ID: " + orderId));

        List<ShipmentTimelineResponse> timelineResponses = buildTimelineResponses(shipment);

        return ShipmentTrackingDetailResponse.builder()
                .orderId(orderId)
                .orderStatus(order.getStatus())
                .shipmentStatus(shipment.getShipmentStatus().name())
                .trackingNumber(shipment.getShipmentTrackingNumber())
                .carrier(order.getCarrier())
                .estimatedDeliveryDate(shipment.getEstimatedDeliveryDate())
                .actualDeliveryDate(shipment.getActualDeliveryDate())
                .delayDetected(shipment.isDelayDetected() && shipment.getShipmentStatus() != ShipmentStatus.DELIVERED)
                .timeline(timelineResponses)
                .build();
    }

    // -------------------------------------------------------------------------
    // Helpers
    // -------------------------------------------------------------------------

    /**
     * Validates that a tracking number is non-null, non-blank, and matches
     * the accepted alphanumeric-with-dashes pattern (3–100 characters).
     */
    private void validateTrackingNumberFormat(String trackingNumber) {
        if (trackingNumber == null || trackingNumber.isBlank()) {
            throw new IllegalArgumentException("Shipment tracking number cannot be blank");
        }
        if (!trackingNumber.matches(TRACKING_NUMBER_PATTERN)) {
            throw new IllegalArgumentException(
                    "Invalid tracking number format. Only letters, digits, and hyphens are allowed "
                            + "(3–100 characters): " + trackingNumber);
        }
    }

    /**
     * Validates that the ETA is in the future.
     * A {@code null} ETA is allowed (optional field).
     */
    private void validateEtaInFuture(LocalDateTime eta) {
        if (eta != null && eta.isBefore(LocalDateTime.now())) {
            throw new IllegalArgumentException("Estimated delivery date cannot be in the past");
        }
    }

    /**
     * Synchronises the equipment order's status fields after a shipment status
     * change.
     */
    private void syncOrder(ShipmentTracking shipment, ShipmentStatus newStatus, String supplierNotes) {
        EquipmentOrder order = orderRepository.findById(shipment.getOrderId())
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with ID: " + shipment.getOrderId()));

        if (newStatus == ShipmentStatus.CONFIRMED) {
            order.setStatus("CONFIRMED");
            order.setShippingStatus("Processing");
        } else if (newStatus == ShipmentStatus.SHIPPED) {
            order.setStatus("IN_TRANSIT");
            order.setShippingStatus("Shipped");
            order.setDispatchedAt(LocalDateTime.now());
        } else if (newStatus == ShipmentStatus.DELIVERED) {
            order.setStatus("DELIVERED");
            order.setShippingStatus("Delivered");
            order.setDeliveredAt(LocalDateTime.now());
        }

        if (supplierNotes != null) {
            order.setSupplierNotes(supplierNotes);
        }
        order.setUpdatedAt(LocalDateTime.now());
        orderRepository.save(order);
    }

    private List<ShipmentTimelineResponse> buildTimelineResponses(ShipmentTracking shipment) {
        if (shipment.getTimeline() == null) {
            return Collections.emptyList();
        }
        return shipment.getTimeline().stream()
                .map(t -> ShipmentTimelineResponse.builder()
                        .eventTimestamp(t.getEventTimestamp())
                        .previousStatus(t.getPreviousStatus() != null ? t.getPreviousStatus().name() : null)
                        .newStatus(t.getNewStatus().name())
                        .trackingInformation(t.getTrackingInformation())
                        .build())
                .collect(Collectors.toList());
    }

    private ShipmentTrackingResponse mapToResponse(ShipmentTracking shipment) {
        return ShipmentTrackingResponse.builder()
                .id(shipment.getId())
                .orderId(shipment.getOrderId())
                .shipmentTrackingNumber(shipment.getShipmentTrackingNumber())
                .estimatedDeliveryDate(shipment.getEstimatedDeliveryDate())
                .actualDeliveryDate(shipment.getActualDeliveryDate())
                .shipmentStatus(shipment.getShipmentStatus().name())
                .supplierId(shipment.getSupplierId())
                .createdAt(shipment.getCreatedAt())
                .updatedAt(shipment.getUpdatedAt())
                .delayDetected(shipment.isDelayDetected() && shipment.getShipmentStatus() != ShipmentStatus.DELIVERED)
                .timeline(buildTimelineResponses(shipment))
                .build();
    }
}
