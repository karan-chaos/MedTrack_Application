package com.medtrack.supplier;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.medtrack.model.EquipmentOrder;
import com.medtrack.repository.EquipmentOrderRepository;
import com.medtrack.supplier.dto.SupplierOrderUpdateRequest;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.springframework.test.web.servlet.MockMvc;
import org.testcontainers.containers.MySQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

import java.time.LocalDate;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@Testcontainers
class SupplierIntegrationTest {

    @Container
    public static MySQLContainer<?> mysql = new MySQLContainer<>("mysql:8.0.32")
            .withDatabaseName("medtrack_test")
            .withUsername("testuser")
            .withPassword("testpass");

    @DynamicPropertySource
    static void configureProperties(DynamicPropertyRegistry registry) {
        registry.add("spring.datasource.url", mysql::getJdbcUrl);
        registry.add("spring.datasource.username", mysql::getUsername);
        registry.add("spring.datasource.password", mysql::getPassword);
        registry.add("spring.jpa.hibernate.ddl-auto", () -> "create-drop");
        registry.add("spring.security.enabled", () -> "false");
    }

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private EquipmentOrderRepository orderRepository;

    @Autowired
    private ObjectMapper objectMapper;

    private EquipmentOrder savedOrder;

    @BeforeEach
    void setUp() {
        orderRepository.deleteAll();
        EquipmentOrder order = new EquipmentOrder();
        order.setStatus("PENDING");
        order.setOrderDate(java.time.LocalDateTime.now());
        savedOrder = orderRepository.save(order);
    }

    @AfterEach
    void tearDown() {
        orderRepository.deleteAll();
    }

    @Test
    void testGetOrdersAndFilter() throws Exception {
        mockMvc.perform(get("/api/supplier/orders?status=PENDING&page=0&size=10"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content[0].id").value(savedOrder.getId()))
                .andExpect(jsonPath("$.content[0].status").value("PENDING"));
    }

    @Test
    void testFullWorkflowUpdate() throws Exception {
        // Pending to Confirmed
        mockMvc.perform(put("/api/supplier/order/update/" + savedOrder.getId() + "?newStatus=CONFIRMED"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("CONFIRMED"));

        // Confirmed to Shipped
        SupplierOrderUpdateRequest request = new SupplierOrderUpdateRequest("TR-12345", LocalDate.now().plusDays(2),
                "OK");

        mockMvc.perform(put("/api/supplier/order/update/" + savedOrder.getId() + "?newStatus=SHIPPED")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("SHIPPED"))
                .andExpect(jsonPath("$.trackingNumber").value("TR-12345"));
    }
}
