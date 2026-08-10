package com.medtrack.supplier.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ShipmentTrackingResponse {
    private Long id;
    private Long orderId;
    private String shipmentTrackingNumber;
    private LocalDateTime estimatedDeliveryDate;
    private LocalDateTime actualDeliveryDate;
    private String shipmentStatus;
    private Long supplierId;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private List<ShipmentTimelineResponse> timeline;
}
