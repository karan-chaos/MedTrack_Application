package com.medtrack.supplier.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.medtrack.model.EquipmentOrder;
import com.medtrack.supplier.dto.SupplierOrderUpdateRequest;
import com.medtrack.supplier.service.SupplierOrderService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDate;
import java.util.Collections;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(controllers = SupplierController.class, properties = "spring.security.enabled=false")
@AutoConfigureMockMvc(addFilters = false) // Disable security filters for unit test
class SupplierControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private SupplierOrderService supplierOrderService;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    void getOrders_ReturnsPagination() throws Exception {
        EquipmentOrder order = EquipmentOrder.builder().id(1L).status("PENDING").build();
        Page<EquipmentOrder> page = new PageImpl<>(Collections.singletonList(order));
        
        when(supplierOrderService.getOrders(eq("PENDING"), any(Pageable.class))).thenReturn(page);

        mockMvc.perform(get("/api/supplier/orders")
                .param("status", "PENDING")
                .param("page", "0")
                .param("size", "20"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content[0].id").value(1));
    }

    @Test
    void updateOrder_ReturnsUpdatedOrder() throws Exception {
        EquipmentOrder order = EquipmentOrder.builder().id(2L).status("SHIPPED").build();
        SupplierOrderUpdateRequest request = new SupplierOrderUpdateRequest("TRACK123", LocalDate.now(), "Notes");
        
        when(supplierOrderService.updateOrder(eq(2L), eq("SHIPPED"), any())).thenReturn(order);

        mockMvc.perform(put("/api/supplier/order/update/2")
                .param("newStatus", "SHIPPED")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(2))
                .andExpect(jsonPath("$.status").value("SHIPPED"));
    }
}
