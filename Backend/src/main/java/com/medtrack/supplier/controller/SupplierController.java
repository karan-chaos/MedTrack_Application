package com.medtrack.supplier.controller;

import com.medtrack.model.EquipmentOrder;
import com.medtrack.supplier.dto.SupplierOrderUpdateRequest;
import com.medtrack.supplier.service.SupplierOrderService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

/** Supplier-facing fulfillment and logistics endpoints. */
@RestController
@RequestMapping("/api/supplier")
@RequiredArgsConstructor
public class SupplierController {

    private final SupplierOrderService supplierOrderService;

    @GetMapping("/orders")
    public ResponseEntity<Page<EquipmentOrder>> getOrders(
            @RequestParam(required = false) String status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        int safeSize = Math.min(Math.max(size, 1), 100);
        Pageable pageable = PageRequest.of(Math.max(page, 0), safeSize, Sort.by("orderDate").descending());
        return ResponseEntity.ok(supplierOrderService.getOrders(status, pageable));
    }

    @PutMapping("/order/update/{orderId}")
    public ResponseEntity<EquipmentOrder> updateOrder(
            @PathVariable Long orderId,
            @RequestParam String newStatus,
            @Valid @RequestBody(required = false) SupplierOrderUpdateRequest details) {
        return ResponseEntity.ok(supplierOrderService.updateOrder(orderId, newStatus, details));
    }
}
