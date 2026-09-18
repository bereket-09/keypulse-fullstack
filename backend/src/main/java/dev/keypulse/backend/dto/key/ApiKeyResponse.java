package dev.keypulse.backend.dto.key;

import dev.keypulse.backend.model.ApiKey;
import dev.keypulse.backend.model.Environment;
import dev.keypulse.backend.model.KeyStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.Set;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ApiKeyResponse {
    private Long id;
    private String name;
    private String description;
    private String keyPrefix;
    private Environment environment;
    private KeyStatus status;
    private Integer rateLimitPerMinute;
    private Set<String> scopes;
    private LocalDateTime expiresAt;
    private LocalDateTime lastUsedAt;
    private LocalDateTime createdAt;
    private boolean isExpired;

    public static ApiKeyResponse fromEntity(ApiKey apiKey) {
        return ApiKeyResponse.builder()
                .id(apiKey.getId())
                .name(apiKey.getName())
                .description(apiKey.getDescription())
                .keyPrefix(apiKey.getKeyPrefix())
                .environment(apiKey.getEnvironment())
                .status(apiKey.getStatus())
                .rateLimitPerMinute(apiKey.getRateLimitPerMinute())
                .scopes(apiKey.getScopes())
                .expiresAt(apiKey.getExpiresAt())
                .lastUsedAt(apiKey.getLastUsedAt())
                .createdAt(apiKey.getCreatedAt())
                .isExpired(apiKey.isExpired())
                .build();
    }
}
