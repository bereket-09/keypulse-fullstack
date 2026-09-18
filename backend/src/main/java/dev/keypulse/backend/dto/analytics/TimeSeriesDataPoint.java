package dev.keypulse.backend.dto.analytics;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TimeSeriesDataPoint {
    private String timestamp;
    private long total;
    private long success;
    private long rateLimited;
    private long error;
    private double avgLatencyMs;
}
