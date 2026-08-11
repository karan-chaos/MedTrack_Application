package com.medtrack.supplier.dto;

import java.time.LocalDateTime;

public record OrderStatusHistoryResponse(
    Long orderId,
    String previousStatus,
    String newStatus,
    LocalDateTime transitionTimestamp
) {
}
