package com.medtrack.repository;

import com.medtrack.model.EquipmentOrder;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface EquipmentOrderRepository extends JpaRepository<EquipmentOrder, Long> {
    Optional<EquipmentOrder> findByOrderCode(String orderCode);
    List<EquipmentOrder> findByStatus(String status);
    Page<EquipmentOrder> findByStatus(String status, Pageable pageable);
}
