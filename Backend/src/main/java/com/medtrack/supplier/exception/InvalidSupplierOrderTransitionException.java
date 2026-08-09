package com.medtrack.supplier.exception;

/** Raised when a supplier tries to skip or reverse the fulfillment lifecycle. */
public class InvalidSupplierOrderTransitionException extends RuntimeException {
    public InvalidSupplierOrderTransitionException(String currentStatus, String requestedStatus) {
        super("Supplier workflow cannot transition from " + currentStatus + " to " + requestedStatus
                + ". Allowed transitions are PENDING -> CONFIRMED -> SHIPPED -> DELIVERED.");
    }
}
