package dev.keypulse.backend.dto.analytics;

import dev.keypulse.backend.model.ApiUsageLog;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UsageLogResponse {
    private Long id;
    private String keyName;
    private String keyPrefix;
    private String endpoint;
    private String httpMethod;
    private Integer statusCode;
    private Long latencyMs;
    private String ipAddress;
    private String userAgent;
    private LocalDateTime timestamp;

    public static UsageLogResponse fromEntity(ApiUsageLog log) {
        return UsageLogResponse.builder()
                .id(log.getId())
                .keyName(log.getApiKey() != null ? log.getApiKey().getName() : "Unknown")
                .keyPrefix(log.getApiKey() != null ? log.getApiKey().getKeyPrefix() : "Unknown")
                .endpoint(log.getEndpoint())
                .httpMethod(log.getHttpMethod())
                .statusCode(log.getStatusCode())
                .latencyMs(log.getLatencyMs())
                .ipAddress(log.getIpAddress())
                .userAgent(log.getUserAgent())
                .timestamp(log.getTimestamp())
                .build();
    }
}
