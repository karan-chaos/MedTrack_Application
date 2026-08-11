package com.medtrack.supplier.service;

import com.medtrack.supplier.dto.FulfillmentSummaryResponse;
import com.medtrack.supplier.model.ShipmentStatus;
import com.medtrack.supplier.repository.ShipmentTrackingRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
public class SupplierFulfillmentServiceTest {

    @Mock
    private ShipmentTrackingRepository shipmentTrackingRepository;

    private SupplierFulfillmentService service;

    @BeforeEach
    void setUp() {
        service = new SupplierFulfillmentService(shipmentTrackingRepository);
    }

    @Test
    void getFulfillmentSummary_Success() {
        Long supplierId = 1L;
        LocalDateTime from = LocalDateTime.now().minusDays(10);
        LocalDateTime to = LocalDateTime.now();

        when(shipmentTrackingRepository.countTotalShipments(supplierId, from, to)).thenReturn(100L);
        when(shipmentTrackingRepository.countActiveShipments(supplierId, ShipmentStatus.DELIVERED, from, to))
                .thenReturn(20L);
        when(shipmentTrackingRepository.countDelayedActiveShipments(supplierId, ShipmentStatus.DELIVERED, from, to))
                .thenReturn(5L);
        when(shipmentTrackingRepository.countOnTimeDeliveries(supplierId, ShipmentStatus.DELIVERED, from, to))
                .thenReturn(70L);
        when(shipmentTrackingRepository.countLateDeliveries(supplierId, ShipmentStatus.DELIVERED, from, to))
                .thenReturn(10L);
        when(shipmentTrackingRepository.countDeliveredShipments(supplierId, ShipmentStatus.DELIVERED, from, to))
                .thenReturn(80L);

        Object[] status1 = new Object[] { ShipmentStatus.PENDING, 10L };
        Object[] status2 = new Object[] { ShipmentStatus.CONFIRMED, 10L };
        Object[] status3 = new Object[] { ShipmentStatus.SHIPPED, 20L };
        Object[] status4 = new Object[] { ShipmentStatus.DELIVERED, 60L };

        when(shipmentTrackingRepository.countShipmentsByStatus(supplierId, from, to))
                .thenReturn(List.of(status1, status2, status3, status4));

        FulfillmentSummaryResponse response = service.getFulfillmentSummary(supplierId, from, to);

        assertEquals(100L, response.getTotalOrders());
        assertEquals(20L, response.getActiveShipments());
        assertEquals(5L, response.getDelayedShipments());
        assertEquals(70L, response.getOnTimeDeliveries());
        assertEquals(10L, response.getLateDeliveries());
        assertEquals(87.5, response.getOnTimeDeliveryRate(), 0.001);

        assertEquals(10L, response.getDeliveryStatusDistribution().getPending());
        assertEquals(10L, response.getDeliveryStatusDistribution().getConfirmed());
        assertEquals(20L, response.getDeliveryStatusDistribution().getShipped());
        assertEquals(60L, response.getDeliveryStatusDistribution().getDelivered());
    }

    @Test
    void getFulfillmentSummary_NoDeliveries_ZeroRate() {
        Long supplierId = 2L;

        when(shipmentTrackingRepository.countDeliveredShipments(eq(supplierId), eq(ShipmentStatus.DELIVERED), any(),
                any()))
                .thenReturn(0L);

        when(shipmentTrackingRepository.countShipmentsByStatus(eq(supplierId), any(), any()))
                .thenReturn(List.of());

        FulfillmentSummaryResponse response = service.getFulfillmentSummary(supplierId, null, null);

        assertEquals(0.0, response.getOnTimeDeliveryRate());
    }
}
