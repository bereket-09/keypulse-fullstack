package dev.keypulse.backend.service;

import dev.keypulse.backend.dto.analytics.AnalyticsOverviewResponse;
import dev.keypulse.backend.dto.analytics.TimeSeriesDataPoint;
import dev.keypulse.backend.dto.analytics.UsageLogResponse;
import dev.keypulse.backend.model.ApiUsageLog;
import dev.keypulse.backend.model.KeyStatus;
import dev.keypulse.backend.repository.ApiKeyRepository;
import dev.keypulse.backend.repository.ApiUsageLogRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AnalyticsService {

    private final ApiUsageLogRepository usageLogRepository;
    private final ApiKeyRepository apiKeyRepository;

    @Transactional(readOnly = true)
    public AnalyticsOverviewResponse getOverview(Long userId) {
        long totalRequests = usageLogRepository.countByApiKey_User_Id(userId);
        long successfulRequests = usageLogRepository.countByApiKey_User_IdAndStatusCodeBetween(userId, 200, 299);
        long rateLimitedRequests = usageLogRepository.countByApiKey_User_IdAndStatusCode(userId, 429);
        long errorRequests = totalRequests - successfulRequests;

        double successRate = totalRequests > 0 ? (successfulRequests * 100.0) / totalRequests : 100.0;
        Double avgLatency = usageLogRepository.calculateAverageLatencyByUserId(userId);
        double avgLatencyMs = avgLatency != null ? Math.round(avgLatency * 10.0) / 10.0 : 0.0;

        long activeKeysCount = apiKeyRepository.countByUserIdAndStatus(userId, KeyStatus.ACTIVE);
        long totalKeysCount = apiKeyRepository.findByUserIdOrderByCreatedAtDesc(userId).size();

        return AnalyticsOverviewResponse.builder()
                .totalRequests(totalRequests)
                .successfulRequests(successfulRequests)
                .rateLimitedRequests(rateLimitedRequests)
                .errorRequests(errorRequests)
                .successRate(Math.round(successRate * 10.0) / 10.0)
                .averageLatencyMs(avgLatencyMs)
                .activeKeysCount(activeKeysCount)
                .totalKeysCount(totalKeysCount)
                .build();
    }

    @Transactional(readOnly = true)
    public List<TimeSeriesDataPoint> getTimeSeries(Long userId, int days) {
        LocalDateTime since = LocalDateTime.now().minusDays(days);
        List<ApiUsageLog> logs = usageLogRepository.findRecentLogsForAnalytics(userId, since);

        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("MMM dd");

        // Initialize all dates in range with zero counts
        Map<String, List<ApiUsageLog>> logsByDate = new LinkedHashMap<>();
        for (int i = days - 1; i >= 0; i--) {
            LocalDate date = LocalDate.now().minusDays(i);
            logsByDate.put(date.format(formatter), new ArrayList<>());
        }

        // Group actual logs
        for (ApiUsageLog log : logs) {
            String dateKey = log.getTimestamp().toLocalDate().format(formatter);
            if (logsByDate.containsKey(dateKey)) {
                logsByDate.get(dateKey).add(log);
            }
        }

        List<TimeSeriesDataPoint> result = new ArrayList<>();
        for (Map.Entry<String, List<ApiUsageLog>> entry : logsByDate.entrySet()) {
            String date = entry.getKey();
            List<ApiUsageLog> dayLogs = entry.getValue();

            long total = dayLogs.size();
            long success = dayLogs.stream().filter(l -> l.getStatusCode() >= 200 && l.getStatusCode() < 300).count();
            long rateLimited = dayLogs.stream().filter(l -> l.getStatusCode() == 429).count();
            long error = total - success;
            double avgLatency = dayLogs.stream().mapToLong(ApiUsageLog::getLatencyMs).average().orElse(0.0);

            result.add(TimeSeriesDataPoint.builder()
                    .timestamp(date)
                    .total(total)
                    .success(success)
                    .rateLimited(rateLimited)
                    .error(error)
                    .avgLatencyMs(Math.round(avgLatency * 10.0) / 10.0)
                    .build());
        }

        return result;
    }

    @Transactional(readOnly = true)
    public Page<UsageLogResponse> getRecentLogs(Long userId, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<ApiUsageLog> logPage = usageLogRepository.findByUserIdOrderByTimestampDesc(userId, pageable);
        return logPage.map(UsageLogResponse::fromEntity);
    }
}
