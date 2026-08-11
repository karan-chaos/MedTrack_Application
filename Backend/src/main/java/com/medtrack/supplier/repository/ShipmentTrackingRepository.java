package com.medtrack.supplier.repository;

import com.medtrack.supplier.model.ShipmentStatus;
import com.medtrack.supplier.model.ShipmentTracking;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface ShipmentTrackingRepository extends JpaRepository<ShipmentTracking, Long> {
    List<ShipmentTracking> findByShipmentStatus(ShipmentStatus status);

    Optional<ShipmentTracking> findByShipmentTrackingNumber(String shipmentTrackingNumber);

    Optional<ShipmentTracking> findByOrderId(Long orderId);

    List<ShipmentTracking> findBySupplierId(Long supplierId);

    List<ShipmentTracking> findByEstimatedDeliveryDateBefore(LocalDateTime dateTime);

    // Phase 7: Delay detection - find active (non-delivered) shipments not yet
    // flagged as delayed
    List<ShipmentTracking> findByShipmentStatusNotAndDelayDetectedFalse(ShipmentStatus status);

    // Phase 7: Performance scoring - delivered shipments by supplier
    List<ShipmentTracking> findBySupplierIdAndShipmentStatus(Long supplierId, ShipmentStatus status);

    // Phase 7: Performance scoring - counts
    long countBySupplierId(Long supplierId);

    long countBySupplierIdAndDelayDetectedTrue(Long supplierId);

    // Phase 22: Delay detection – find delivered shipments not yet flagged as
    // delayed
    // (used to catch late-but-delivered shipments)
    List<ShipmentTracking> findByShipmentStatusAndDelayDetectedFalse(ShipmentStatus status);

    // Phase 26: Aggregation queries for Fulfillment Summary
    @Query(value = "SELECT COUNT(s) FROM ShipmentTracking s WHERE s.supplierId = :supplierId AND s.shipmentStatus <> :deliveredStatus AND (:fromDate IS NULL OR s.createdAt >= :fromDate) AND (:toDate IS NULL OR s.createdAt <= :toDate)")
    long countActiveShipments(@Param("supplierId") Long supplierId,
            @Param("deliveredStatus") ShipmentStatus deliveredStatus, @Param("fromDate") LocalDateTime fromDate,
            @Param("toDate") LocalDateTime toDate);

    @Query(value = "SELECT COUNT(s) FROM ShipmentTracking s WHERE s.supplierId = :supplierId AND s.shipmentStatus <> :deliveredStatus AND s.delayDetected = true AND (:fromDate IS NULL OR s.createdAt >= :fromDate) AND (:toDate IS NULL OR s.createdAt <= :toDate)")
    long countDelayedActiveShipments(@Param("supplierId") Long supplierId,
            @Param("deliveredStatus") ShipmentStatus deliveredStatus, @Param("fromDate") LocalDateTime fromDate,
            @Param("toDate") LocalDateTime toDate);

    @Query(value = "SELECT COUNT(s) FROM ShipmentTracking s WHERE s.supplierId = :supplierId AND s.shipmentStatus = :deliveredStatus AND (s.actualDeliveryDate <= s.estimatedDeliveryDate OR s.estimatedDeliveryDate IS NULL) AND (:fromDate IS NULL OR s.createdAt >= :fromDate) AND (:toDate IS NULL OR s.createdAt <= :toDate)")
    long countOnTimeDeliveries(@Param("supplierId") Long supplierId,
            @Param("deliveredStatus") ShipmentStatus deliveredStatus, @Param("fromDate") LocalDateTime fromDate,
            @Param("toDate") LocalDateTime toDate);

    @Query(value = "SELECT COUNT(s) FROM ShipmentTracking s WHERE s.supplierId = :supplierId AND s.shipmentStatus = :deliveredStatus AND s.actualDeliveryDate > s.estimatedDeliveryDate AND (:fromDate IS NULL OR s.createdAt >= :fromDate) AND (:toDate IS NULL OR s.createdAt <= :toDate)")
    long countLateDeliveries(@Param("supplierId") Long supplierId,
            @Param("deliveredStatus") ShipmentStatus deliveredStatus, @Param("fromDate") LocalDateTime fromDate,
            @Param("toDate") LocalDateTime toDate);

    @Query(value = "SELECT COUNT(s) FROM ShipmentTracking s WHERE s.supplierId = :supplierId AND s.shipmentStatus = :deliveredStatus AND (:fromDate IS NULL OR s.createdAt >= :fromDate) AND (:toDate IS NULL OR s.createdAt <= :toDate)")
    long countDeliveredShipments(@Param("supplierId") Long supplierId,
            @Param("deliveredStatus") ShipmentStatus deliveredStatus, @Param("fromDate") LocalDateTime fromDate,
            @Param("toDate") LocalDateTime toDate);

    @Query(value = "SELECT COUNT(s) FROM ShipmentTracking s WHERE s.supplierId = :supplierId AND (:fromDate IS NULL OR s.createdAt >= :fromDate) AND (:toDate IS NULL OR s.createdAt <= :toDate)")
    long countTotalShipments(@Param("supplierId") Long supplierId, @Param("fromDate") LocalDateTime fromDate,
            @Param("toDate") LocalDateTime toDate);

    @Query(value = "SELECT s.shipmentStatus, COUNT(s) FROM ShipmentTracking s WHERE s.supplierId = :supplierId AND (:fromDate IS NULL OR s.createdAt >= :fromDate) AND (:toDate IS NULL OR s.createdAt <= :toDate) GROUP BY s.shipmentStatus")
    List<Object[]> countShipmentsByStatus(@Param("supplierId") Long supplierId,
            @Param("fromDate") LocalDateTime fromDate, @Param("toDate") LocalDateTime toDate);
}
