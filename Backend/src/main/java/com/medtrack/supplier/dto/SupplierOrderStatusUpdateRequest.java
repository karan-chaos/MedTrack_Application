package com.medtrack.supplier.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/** Request accepted from a supplier when advancing an order workflow. */
public record SupplierOrderStatusUpdateRequest(
        @NotBlank(message = "status is required") String status,
        @Size(max = 2000, message = "supplierNotes must not exceed 2000 characters") String supplierNotes) {
}
