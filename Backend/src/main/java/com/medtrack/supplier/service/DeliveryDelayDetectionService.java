package com.medtrack.supplier.service;

import com.medtrack.supplier.event.ShipmentDelayedEvent;
import com.medtrack.supplier.model.ShipmentStatus;
import com.medtrack.supplier.model.ShipmentTracking;
import com.medtrack.supplier.repository.ShipmentTrackingRepository;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Phase 22 – Delivery Delay Detection Service (strengthened).
 *
 * <p>
 * Polls the shipment repository on a fixed schedule and:
 * <ol>
 * <li>Flags non-delivered shipments whose ETA has <em>passed</em> as delayed
 * and publishes
 * {@link ShipmentDelayedEvent} exactly once (idempotency via
 * {@code delayDetected} flag).</li>
 * <li>Flags <em>delivered</em> shipments where
 * {@code actualDeliveryDate > estimatedDeliveryDate}
 * as delayed (late-but-delivered path), so performance scoring counts them
 * correctly.</li>
 * <li>Logs an approaching-ETA warning (no Kafka event) for non-delivered
 * shipments
 * within {@code app.delay.approaching-eta.warning-hours} of their ETA.</li>
 * </ol>
 * </p>
 */
@Service
@RequiredArgsConstructor
public class DeliveryDelayDetectionService {

    private static final Logger log = LoggerFactory.getLogger(DeliveryDelayDetectionService.class);

    private final ShipmentTrackingRepository shipmentTrackingRepository;

    @Autowired(required = false)
    private KafkaTemplate<String, Object> kafkaTemplate;

    @Value("${app.kafka.topics.delay-events:delay-events}")
    private String delayEventsTopic;

    @Value("${app.delay.approaching-eta.warning-hours:24}")
    private long approachingEtaWarningHours;

    /**
     * Runs every {@code app.delay.check.interval-ms} milliseconds (default 60 s).
     *
     * <p>
     * Three detection passes per cycle:
     * </p>
     * <ol>
     * <li>Past-ETA for non-delivered shipments → flag + Kafka event</li>
     * <li>Late-but-delivered shipments → flag + Kafka event</li>
     * <li>Approaching-ETA for non-delivered shipments → log warning only</li>
     * </ol>
     */
    @Scheduled(fixedDelayString = "${app.delay.check.interval-ms:60000}")
    public void detectDelays() {
        log.debug("Running delivery delay detection scan...");

        LocalDateTime now = LocalDateTime.now();
        int flaggedCount = 0;

        // --- Pass 1: past-ETA, not yet delivered, not yet flagged ---
        List<ShipmentTracking> pastEtaCandidates = shipmentTrackingRepository
                .findByShipmentStatusNotAndDelayDetectedFalse(ShipmentStatus.DELIVERED);

        for (ShipmentTracking shipment : pastEtaCandidates) {
            if (shipment.getEstimatedDeliveryDate() != null
                    && shipment.getEstimatedDeliveryDate().isBefore(now)) {
                flagSingleDelay(shipment, now);
                flaggedCount++;
            }
        }

        // --- Pass 2: late-but-delivered (actualDeliveryDate > estimatedDeliveryDate),
        // not yet flagged ---
        List<ShipmentTracking> deliveredNotFlagged = shipmentTrackingRepository
                .findByShipmentStatusAndDelayDetectedFalse(ShipmentStatus.DELIVERED);

        for (ShipmentTracking shipment : deliveredNotFlagged) {
            if (shipment.getActualDeliveryDate() != null
                    && shipment.getEstimatedDeliveryDate() != null
                    && shipment.getActualDeliveryDate().isAfter(shipment.getEstimatedDeliveryDate())) {
                flagSingleDelay(shipment, shipment.getActualDeliveryDate());
                flaggedCount++;
            }
        }

        // --- Pass 3: approaching ETA – log-only warning, no Kafka event ---
        detectApproachingEta(now);

        if (flaggedCount > 0) {
            log.info("Delay detection scan complete. Flagged {} delayed shipment(s).", flaggedCount);
        } else {
            log.debug("Delay detection scan complete. No new delayed shipments found.");
        }
    }

    /**
     * Flags a single shipment as delayed, persists the flag, and publishes the
     * Kafka event.
     * Wrapped in its own transaction so a failure on one shipment does not roll
     * back others.
     * The {@code delayDetected} in-memory check guards against concurrent calls.
     */
    @Transactional
    public void flagSingleDelay(ShipmentTracking shipment, LocalDateTime detectedAt) {
        if (shipment.isDelayDetected()) {
            return; // already flagged – idempotency guard
        }

        shipment.setDelayDetected(true);
        shipment.setUpdatedAt(LocalDateTime.now());
        ShipmentTracking saved = shipmentTrackingRepository.save(shipment);

        log.warn("Shipment [id={}, tracking={}] is delayed. Estimated: {}, Detected at: {}",
                saved.getId(), saved.getShipmentTrackingNumber(),
                saved.getEstimatedDeliveryDate(), detectedAt);

        publishDelayEvent(saved, detectedAt);
    }

    // -------------------------------------------------------------------------
    // Private helpers
    // -------------------------------------------------------------------------

    /**
     * Emits a log warning for shipments approaching (within warning window) their
     * ETA
     * but not yet delivered and not yet flagged as delayed.
     * No Kafka event is published for this condition.
     */
    private void detectApproachingEta(LocalDateTime now) {
        LocalDateTime warningThreshold = now.plusHours(approachingEtaWarningHours);

        List<ShipmentTracking> approaching = shipmentTrackingRepository
                .findByShipmentStatusNotAndDelayDetectedFalse(ShipmentStatus.DELIVERED);

        for (ShipmentTracking shipment : approaching) {
            LocalDateTime eta = shipment.getEstimatedDeliveryDate();
            if (eta != null && !eta.isBefore(now) && eta.isBefore(warningThreshold)) {
                log.warn(
                        "Shipment [id={}, tracking={}] is approaching ETA within {} hours. ETA: {}",
                        shipment.getId(),
                        shipment.getShipmentTrackingNumber(),
                        approachingEtaWarningHours,
                        eta);
            }
        }
    }

    private void publishDelayEvent(ShipmentTracking shipment, LocalDateTime detectedAt) {
        if (kafkaTemplate == null) {
            log.warn("KafkaTemplate not available. Skipping delay event for shipment ID: {}", shipment.getId());
            return;
        }
        try {
            ShipmentDelayedEvent event = ShipmentDelayedEvent.builder()
                    .shipmentId(shipment.getId())
                    .orderId(shipment.getOrderId())
                    .supplierId(shipment.getSupplierId())
                    .shipmentTrackingNumber(shipment.getShipmentTrackingNumber())
                    .estimatedDeliveryDate(shipment.getEstimatedDeliveryDate())
                    .detectedAt(detectedAt)
                    .build();
            kafkaTemplate.send(delayEventsTopic, String.valueOf(shipment.getId()), event);
            log.info("Published ShipmentDelayedEvent for shipment ID: {}", shipment.getId());
        } catch (Exception e) {
            log.error("Failed to publish delay event for shipment ID: {} – {}", shipment.getId(), e.getMessage(), e);
        }
    }
}
