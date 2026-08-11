package com.medtrack.supplier.service;

import com.medtrack.supplier.dto.FulfillmentStatusDistribution;
import com.medtrack.supplier.dto.FulfillmentSummaryResponse;
import com.medtrack.supplier.model.ShipmentStatus;
import com.medtrack.supplier.repository.ShipmentTrackingRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class SupplierFulfillmentService {

    private final ShipmentTrackingRepository shipmentTrackingRepository;

    @Transactional(readOnly = true)
    public FulfillmentSummaryResponse getFulfillmentSummary(Long supplierId, LocalDateTime from, LocalDateTime to) {

        long totalOrders = shipmentTrackingRepository.countTotalShipments(supplierId, from, to);
        long activeShipments = shipmentTrackingRepository.countActiveShipments(supplierId, ShipmentStatus.DELIVERED,
                from, to);
        long delayedShipments = shipmentTrackingRepository.countDelayedActiveShipments(supplierId,
                ShipmentStatus.DELIVERED, from, to);
        long onTimeDeliveries = shipmentTrackingRepository.countOnTimeDeliveries(supplierId, ShipmentStatus.DELIVERED,
                from, to);
        long lateDeliveries = shipmentTrackingRepository.countLateDeliveries(supplierId, ShipmentStatus.DELIVERED, from,
                to);
        long deliveredCount = shipmentTrackingRepository.countDeliveredShipments(supplierId, ShipmentStatus.DELIVERED,
                from, to);

        // Performance Logic Enhancement
        double onTimeDeliveryRate = 0.0;
        if (deliveredCount > 0) {
            onTimeDeliveryRate = (double) onTimeDeliveries / deliveredCount * 100.0;
            // Bound between 0 and 100
            onTimeDeliveryRate = Math.max(0.0, Math.min(100.0, onTimeDeliveryRate));
        }

        // Aggregate Status Distribution
        long pending = 0;
        long confirmed = 0;
        long shipped = 0;
        long delivered = 0;

        List<Object[]> statusCounts = shipmentTrackingRepository.countShipmentsByStatus(supplierId, from, to);
        for (Object[] result : statusCounts) {
            ShipmentStatus status = (ShipmentStatus) result[0];
            long count = ((Number) result[1]).longValue();

            switch (status) {
                case PENDING:
                    pending = count;
                    break;
                case CONFIRMED:
                    confirmed = count;
                    break;
                case SHIPPED:
                    shipped = count;
                    break;
                case DELIVERED:
                    delivered = count;
                    break;
            }
        }

        FulfillmentStatusDistribution distribution = FulfillmentStatusDistribution.builder()
                .pending(pending)
                .confirmed(confirmed)
                .shipped(shipped)
                .delivered(delivered)
                .build();

        return FulfillmentSummaryResponse.builder()
                .totalOrders(totalOrders)
                .activeShipments(activeShipments)
                .delayedShipments(delayedShipments)
                .onTimeDeliveries(onTimeDeliveries)
                .lateDeliveries(lateDeliveries)
                .onTimeDeliveryRate(onTimeDeliveryRate)
                .deliveryStatusDistribution(distribution)
                .build();
    }
}
