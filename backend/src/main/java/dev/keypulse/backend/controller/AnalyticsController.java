package dev.keypulse.backend.controller;

import dev.keypulse.backend.dto.analytics.AnalyticsOverviewResponse;
import dev.keypulse.backend.dto.analytics.TimeSeriesDataPoint;
import dev.keypulse.backend.dto.analytics.UsageLogResponse;
import dev.keypulse.backend.dto.common.ApiResponse;
import dev.keypulse.backend.security.UserPrincipal;
import dev.keypulse.backend.service.AnalyticsService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/analytics")
@RequiredArgsConstructor
@Tag(name = "Analytics", description = "Endpoints for usage metrics, charts, and request logs")
@SecurityRequirement(name = "bearerAuth")
public class AnalyticsController {

    private final AnalyticsService analyticsService;

    @GetMapping("/overview")
    @Operation(summary = "Get high-level aggregated metrics for the dashboard")
    public ResponseEntity<ApiResponse<AnalyticsOverviewResponse>> getOverview(
            @AuthenticationPrincipal UserPrincipal principal) {
        AnalyticsOverviewResponse overview = analyticsService.getOverview(principal.getId());
        return ResponseEntity.ok(ApiResponse.success(overview));
    }

    @GetMapping("/time-series")
    @Operation(summary = "Get daily request time-series for charts")
    public ResponseEntity<ApiResponse<List<TimeSeriesDataPoint>>> getTimeSeries(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestParam(defaultValue = "14") int days) {
        List<TimeSeriesDataPoint> points = analyticsService.getTimeSeries(principal.getId(), days);
        return ResponseEntity.ok(ApiResponse.success(points));
    }

    @GetMapping("/logs")
    @Operation(summary = "Get paginated audit/usage logs")
    public ResponseEntity<ApiResponse<Page<UsageLogResponse>>> getLogs(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        Page<UsageLogResponse> logs = analyticsService.getRecentLogs(principal.getId(), page, size);
        return ResponseEntity.ok(ApiResponse.success(logs));
    }
}
