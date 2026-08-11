package com.medtrack.supplier.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
@Schema(description = "Distribution of active and historical equipment orders by status")
public class FulfillmentStatusDistribution {

    @Schema(description = "Count of pending orders (awaiting confirmation from supplier)", example = "15")
    private long pending;

    @Schema(description = "Count of confirmed orders (waiting for shipment)", example = "8")
    private long confirmed;

    @Schema(description = "Count of shipped orders (in transit)", example = "23")
    private long shipped;

    @Schema(description = "Count of delivered orders (completed)", example = "142")
    private long delivered;
}
