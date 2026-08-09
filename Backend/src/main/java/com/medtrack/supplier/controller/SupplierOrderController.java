package com.medtrack.supplier.controller;

import com.medtrack.model.EquipmentOrder;
import com.medtrack.supplier.dto.SupplierOrderStatusUpdateRequest;
import com.medtrack.supplier.service.SupplierOrderWorkflowService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/** Supplier-facing API for reviewing demand and advancing fulfillment safely. */
@RestController
@RequestMapping("/api/supplier/orders")
@RequiredArgsConstructor
public class SupplierOrderController {

    private final SupplierOrderWorkflowService workflowService;

    /** Defaults to the supplier demand queue (PENDING); status can expose shipped or delivered work. */
    @GetMapping
    public ResponseEntity<List<EquipmentOrder>> getDemandOrders(
            @RequestParam(required = false) String status) {
        return ResponseEntity.ok(workflowService.getDemandOrders(status));
    }

    @GetMapping("/{orderId}")
    public ResponseEntity<EquipmentOrder> getOrder(@PathVariable Long orderId) {
        return ResponseEntity.ok(workflowService.getOrder(orderId));
    }

    @PatchMapping("/{orderId}/status")
    public ResponseEntity<EquipmentOrder> updateOrderStatus(
            @PathVariable Long orderId,
            @Valid @RequestBody SupplierOrderStatusUpdateRequest request) {
        return ResponseEntity.ok(workflowService.updateStatus(
                orderId,
                request.status(),
                request.supplierNotes()));
    }
}
