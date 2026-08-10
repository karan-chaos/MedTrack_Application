package com.medtrack.supplier.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Phase 22 – Shipment Tracking Detail Response.
 *
 * <p>
 * Provides a supplier-facing enriched view of a shipment that combines
 * the order state with shipment tracking data and the status timeline.
 * </p>
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ShipmentTrackingDetailResponse {

    /** The identifier of the associated equipment order. */
    private Long orderId;

    /**
     * Current status of the equipment order (e.g. CONFIRMED, IN_TRANSIT,
     * DELIVERED).
     */
    private String orderStatus;

    /** Current shipment status (PENDING, CONFIRMED, SHIPPED, DELIVERED). */
    private String shipmentStatus;

    /** Carrier-assigned tracking number. */
    private String trackingNumber;

    /** Name of the logistics carrier. */
    private String carrier;

    /** Estimated date and time of delivery. */
    private LocalDateTime estimatedDeliveryDate;

    /** Actual delivery date and time, populated once status is DELIVERED. */
    private LocalDateTime actualDeliveryDate;

    /**
     * Whether a delivery delay has been detected for this shipment.
     * {@code true} when the ETA has passed or delivery occurred after ETA.
     */
    private boolean delayDetected;

    /** Chronological list of shipment status transitions. */
    private List<ShipmentTimelineResponse> timeline;
}
