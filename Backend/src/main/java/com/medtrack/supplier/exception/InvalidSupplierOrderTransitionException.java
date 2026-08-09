package com.medtrack.supplier.exception;

public class InvalidSupplierOrderTransitionException extends RuntimeException {
    public InvalidSupplierOrderTransitionException(String currentStatus, String requestedStatus) {
        super("Supplier workflow cannot transition from " + currentStatus + " to " + requestedStatus
                + ". Allowed transitions are PENDING -> SHIPPED -> DELIVERED.");
    }
}
