package dev.keypulse.backend.security;

import com.fasterxml.jackson.databind.ObjectMapper;
import dev.keypulse.backend.dto.common.ApiResponse;
import dev.keypulse.backend.model.ApiKey;
import dev.keypulse.backend.model.ApiUsageLog;
import dev.keypulse.backend.repository.ApiKeyRepository;
import dev.keypulse.backend.repository.ApiUsageLogRepository;
import dev.keypulse.backend.service.RateLimiterService;
import dev.keypulse.backend.util.KeyGenerator;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Slf4j
@Component
@RequiredArgsConstructor
public class ApiKeyAuthenticationFilter extends OncePerRequestFilter {

    private final ApiKeyRepository apiKeyRepository;
    private final ApiUsageLogRepository usageLogRepository;
    private final RateLimiterService rateLimiterService;
    private final ObjectMapper objectMapper;

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        String path = request.getRequestURI();
        // Only filter gateway paths
        return !path.startsWith("/api/v1/gateway");
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {
        long startTime = System.currentTimeMillis();
        String rawKey = request.getHeader("x-api-key");
        if (rawKey == null || rawKey.trim().isEmpty()) {
            rawKey = request.getHeader("X-API-KEY");
        }

        if (rawKey == null || rawKey.trim().isEmpty()) {
            sendErrorResponse(response, HttpStatus.UNAUTHORIZED, "Missing x-api-key header");
            return;
        }

        String keyHash = KeyGenerator.hashKey(rawKey.trim());
        Optional<ApiKey> apiKeyOpt = apiKeyRepository.findByKeyHash(keyHash);

        if (apiKeyOpt.isEmpty()) {
            sendErrorResponse(response, HttpStatus.UNAUTHORIZED, "Invalid API key");
            return;
        }

        ApiKey apiKey = apiKeyOpt.get();

        if (!apiKey.isValid()) {
            String message = apiKey.isExpired() ? "API key has expired" : "API key is revoked";
            sendErrorResponse(response, HttpStatus.FORBIDDEN, message);
            return;
        }

        // Rate limit check
        boolean allowed = rateLimiterService.tryConsume(apiKey.getId(), apiKey.getRateLimitPerMinute());
        int remaining = rateLimiterService.getRemainingRequests(apiKey.getId(), apiKey.getRateLimitPerMinute());

        response.setHeader("X-RateLimit-Limit", String.valueOf(apiKey.getRateLimitPerMinute()));
        response.setHeader("X-RateLimit-Remaining", String.valueOf(remaining));

        if (!allowed) {
            long latency = System.currentTimeMillis() - startTime;
            recordUsage(apiKey, request, HttpStatus.TOO_MANY_REQUESTS.value(), latency);
            response.setHeader("Retry-After", "60");
            sendErrorResponse(response, HttpStatus.TOO_MANY_REQUESTS,
                    "Rate limit exceeded. Maximum " + apiKey.getRateLimitPerMinute() + " requests per minute allowed.");
            return;
        }

        // Update last used timestamp
        apiKey.setLastUsedAt(LocalDateTime.now());
        apiKeyRepository.save(apiKey);

        // Authenticate in Spring Security context
        List<SimpleGrantedAuthority> authorities = apiKey.getScopes().stream()
                .map(s -> new SimpleGrantedAuthority("SCOPE_" + s))
                .toList();

        UsernamePasswordAuthenticationToken authentication =
                new UsernamePasswordAuthenticationToken(apiKey, null, authorities);
        SecurityContextHolder.getContext().setAuthentication(authentication);

        request.setAttribute("CURRENT_API_KEY", apiKey);

        try {
            filterChain.doFilter(request, response);
        } finally {
            long latency = System.currentTimeMillis() - startTime;
            int status = response.getStatus();
            recordUsage(apiKey, request, status, latency);
        }
    }

    private void recordUsage(ApiKey apiKey, HttpServletRequest request, int statusCode, long latencyMs) {
        try {
            ApiUsageLog logEntry = ApiUsageLog.builder()
                    .apiKey(apiKey)
                    .endpoint(request.getRequestURI())
                    .httpMethod(request.getMethod())
                    .statusCode(statusCode)
                    .latencyMs(latencyMs)
                    .ipAddress(getClientIp(request))
                    .userAgent(request.getHeader("User-Agent"))
                    .timestamp(LocalDateTime.now())
                    .build();

            usageLogRepository.save(logEntry);
        } catch (Exception ex) {
            log.error("Failed to record API usage log", ex);
        }
    }

    private String getClientIp(HttpServletRequest request) {
        String xf = request.getHeader("X-Forwarded-For");
        if (xf != null && !xf.isEmpty()) {
            return xf.split(",")[0].trim();
        }
        return request.getRemoteAddr();
    }

    private void sendErrorResponse(HttpServletResponse response, HttpStatus status, String message) throws IOException {
        response.setStatus(status.value());
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);
        ApiResponse<Void> apiResponse = ApiResponse.error(message);
        response.getWriter().write(objectMapper.writeValueAsString(apiResponse));
    }
}
