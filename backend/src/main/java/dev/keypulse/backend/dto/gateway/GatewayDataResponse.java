package dev.keypulse.backend.dto.gateway;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GatewayDataResponse {
    private String status;
    private String authenticatedKey;
    private String environment;
    private LocalDateTime timestamp;
    private Map<String, Object> data;
}
