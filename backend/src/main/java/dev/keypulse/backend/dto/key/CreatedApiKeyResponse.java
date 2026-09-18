package dev.keypulse.backend.dto.key;

import dev.keypulse.backend.model.ApiKey;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreatedApiKeyResponse {
    private ApiKeyResponse keyDetails;
    private String rawKey;
    private String warning;

    public static CreatedApiKeyResponse of(ApiKey apiKey, String rawKey) {
        return CreatedApiKeyResponse.builder()
                .keyDetails(ApiKeyResponse.fromEntity(apiKey))
                .rawKey(rawKey)
                .warning("Please store this key securely. You will not be able to view it again.")
                .build();
    }
}
