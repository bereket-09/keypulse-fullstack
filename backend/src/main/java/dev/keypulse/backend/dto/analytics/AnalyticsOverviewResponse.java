package dev.keypulse.backend.dto.analytics;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AnalyticsOverviewResponse {
    private long totalRequests;
    private long successfulRequests;
    private long rateLimitedRequests;
    private long errorRequests;
    private double successRate;
    private double averageLatencyMs;
    private long activeKeysCount;
    private long totalKeysCount;
}
