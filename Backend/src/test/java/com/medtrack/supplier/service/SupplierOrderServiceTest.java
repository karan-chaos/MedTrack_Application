package com.medtrack.supplier.service;

import com.medtrack.model.EquipmentOrder;
import com.medtrack.repository.EquipmentOrderRepository;
import com.medtrack.supplier.dto.SupplierOrderUpdateRequest;
import com.medtrack.supplier.exception.InvalidSupplierOrderTransitionException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class SupplierOrderServiceTest {

    @Mock
    private EquipmentOrderRepository orderRepository;

    private SupplierOrderService service;

    @BeforeEach
    void setUp() {
        service = new SupplierOrderService(orderRepository);
    }

    @Test
    void confirmsPendingOrder() {
        EquipmentOrder order = EquipmentOrder.builder().id(8L).status("PENDING").build();
        when(orderRepository.findById(8L)).thenReturn(Optional.of(order));
        when(orderRepository.save(order)).thenReturn(order);

        EquipmentOrder updated = service.updateOrder(8L, "CONFIRMED", null);

        assertEquals("CONFIRMED", updated.getStatus());
        verify(orderRepository).save(order);
    }

    @Test
    void shippingRequiresTrackingAndEstimatedDeliveryDate() {
        EquipmentOrder order = EquipmentOrder.builder().id(8L).status("CONFIRMED").build();
        when(orderRepository.findById(8L)).thenReturn(Optional.of(order));

        assertThrows(IllegalArgumentException.class,
                () -> service.updateOrder(8L, "SHIPPED", new SupplierOrderUpdateRequest(null, null, null)));
    }

    @Test
    void shippingStoresTrackingDetails() {
        EquipmentOrder order = EquipmentOrder.builder().id(8L).status("CONFIRMED").build();
        SupplierOrderUpdateRequest details = new SupplierOrderUpdateRequest("MED-TRACK-55", LocalDate.now().plusDays(2),
                "Collected by carrier");
        when(orderRepository.findById(8L)).thenReturn(Optional.of(order));
        when(orderRepository.save(order)).thenReturn(order);

        EquipmentOrder updated = service.updateOrder(8L, "SHIPPED", details);

        assertEquals("SHIPPED", updated.getStatus());
        assertEquals("MED-TRACK-55", updated.getTrackingNumber());
        assertEquals(details.estimatedDeliveryDate(), updated.getEstimatedDeliveryDate());
    }

    @Test
    void rejectsSkippingFromPendingToShipped() {
        EquipmentOrder order = EquipmentOrder.builder().id(8L).status("PENDING").build();
        when(orderRepository.findById(8L)).thenReturn(Optional.of(order));

        assertThrows(InvalidSupplierOrderTransitionException.class,
                () -> service.updateOrder(8L, "SHIPPED", null));
    }

    @Test
    void deliveryRecordsDeliveryTimestamp() {
        EquipmentOrder order = EquipmentOrder.builder().id(8L).status("SHIPPED").build();
        when(orderRepository.findById(8L)).thenReturn(Optional.of(order));
        when(orderRepository.save(order)).thenReturn(order);

        EquipmentOrder updated = service.updateOrder(8L, "DELIVERED", null);

        assertEquals("DELIVERED", updated.getStatus());
        assertNotNull(updated.getDeliveredAt());
    }

    @Test
    void getOrders_WithoutStatus_ReturnsAll() {
        org.springframework.data.domain.Pageable pageable = org.springframework.data.domain.PageRequest.of(0, 10);
        org.springframework.data.domain.Page<EquipmentOrder> page = new org.springframework.data.domain.PageImpl<>(
                java.util.Collections.emptyList());
        when(orderRepository.findAll(pageable)).thenReturn(page);

        org.springframework.data.domain.Page<EquipmentOrder> result = service.getOrders(null, pageable);

        assertEquals(page, result);
        verify(orderRepository).findAll(pageable);
    }

    @Test
    void getOrders_WithValidStatus_ReturnsFiltered() {
        org.springframework.data.domain.Pageable pageable = org.springframework.data.domain.PageRequest.of(0, 10);
        org.springframework.data.domain.Page<EquipmentOrder> page = new org.springframework.data.domain.PageImpl<>(
                java.util.Collections.emptyList());
        when(orderRepository.findByStatus("PENDING", pageable)).thenReturn(page);

        org.springframework.data.domain.Page<EquipmentOrder> result = service.getOrders("pending ", pageable);

        assertEquals(page, result);
        verify(orderRepository).findByStatus("PENDING", pageable);
    }

    @Test
    void getOrders_WithInvalidStatus_ThrowsException() {
        org.springframework.data.domain.Pageable pageable = org.springframework.data.domain.PageRequest.of(0, 10);
        assertThrows(IllegalArgumentException.class, () -> service.getOrders("INVALID", pageable));
    }

    @Test
    void updateOrder_NotFound_ThrowsException() {
        when(orderRepository.findById(99L)).thenReturn(Optional.empty());
        assertThrows(IllegalArgumentException.class, () -> service.updateOrder(99L, "CONFIRMED", null));
    }

    @Test
    void updateOrder_InvalidStatus_ThrowsException() {
        EquipmentOrder order = EquipmentOrder.builder().id(8L).status("PENDING").build();
        when(orderRepository.findById(8L)).thenReturn(Optional.of(order));
        assertThrows(IllegalArgumentException.class, () -> service.updateOrder(8L, "UNDEFINED_STATUS", null));
    }
}
