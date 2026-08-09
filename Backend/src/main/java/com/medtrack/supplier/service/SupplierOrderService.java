package com.medtrack.supplier.service;

import com.medtrack.model.EquipmentOrder;
import com.medtrack.repository.EquipmentOrderRepository;
import com.medtrack.supplier.dto.SupplierOrderUpdateRequest;
import com.medtrack.supplier.exception.InvalidSupplierOrderTransitionException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Locale;

/** Supplier-side fulfillment workflow and shipment detail management. */
@Service
@RequiredArgsConstructor
public class SupplierOrderService {

    private final EquipmentOrderRepository orderRepository;

    public Page<EquipmentOrder> getOrders(String status, Pageable pageable) {
        if (status == null || status.isBlank()) {
            return orderRepository.findAll(pageable);
        }
        String normalized = normalize(status);
        validateKnownStatus(normalized);
        return orderRepository.findByStatus(normalized, pageable);
    }

    public EquipmentOrder updateOrder(Long orderId, String newStatus, SupplierOrderUpdateRequest details) {
        EquipmentOrder order = orderRepository.findById(orderId)
                .orElseThrow(() -> new IllegalArgumentException("Order not found with id: " + orderId));
        String currentStatus = normalize(order.getStatus());
        String nextStatus = normalize(newStatus);
        validateKnownStatus(nextStatus);

        if (!isAllowedTransition(currentStatus, nextStatus)) {
            throw new InvalidSupplierOrderTransitionException(currentStatus, nextStatus);
        }
        if ("SHIPPED".equals(nextStatus) && (details == null || details.trackingNumber() == null
                || details.estimatedDeliveryDate() == null)) {
            throw new IllegalArgumentException("trackingNumber and estimatedDeliveryDate are required when shipping an order");
        }

        order.setStatus(nextStatus);
        if (details != null) {
            if (details.trackingNumber() != null) order.setTrackingNumber(details.trackingNumber());
            if (details.estimatedDeliveryDate() != null) order.setEstimatedDeliveryDate(details.estimatedDeliveryDate());
            if (details.supplierNotes() != null) order.setSupplierNotes(details.supplierNotes());
        }
        if ("DELIVERED".equals(nextStatus)) order.setDeliveredAt(LocalDateTime.now());
        order.setUpdatedAt(LocalDateTime.now());
        return orderRepository.save(order);
    }

    private boolean isAllowedTransition(String current, String next) {
        return ("PENDING".equals(current) && "CONFIRMED".equals(next))
                || ("CONFIRMED".equals(current) && "SHIPPED".equals(next))
                || ("SHIPPED".equals(current) && "DELIVERED".equals(next));
    }

    private void validateKnownStatus(String status) {
        if (!"PENDING".equals(status) && !"CONFIRMED".equals(status)
                && !"SHIPPED".equals(status) && !"DELIVERED".equals(status)) {
            throw new IllegalArgumentException("Unsupported supplier workflow status: " + status);
        }
    }

    private String normalize(String status) {
        return status == null ? "" : status.trim().toUpperCase(Locale.ROOT);
    }
}
