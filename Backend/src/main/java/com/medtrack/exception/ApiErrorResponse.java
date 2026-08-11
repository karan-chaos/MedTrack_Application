package com.medtrack.exception;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import com.fasterxml.jackson.annotation.JsonInclude;

import java.time.LocalDateTime;
import java.util.Map;

/**
 * ApiErrorResponse encapsulates API errors mapping message, optional validation errors by field name,
 * and a timestamp of the error occurrence.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class ApiErrorResponse {

    @Builder.Default
    private LocalDateTime timestamp = LocalDateTime.now();

    private String message;
    private Map<String, String> errors;
}
