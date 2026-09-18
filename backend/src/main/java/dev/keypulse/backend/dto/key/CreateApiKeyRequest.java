package dev.keypulse.backend.dto.key;

import dev.keypulse.backend.model.Environment;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.util.Set;

@Data
public class CreateApiKeyRequest {

    @NotBlank(message = "Key name is required")
    private String name;

    private String description;

    @NotNull(message = "Environment is required")
    private Environment environment = Environment.DEVELOPMENT;

    @Min(value = 5, message = "Rate limit must be at least 5 req/min")
    @Max(value = 1000, message = "Rate limit cannot exceed 1000 req/min")
    private Integer rateLimitPerMinute = 60;

    private Set<String> scopes;

    // Optional expiry in days (e.g. 30, 60, 90, null for never)
    private Integer expiresInDays;
}
