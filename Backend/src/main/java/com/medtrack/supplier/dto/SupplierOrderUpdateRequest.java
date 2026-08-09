package com.medtrack.supplier.dto;

import jakarta.validation.constraints.FutureOrPresent;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

import java.time.LocalDate;

/** Optional shipment information supplied alongside a workflow status update. */
public record SupplierOrderUpdateRequest(
        @Pattern(regexp = "^[A-Za-z0-9][A-Za-z0-9-]{3,63}$", message = "trackingNumber must be 4-64 letters, numbers, or hyphens")
        String trackingNumber,
        @FutureOrPresent(message = "estimatedDeliveryDate must be today or later")
        LocalDate estimatedDeliveryDate,
        @Size(max = 2000, message = "supplierNotes must not exceed 2000 characters")
        String supplierNotes) {
}
