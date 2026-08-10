package com.medtrack.supplier.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ShipmentTimelineResponse {
    private LocalDateTime eventTimestamp;
    private String previousStatus;
    private String newStatus;
    private String trackingInformation;
}
