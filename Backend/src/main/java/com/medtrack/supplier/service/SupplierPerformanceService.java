package com.medtrack.supplier.service;

import com.medtrack.supplier.dto.SupplierPerformanceResponse;
import com.medtrack.supplier.model.ShipmentStatus;
import com.medtrack.supplier.model.ShipmentTracking;
import com.medtrack.supplier.repository.ShipmentTrackingRepository;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * Phase 7 – Supplier Performance Scoring Service.
 *
 * <p>
 * Calculates supplier performance metrics from completed
 * {@link ShipmentTracking} data.
 * The scoring weights are externalised to {@code application.properties} so
 * they are
 * never hard-coded. All calculation logic stays in this service layer.
 * </p>
 *
 * <p>
 * Score formula:
 * </p>
 * 
 * <pre>
 *   onTimeRate = onTimeShipments / deliveredShipments * 100   (0 when nothing delivered)
 *   delayRatio = delayedShipments / totalShipments             (0 when no shipments)
 *   performanceScore = (onTimeRate * onTimeWeight) + ((1 - delayRatio) * delayPenaltyWeight)
 * </pre>
 */
@Service
@RequiredArgsConstructor
public class SupplierPerformanceService {

        private static final Logger log = LoggerFactory.getLogger(SupplierPerformanceService.class);

        private final ShipmentTrackingRepository shipmentTrackingRepository;

        @Value("${app.supplier.scoring.ontime-weight:0.8}")
        private double onTimeWeight;

        @Value("${app.supplier.scoring.delay-penalty-weight:20.0}")
        private double delayPenaltyWeight;

        /**
         * Returns a full performance report for the given supplier.
         *
         * @param supplierId the supplier ID to score
         * @return {@link SupplierPerformanceResponse} with calculated metrics
         */
        @Transactional(readOnly = true)
        public SupplierPerformanceResponse getPerformance(Long supplierId) {
                long totalShipments = shipmentTrackingRepository.countBySupplierId(supplierId);
                long delayedShipments = shipmentTrackingRepository.countBySupplierIdAndDelayDetectedTrue(supplierId);

                // Fetch delivered shipments
                List<ShipmentTracking> delivered = shipmentTrackingRepository
                                .findBySupplierIdAndShipmentStatus(supplierId, ShipmentStatus.DELIVERED);
                long deliveredShipments = delivered.size();

                // On-time deliveries: delivered and not late.
                // A shipment is on time if actualDeliveryDate <= estimatedDeliveryDate,
                // or if estimatedDeliveryDate is null (we assume on time).
                long onTimeShipments = delivered.stream()
                                .filter(s -> s.getActualDeliveryDate() == null
                                                || s.getEstimatedDeliveryDate() == null
                                                || !s.getActualDeliveryDate().isAfter(s.getEstimatedDeliveryDate()))
                                .count();

                double onTimeDeliveryRate = deliveredShipments > 0
                                ? (double) onTimeShipments / deliveredShipments * 100.0
                                : 0.0;

                onTimeDeliveryRate = Math.max(0.0, Math.min(100.0, onTimeDeliveryRate));

                double delayRatio = totalShipments > 0
                                ? (double) delayedShipments / totalShipments
                                : 0.0;

                double performanceScore = 0.0;

                if (totalShipments > 0) {
                        performanceScore = (onTimeDeliveryRate * onTimeWeight)
                                        + ((1.0 - Math.min(1.0, delayRatio)) * delayPenaltyWeight);
                }

                performanceScore = Math.max(0.0, Math.min(100.0, performanceScore));

                // Consistent rounding to 2 decimal places
                onTimeDeliveryRate = Math.round(onTimeDeliveryRate * 100.0) / 100.0;
                performanceScore = Math.round(performanceScore * 100.0) / 100.0;

                log.debug(
                                "Performance score for supplier {}: total={}, delivered={}, delayed={}, onTime={}, rate={:.2f}, score={:.2f}",
                                supplierId, totalShipments, deliveredShipments, delayedShipments,
                                onTimeShipments, onTimeDeliveryRate, performanceScore);

                return SupplierPerformanceResponse.builder()
                                .supplierId(supplierId)
                                .totalShipments(totalShipments)
                                .deliveredShipments(deliveredShipments)
                                .delayedShipments(delayedShipments)
                                .onTimeShipments(onTimeShipments)
                                .onTimeDeliveryRate(onTimeDeliveryRate)
                                .performanceScore(performanceScore)
                                .build();
        }
}
