package com.medtrack.supplier.service;

import com.medtrack.exception.DuplicateTrackingNumberException;
import com.medtrack.exception.InvalidStatusTransitionException;
import com.medtrack.exception.ResourceNotFoundException;
import com.medtrack.model.EquipmentOrder;
import com.medtrack.repository.EquipmentOrderRepository;
import com.medtrack.supplier.dto.CreateShipmentRequest;
import com.medtrack.supplier.dto.ShipmentTrackingDetailResponse;
import com.medtrack.supplier.dto.ShipmentTrackingResponse;
import com.medtrack.supplier.dto.UpdateShipmentStatusRequest;
import com.medtrack.supplier.model.ShipmentStatus;
import com.medtrack.supplier.model.ShipmentTimelineEntry;
import com.medtrack.supplier.model.ShipmentTracking;
import com.medtrack.supplier.repository.ShipmentTrackingRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class ShipmentTrackingServiceTest {

        @Mock
        private ShipmentTrackingRepository shipmentTrackingRepository;

        @Mock
        private EquipmentOrderRepository orderRepository;

        @InjectMocks
        private ShipmentTrackingService shipmentTrackingService;

        @Test
        void createShipment_Success() {
                CreateShipmentRequest request = CreateShipmentRequest.builder()
                                .orderId(1L)
                                .shipmentTrackingNumber("TRK123456")
                                .carrier("FedEx")
                                .estimatedDeliveryDate(LocalDateTime.now().plusDays(3))
                                .supplierId(10L)
                                .build();

                EquipmentOrder order = EquipmentOrder.builder()
                                .id(1L)
                                .status("PENDING")
                                .build();

                ShipmentTracking shipment = ShipmentTracking.builder()
                                .id(5L)
                                .orderId(1L)
                                .shipmentTrackingNumber("TRK123456")
                                .shipmentStatus(ShipmentStatus.PENDING)
                                .supplierId(10L)
                                .createdAt(LocalDateTime.now())
                                .build();

                when(orderRepository.findById(1L)).thenReturn(Optional.of(order));
                when(shipmentTrackingRepository.findByOrderId(1L)).thenReturn(Optional.empty());
                when(shipmentTrackingRepository.findByShipmentTrackingNumber("TRK123456")).thenReturn(Optional.empty());
                when(shipmentTrackingRepository.save(any(ShipmentTracking.class))).thenReturn(shipment);

                ShipmentTrackingResponse response = shipmentTrackingService.createShipment(request);

                assertNotNull(response);
                assertEquals(5L, response.getId());
                assertEquals("TRK123456", response.getShipmentTrackingNumber());
                assertEquals("PENDING", response.getShipmentStatus());
                assertEquals("CONFIRMED", order.getStatus());
                assertEquals("TRK123456", order.getTrackingNo());
                assertEquals("FedEx", order.getCarrier());

                verify(orderRepository).save(order);
                verify(shipmentTrackingRepository).save(any(ShipmentTracking.class));
        }

        @Test
        void createShipment_OrderNotFound_ThrowsException() {
                CreateShipmentRequest request = CreateShipmentRequest.builder()
                                .orderId(1L)
                                .shipmentTrackingNumber("TRK123456")
                                .build();

                when(orderRepository.findById(1L)).thenReturn(Optional.empty());

                assertThrows(ResourceNotFoundException.class, () -> shipmentTrackingService.createShipment(request));
                verify(shipmentTrackingRepository, never()).save(any());
        }

        @Test
        void createShipment_DuplicateShipmentForOrder_ThrowsException() {
                CreateShipmentRequest request = CreateShipmentRequest.builder()
                                .orderId(1L)
                                .shipmentTrackingNumber("TRK123456")
                                .build();

                EquipmentOrder order = EquipmentOrder.builder().id(1L).build();
                ShipmentTracking existingShipment = ShipmentTracking.builder().id(5L).orderId(1L).build();

                when(orderRepository.findById(1L)).thenReturn(Optional.of(order));
                when(shipmentTrackingRepository.findByOrderId(1L)).thenReturn(Optional.of(existingShipment));

                assertThrows(IllegalArgumentException.class, () -> shipmentTrackingService.createShipment(request));
                verify(shipmentTrackingRepository, never()).save(any());
        }

        @Test
        void createShipment_DuplicateTrackingNumber_ThrowsException() {
                CreateShipmentRequest request = CreateShipmentRequest.builder()
                                .orderId(1L)
                                .shipmentTrackingNumber("TRK123456")
                                .build();

                EquipmentOrder order = EquipmentOrder.builder().id(1L).build();
                ShipmentTracking existingShipment = ShipmentTracking.builder().id(6L)
                                .shipmentTrackingNumber("TRK123456").build();

                when(orderRepository.findById(1L)).thenReturn(Optional.of(order));
                when(shipmentTrackingRepository.findByOrderId(1L)).thenReturn(Optional.empty());
                when(shipmentTrackingRepository.findByShipmentTrackingNumber("TRK123456"))
                                .thenReturn(Optional.of(existingShipment));

                assertThrows(DuplicateTrackingNumberException.class,
                                () -> shipmentTrackingService.createShipment(request));
                verify(shipmentTrackingRepository, never()).save(any());
        }

        @Test
        void createShipment_PastDeliveryDate_ThrowsException() {
                CreateShipmentRequest request = CreateShipmentRequest.builder()
                                .orderId(1L)
                                .shipmentTrackingNumber("TRK123456")
                                .estimatedDeliveryDate(LocalDateTime.now().minusDays(1)) // Past date
                                .build();

                EquipmentOrder order = EquipmentOrder.builder().id(1L).build();

                when(orderRepository.findById(1L)).thenReturn(Optional.of(order));
                when(shipmentTrackingRepository.findByOrderId(1L)).thenReturn(Optional.empty());
                when(shipmentTrackingRepository.findByShipmentTrackingNumber("TRK123456")).thenReturn(Optional.empty());

                assertThrows(IllegalArgumentException.class, () -> shipmentTrackingService.createShipment(request));
                verify(shipmentTrackingRepository, never()).save(any());
        }

        @Test
        void updateShipmentStatus_ToShipped_Success() {
                UpdateShipmentStatusRequest request = UpdateShipmentStatusRequest.builder()
                                .shipmentStatus("SHIPPED")
                                .supplierNotes("Handed to carrier")
                                .build();

                ShipmentTracking shipment = ShipmentTracking.builder()
                                .id(5L)
                                .orderId(1L)
                                .shipmentStatus(ShipmentStatus.PENDING)
                                .build();

                EquipmentOrder order = EquipmentOrder.builder()
                                .id(1L)
                                .status("CONFIRMED")
                                .build();

                when(shipmentTrackingRepository.findById(5L)).thenReturn(Optional.of(shipment));
                when(shipmentTrackingRepository.save(any(ShipmentTracking.class))).thenReturn(shipment);
                when(orderRepository.findById(1L)).thenReturn(Optional.of(order));

                ShipmentTrackingResponse response = shipmentTrackingService.updateShipmentStatus(5L, request);

                assertNotNull(response);
                assertEquals("SHIPPED", response.getShipmentStatus());
                assertEquals("IN_TRANSIT", order.getStatus());
                assertEquals("Shipped", order.getShippingStatus());
                assertEquals("Handed to carrier", order.getSupplierNotes());
                assertNotNull(order.getDispatchedAt());

                verify(shipmentTrackingRepository).save(shipment);
                verify(orderRepository).save(order);
        }

        @Test
        void updateShipmentStatus_ToDelivered_Success() {
                UpdateShipmentStatusRequest request = UpdateShipmentStatusRequest.builder()
                                .shipmentStatus("DELIVERED")
                                .build();

                ShipmentTracking shipment = ShipmentTracking.builder()
                                .id(5L)
                                .orderId(1L)
                                .shipmentStatus(ShipmentStatus.SHIPPED)
                                .shipmentTrackingNumber("TRK-DELIVERED-001")
                                .build();

                EquipmentOrder order = EquipmentOrder.builder()
                                .id(1L)
                                .status("IN_TRANSIT")
                                .build();

                when(shipmentTrackingRepository.findById(5L)).thenReturn(Optional.of(shipment));
                when(shipmentTrackingRepository.save(any(ShipmentTracking.class))).thenReturn(shipment);
                when(orderRepository.findById(1L)).thenReturn(Optional.of(order));

                ShipmentTrackingResponse response = shipmentTrackingService.updateShipmentStatus(5L, request);

                assertNotNull(response);
                assertEquals("DELIVERED", response.getShipmentStatus());
                assertEquals("DELIVERED", order.getStatus());
                assertEquals("Delivered", order.getShippingStatus());
                assertNotNull(order.getDeliveredAt());
                assertNotNull(shipment.getActualDeliveryDate());

                verify(shipmentTrackingRepository).save(shipment);
                verify(orderRepository).save(order);
        }

        @Test
        void updateShipmentStatus_InvalidTransition_ThrowsException() {
                UpdateShipmentStatusRequest request = UpdateShipmentStatusRequest.builder()
                                .shipmentStatus("PENDING") // Cannot transition back from SHIPPED to PENDING
                                .build();

                ShipmentTracking shipment = ShipmentTracking.builder()
                                .id(5L)
                                .shipmentStatus(ShipmentStatus.SHIPPED)
                                .build();

                when(shipmentTrackingRepository.findById(5L)).thenReturn(Optional.of(shipment));

                assertThrows(InvalidStatusTransitionException.class,
                                () -> shipmentTrackingService.updateShipmentStatus(5L, request));
                verify(shipmentTrackingRepository, never()).save(any());
        }

        @Test
        void updateShipmentStatus_SameStatus_ThrowsException() {
                UpdateShipmentStatusRequest request = UpdateShipmentStatusRequest.builder()
                                .shipmentStatus("SHIPPED") // Same state
                                .build();

                ShipmentTracking shipment = ShipmentTracking.builder()
                                .id(5L)
                                .shipmentStatus(ShipmentStatus.SHIPPED)
                                .build();

                when(shipmentTrackingRepository.findById(5L)).thenReturn(Optional.of(shipment));

                assertThrows(InvalidStatusTransitionException.class,
                                () -> shipmentTrackingService.updateShipmentStatus(5L, request));
                verify(shipmentTrackingRepository, never()).save(any());
        }

        @Test
        void updateShipmentStatus_SameStatus_Delivered_Harmless() {
                UpdateShipmentStatusRequest request = UpdateShipmentStatusRequest.builder()
                                .shipmentStatus("DELIVERED") // Same state, should bypass exception
                                .build();

                ShipmentTracking shipment = ShipmentTracking.builder()
                                .id(5L)
                                .shipmentStatus(ShipmentStatus.DELIVERED)
                                .build();

                when(shipmentTrackingRepository.findById(5L)).thenReturn(Optional.of(shipment));

                ShipmentTrackingResponse response = shipmentTrackingService.updateShipmentStatus(5L, request);

                assertNotNull(response);
                assertEquals("DELIVERED", response.getShipmentStatus());
                verify(shipmentTrackingRepository, never()).save(any());
        }

        @Test
        void getShipmentById_Success() {
                ShipmentTracking shipment = ShipmentTracking.builder()
                                .id(5L)
                                .orderId(1L)
                                .shipmentTrackingNumber("TRK123")
                                .shipmentStatus(ShipmentStatus.PENDING)
                                .build();

                when(shipmentTrackingRepository.findById(5L)).thenReturn(Optional.of(shipment));

                ShipmentTrackingResponse response = shipmentTrackingService.getShipmentById(5L);

                assertNotNull(response);
                assertEquals(5L, response.getId());
                assertEquals("TRK123", response.getShipmentTrackingNumber());
        }

        // ===== Phase 22: Tracking number format validation =====

        @Test
        void createShipment_InvalidTrackingNumberFormat_ThrowsException() {
                CreateShipmentRequest request = CreateShipmentRequest.builder()
                                .orderId(1L)
                                .shipmentTrackingNumber("!@invalid#") // contains invalid chars
                                .carrier("FedEx")
                                .supplierId(10L)
                                .build();

                EquipmentOrder order = EquipmentOrder.builder().id(1L).build();

                when(orderRepository.findById(1L)).thenReturn(Optional.of(order));
                when(shipmentTrackingRepository.findByOrderId(1L)).thenReturn(Optional.empty());

                assertThrows(IllegalArgumentException.class,
                                () -> shipmentTrackingService.createShipment(request));
                verify(shipmentTrackingRepository, never()).save(any());
        }

        @Test
        void createShipment_TooShortTrackingNumber_ThrowsException() {
                CreateShipmentRequest request = CreateShipmentRequest.builder()
                                .orderId(1L)
                                .shipmentTrackingNumber("AB") // only 2 chars, below minimum of 3
                                .carrier("FedEx")
                                .supplierId(10L)
                                .build();

                EquipmentOrder order = EquipmentOrder.builder().id(1L).build();

                when(orderRepository.findById(1L)).thenReturn(Optional.of(order));
                when(shipmentTrackingRepository.findByOrderId(1L)).thenReturn(Optional.empty());

                assertThrows(IllegalArgumentException.class,
                                () -> shipmentTrackingService.createShipment(request));
                verify(shipmentTrackingRepository, never()).save(any());
        }

        // ===== Phase 22: DELIVERED requires tracking number =====

        @Test
        void updateShipmentStatus_DeliveredWithoutTrackingNumber_ThrowsException() {
                UpdateShipmentStatusRequest request = UpdateShipmentStatusRequest.builder()
                                .shipmentStatus("DELIVERED")
                                .build();

                ShipmentTracking shipment = ShipmentTracking.builder()
                                .id(5L)
                                .orderId(1L)
                                .shipmentStatus(ShipmentStatus.SHIPPED)
                                .shipmentTrackingNumber(null) // missing tracking number
                                .build();

                when(shipmentTrackingRepository.findById(5L)).thenReturn(Optional.of(shipment));

                assertThrows(IllegalArgumentException.class,
                                () -> shipmentTrackingService.updateShipmentStatus(5L, request));
                verify(shipmentTrackingRepository, never()).save(any());
        }

        @Test
        void updateShipmentStatus_DeliveredWithBlankTrackingNumber_ThrowsException() {
                UpdateShipmentStatusRequest request = UpdateShipmentStatusRequest.builder()
                                .shipmentStatus("DELIVERED")
                                .build();

                ShipmentTracking shipment = ShipmentTracking.builder()
                                .id(5L)
                                .orderId(1L)
                                .shipmentStatus(ShipmentStatus.SHIPPED)
                                .shipmentTrackingNumber("   ") // blank tracking number
                                .build();

                when(shipmentTrackingRepository.findById(5L)).thenReturn(Optional.of(shipment));

                assertThrows(IllegalArgumentException.class,
                                () -> shipmentTrackingService.updateShipmentStatus(5L, request));
                verify(shipmentTrackingRepository, never()).save(any());
        }

        // ===== Phase 22: duplicate timeline guard =====

        @Test
        void updateShipmentStatus_DuplicateTimelineEntry_NoDuplicateAdded() {
                // Simulate a Kafka retry: last timeline entry already records SHIPPED
                ShipmentTimelineEntry existingEntry = ShipmentTimelineEntry.builder()
                                .newStatus(ShipmentStatus.SHIPPED)
                                .previousStatus(ShipmentStatus.CONFIRMED)
                                .eventTimestamp(LocalDateTime.now().minusMinutes(1))
                                .trackingInformation("Shipped")
                                .build();

                List<ShipmentTimelineEntry> timeline = new ArrayList<>();
                timeline.add(existingEntry);

                ShipmentTracking shipment = ShipmentTracking.builder()
                                .id(5L)
                                .orderId(1L)
                                .shipmentStatus(ShipmentStatus.CONFIRMED) // current status is CONFIRMED
                                .shipmentTrackingNumber("TRK-RETRIED")
                                .timeline(timeline)
                                .build();

                EquipmentOrder order = EquipmentOrder.builder().id(1L).status("CONFIRMED").build();

                when(shipmentTrackingRepository.findById(5L)).thenReturn(Optional.of(shipment));
                when(shipmentTrackingRepository.save(any())).thenReturn(shipment);
                when(orderRepository.findById(1L)).thenReturn(Optional.of(order));

                UpdateShipmentStatusRequest request = UpdateShipmentStatusRequest.builder()
                                .shipmentStatus("SHIPPED")
                                .build();

                ShipmentTrackingResponse response = shipmentTrackingService.updateShipmentStatus(5L, request);

                assertNotNull(response);
                assertEquals("SHIPPED", response.getShipmentStatus());
                // Timeline size should remain 1 (no new entry added due to idempotency guard)
                assertEquals(1, shipment.getTimeline().size());
        }

        // ===== Phase 22: delayDetected surfaced in response =====

        @Test
        void getShipmentById_DelayDetectedTrue_SurfacedInResponse() {
                ShipmentTracking shipment = ShipmentTracking.builder()
                                .id(5L)
                                .orderId(1L)
                                .shipmentTrackingNumber("TRK123")
                                .shipmentStatus(ShipmentStatus.SHIPPED)
                                .delayDetected(true)
                                .build();

                when(shipmentTrackingRepository.findById(5L)).thenReturn(Optional.of(shipment));

                ShipmentTrackingResponse response = shipmentTrackingService.getShipmentById(5L);

                assertNotNull(response);
                assertTrue(response.isDelayDetected());
        }

        // ===== Phase 22: getShipmentTrackingDetail =====

        @Test
        void getShipmentTrackingDetail_Success() {
                EquipmentOrder order = EquipmentOrder.builder()
                                .id(1L)
                                .status("IN_TRANSIT")
                                .carrier("DHL")
                                .build();

                ShipmentTracking shipment = ShipmentTracking.builder()
                                .id(5L)
                                .orderId(1L)
                                .shipmentStatus(ShipmentStatus.SHIPPED)
                                .shipmentTrackingNumber("TRK-DETAIL-001")
                                .estimatedDeliveryDate(LocalDateTime.now().plusDays(2))
                                .delayDetected(false)
                                .build();

                when(orderRepository.findById(1L)).thenReturn(Optional.of(order));
                when(shipmentTrackingRepository.findByOrderId(1L)).thenReturn(Optional.of(shipment));

                ShipmentTrackingDetailResponse response = shipmentTrackingService.getShipmentTrackingDetail(1L);

                assertNotNull(response);
                assertEquals(1L, response.getOrderId());
                assertEquals("IN_TRANSIT", response.getOrderStatus());
                assertEquals("SHIPPED", response.getShipmentStatus());
                assertEquals("TRK-DETAIL-001", response.getTrackingNumber());
                assertEquals("DHL", response.getCarrier());
                assertFalse(response.isDelayDetected());
                assertNotNull(response.getTimeline());
        }

        @Test
        void getShipmentTrackingDetail_OrderNotFound_ThrowsException() {
                when(orderRepository.findById(99L)).thenReturn(Optional.empty());

                assertThrows(ResourceNotFoundException.class,
                                () -> shipmentTrackingService.getShipmentTrackingDetail(99L));
        }

        @Test
        void getShipmentTrackingDetail_ShipmentNotFound_ThrowsException() {
                EquipmentOrder order = EquipmentOrder.builder().id(1L).status("CONFIRMED").build();

                when(orderRepository.findById(1L)).thenReturn(Optional.of(order));
                when(shipmentTrackingRepository.findByOrderId(1L)).thenReturn(Optional.empty());

                assertThrows(ResourceNotFoundException.class,
                                () -> shipmentTrackingService.getShipmentTrackingDetail(1L));
        }
}
