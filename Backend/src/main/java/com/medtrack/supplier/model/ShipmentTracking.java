package com.medtrack.supplier.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "shipment_trackings", uniqueConstraints = {
        @UniqueConstraint(columnNames = "shipmentTrackingNumber", name = "uk_shipment_tracking_number")
})
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ShipmentTracking {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long orderId;

    @Column(nullable = false, unique = true, length = 100)
    private String shipmentTrackingNumber;

    @Column
    private LocalDateTime estimatedDeliveryDate;

    @Column
    private LocalDateTime actualDeliveryDate;

    @Builder.Default
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 50)
    private ShipmentStatus shipmentStatus = ShipmentStatus.PENDING;

    @Column(nullable = false)
    private Long supplierId;

    @Builder.Default
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column
    private LocalDateTime updatedAt;

    @Builder.Default
    @Column(nullable = false)
    private boolean delayDetected = false;

    @Builder.Default
    @OneToMany(mappedBy = "shipmentTracking", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<ShipmentTimelineEntry> timeline = new ArrayList<>();

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }

    public void addTimelineEvent(ShipmentStatus prev, ShipmentStatus next, String trackingInfo) {
        ShipmentTimelineEntry entry = ShipmentTimelineEntry.builder()
                .shipmentTracking(this)
                .eventTimestamp(LocalDateTime.now())
                .previousStatus(prev)
                .newStatus(next)
                .trackingInformation(trackingInfo)
                .build();
        this.timeline.add(entry);
    }
}
