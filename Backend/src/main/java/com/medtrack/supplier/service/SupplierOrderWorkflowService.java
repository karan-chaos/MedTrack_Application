package com.medtrack.supplier.service;

import com.medtrack.model.EquipmentOrder;
import com.medtrack.repository.EquipmentOrderRepository;
import com.medtrack.supplier.exception.InvalidSupplierOrderTransitionException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Locale;

/**
 * Owns the supplier-side order workflow. The service deliberately permits only
 * PENDING -> SHIPPED -> DELIVERED, preserving a simple, auditable fulfillment path.
 */
@Service
@RequiredArgsConstructor
public class SupplierOrderWorkflowService {

    private static final String PENDING = "PENDING";
    private static final String SHIPPED = "SHIPPED";
    private static final String DELIVERED = "DELIVERED";

    private final EquipmentOrderRepository orderRepository;

    public List<EquipmentOrder> getDemandOrders(String status) {
        if (status == null || status.isBlank()) {
            return orderRepository.findByStatus(PENDING);
        }
        String normalizedStatus = normalizeStatus(status);
        validateWorkflowStatus(normalizedStatus);
        return orderRepository.findByStatus(normalizedStatus);
    }

    public EquipmentOrder getOrder(Long orderId) {
        return orderRepository.findById(orderId)
                .orElseThrow(() -> new IllegalArgumentException("Order not found with id: " + orderId));
    }

    public EquipmentOrder updateStatus(Long orderId, String requestedStatus, String supplierNotes) {
        EquipmentOrder order = getOrder(orderId);
        String currentStatus = normalizeStatus(order.getStatus());
        String nextStatus = normalizeStatus(requestedStatus);
        validateWorkflowStatus(nextStatus);

        if (!isAllowedTransition(currentStatus, nextStatus)) {
            throw new InvalidSupplierOrderTransitionException(currentStatus, nextStatus);
        }

        order.setStatus(nextStatus);
        order.setSupplierNotes(supplierNotes);
        order.setUpdatedAt(LocalDateTime.now());
        return orderRepository.save(order);
    }

    private boolean isAllowedTransition(String currentStatus, String nextStatus) {
        return (PENDING.equals(currentStatus) && SHIPPED.equals(nextStatus))
                || (SHIPPED.equals(currentStatus) && DELIVERED.equals(nextStatus));
    }

    private String normalizeStatus(String status) {
        return status == null ? "" : status.trim().toUpperCase(Locale.ROOT);
    }

    private void validateWorkflowStatus(String status) {
        if (!PENDING.equals(status) && !SHIPPED.equals(status) && !DELIVERED.equals(status)) {
            throw new IllegalArgumentException("Unsupported supplier workflow status: " + status);
        }
    }
}
