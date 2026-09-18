package dev.keypulse.backend.config;

import dev.keypulse.backend.model.*;
import dev.keypulse.backend.repository.ApiKeyRepository;
import dev.keypulse.backend.repository.ApiUsageLogRepository;
import dev.keypulse.backend.repository.UserRepository;
import dev.keypulse.backend.util.KeyGenerator;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.*;

@Slf4j
@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final ApiKeyRepository apiKeyRepository;
    private final ApiUsageLogRepository usageLogRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        if (userRepository.findByEmail("demo@keypulse.dev").isPresent()) {
            return;
        }

        log.info("Seeding demo data for KeyPulse...");

        // 1. Create Demo User
        User demoUser = User.builder()
                .email("demo@keypulse.dev")
                .password(passwordEncoder.encode("password123"))
                .fullName("Alex Vance")
                .role(Role.ROLE_DEVELOPER)
                .build();
        demoUser = userRepository.save(demoUser);

        // 2. Create Sample API Keys
        String prodRaw = "kp_live_9a7b8c6d4e2f109837a4b5c6d7e8f9a0";
        ApiKey prodKey = ApiKey.builder()
                .user(demoUser)
                .name("Production Mobile App")
                .description("Production key used by iOS and Android clients")
                .keyPrefix("kp_live_9a7b8c6d...")
                .keyHash(KeyGenerator.hashKey(prodRaw))
                .environment(Environment.PRODUCTION)
                .status(KeyStatus.ACTIVE)
                .rateLimitPerMinute(120)
                .scopes(new HashSet<>(Arrays.asList("read:metrics", "write:events", "sync:data")))
                .lastUsedAt(LocalDateTime.now().minusMinutes(12))
                .build();
        prodKey = apiKeyRepository.save(prodKey);

        String stagingRaw = "kp_test_3f2e1d0c9b8a7f6e5d4c3b2a10987654";
        ApiKey stagingKey = ApiKey.builder()
                .user(demoUser)
                .name("Staging Web Gateway")
                .description("Used for internal testing and QA integration")
                .keyPrefix("kp_test_3f2e1d0c...")
                .keyHash(KeyGenerator.hashKey(stagingRaw))
                .environment(Environment.STAGING)
                .status(KeyStatus.ACTIVE)
                .rateLimitPerMinute(60)
                .scopes(new HashSet<>(Arrays.asList("read:metrics", "write:events")))
                .lastUsedAt(LocalDateTime.now().minusHours(2))
                .build();
        stagingKey = apiKeyRepository.save(stagingKey);

        String revokedRaw = "kp_test_88887777666655554444333322221111";
        ApiKey revokedKey = ApiKey.builder()
                .user(demoUser)
                .name("Deprecated V1 Integration")
                .description("Old backend daemon - retired")
                .keyPrefix("kp_test_88887777...")
                .keyHash(KeyGenerator.hashKey(revokedRaw))
                .environment(Environment.DEVELOPMENT)
                .status(KeyStatus.REVOKED)
                .rateLimitPerMinute(30)
                .scopes(new HashSet<>(Collections.singletonList("read:legacy")))
                .lastUsedAt(LocalDateTime.now().minusDays(15))
                .build();
        apiKeyRepository.save(revokedKey);

        // 3. Seed Realistic Historical Usage Logs across the last 14 days
        Random random = new Random(42);
        List<ApiUsageLog> logs = new ArrayList<>();
        String[] endpoints = {"/api/v1/gateway/mock-data", "/api/v1/gateway/echo", "/api/v1/users/telemetry", "/api/v1/events/stream"};
        String[] ips = {"192.168.1.45", "10.0.0.12", "172.16.0.8", "54.210.12.89"};

        for (int day = 13; day >= 0; day--) {
            int callsToday = 25 + random.nextInt(35); // 25 to 60 calls per day
            for (int i = 0; i < callsToday; i++) {
                int hour = random.nextInt(24);
                int minute = random.nextInt(60);
                LocalDateTime logTime = LocalDateTime.now().minusDays(day).withHour(hour).withMinute(minute);

                int statusRoll = random.nextInt(100);
                int statusCode;
                if (statusRoll < 88) {
                    statusCode = 200;
                } else if (statusRoll < 95) {
                    statusCode = 429; // rate limited
                } else {
                    statusCode = 500; // error
                }

                long latency = 12 + random.nextInt(85);
                if (statusCode == 500) latency += 150;

                ApiKey keyUsed = (random.nextInt(10) < 7) ? prodKey : stagingKey;

                logs.add(ApiUsageLog.builder()
                        .apiKey(keyUsed)
                        .endpoint(endpoints[random.nextInt(endpoints.length)])
                        .httpMethod(random.nextBoolean() ? "GET" : "POST")
                        .statusCode(statusCode)
                        .latencyMs(latency)
                        .ipAddress(ips[random.nextInt(ips.length)])
                        .userAgent("KeyPulse-SDK/1.2.0 (macOS; arm64)")
                        .timestamp(logTime)
                        .build());
            }
        }

        usageLogRepository.saveAll(logs);

        log.info("========================================================================");
        log.info("KeyPulse Demo Account Ready:");
        log.info("Email:    demo@keypulse.dev");
        log.info("Password: password123");
        log.info("Sample Production Key: {}", prodRaw);
        log.info("Sample Staging Key:    {}", stagingRaw);
        log.info("Generated {} usage log records across the last 14 days", logs.size());
        log.info("========================================================================");
    }
}
