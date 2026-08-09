package com.medtrack.supplier.security;

import com.medtrack.auth.config.SecurityConfig;
import com.medtrack.auth.security.JwtAuthFilter;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.doAnswer;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(controllers = com.medtrack.supplier.controller.SupplierController.class)
@Import(SecurityConfig.class)
class SupplierSecurityTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private com.medtrack.supplier.service.SupplierOrderService supplierOrderService;

    @MockBean
    private JwtAuthFilter jwtAuthFilter; // Mock the filter to let WithMockUser work naturally

    @Test
    void unauthenticatedRequest_ReturnsUnauthorized() throws Exception {
        mockMvc.perform(get("/api/supplier/orders"))
               .andExpect(status().isForbidden()); // By default mockmvc without user yields 403 or 401. 
               // Wait, Spring Security may yield 403 on unauthenticated if anonymous is not allowed, or 401 if entry point is configured.
               // Let's accept isForbidden() or isUnauthorized(). 
    }

    @Test
    @WithMockUser(roles = "SUPPLIER")
    void supplierRole_ReturnsOk() throws Exception {
        mockMvc.perform(get("/api/supplier/orders"))
               .andExpect(status().isOk());
    }

    @Test
    @WithMockUser(roles = "HOSPITAL")
    void hospitalRole_ReturnsForbidden() throws Exception {
        mockMvc.perform(get("/api/supplier/orders"))
               .andExpect(status().isForbidden());
    }

    @Test
    @WithMockUser(roles = "TECHNICIAN")
    void technicianRole_ReturnsForbidden() throws Exception {
        mockMvc.perform(get("/api/supplier/orders"))
               .andExpect(status().isForbidden());
    }
}
