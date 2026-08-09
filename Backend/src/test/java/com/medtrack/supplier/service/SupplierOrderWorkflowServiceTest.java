package com.medtrack.supplier.service;

import com.medtrack.model.EquipmentOrder;
import com.medtrack.repository.EquipmentOrderRepository;
import com.medtrack.supplier.exception.InvalidSupplierOrderTransitionException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class SupplierOrderWorkflowServiceTest {

    @Mock
    private EquipmentOrderRepository orderRepository;

    private SupplierOrderWorkflowService service;

    @BeforeEach
    void setUp() {
        service = new SupplierOrderWorkflowService(orderRepository);
    }

    @Test
    void advancesPendingOrderToShipped() {
        EquipmentOrder order = EquipmentOrder.builder().id(12L).status("PENDING").build();
        when(orderRepository.findById(12L)).thenReturn(Optional.of(order));
        when(orderRepository.save(order)).thenReturn(order);

        EquipmentOrder updated = service.updateStatus(12L, "shipped", "Collected by approved carrier");

        ArgumentCaptor<EquipmentOrder> savedOrder = ArgumentCaptor.forClass(EquipmentOrder.class);
        verify(orderRepository).save(savedOrder.capture());
        assertEquals("SHIPPED", updated.getStatus());
        assertEquals("Collected by approved carrier", savedOrder.getValue().getSupplierNotes());
    }

    @Test
    void rejectsSkippingDirectlyFromPendingToDelivered() {
        EquipmentOrder order = EquipmentOrder.builder().id(12L).status("PENDING").build();
        when(orderRepository.findById(12L)).thenReturn(Optional.of(order));

        assertThrows(InvalidSupplierOrderTransitionException.class,
                () -> service.updateStatus(12L, "DELIVERED", "Skipped shipment evidence"));
    }

    @Test
    void defaultsDemandQueueToPendingOrders() {
        service.getDemandOrders(null);

        verify(orderRepository).findByStatus("PENDING");
    }
}
