package com.medtrack.supplier.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
@Schema(description = "Supplier fulfillment operations summary and overall performance metrics")
public class FulfillmentSummaryResponse {

    @Schema(description = "Total number of orders assigned to this supplier", example = "188")
    private long totalOrders;

    @Schema(description = "Number of active shipments (shipped but not yet delivered)", example = "12")
    private long activeShipments;

    @Schema(description = "Number of shipments currently delayed (ETA passed, not delivered)", example = "2")
    private long delayedShipments;

    @Schema(description = "Number of completed deliveries that were made on or before the ETA date", example = "130")
    private long onTimeDeliveries;

    @Schema(description = "Number of completed deliveries that were made after the ETA date", example = "12")
    private long lateDeliveries;

    @Schema(description = "Percentage of on-time deliveries out of total deliveries", example = "91.5")
    private double onTimeDeliveryRate;

    @Schema(description = "Detailed breakdown of orders based on their fulfillment status")
    private FulfillmentStatusDistribution deliveryStatusDistribution;
}
