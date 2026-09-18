package dev.keypulse.backend.service;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class RateLimiterServiceTest {

    private RateLimiterService rateLimiterService;

    @BeforeEach
    void setUp() {
        rateLimiterService = new RateLimiterService();
    }

    @Test
    void testRateLimitEnforcement() {
        Long keyId = 100L;
        int limit = 3;

        // First 3 requests should succeed
        assertTrue(rateLimiterService.tryConsume(keyId, limit));
        assertTrue(rateLimiterService.tryConsume(keyId, limit));
        assertTrue(rateLimiterService.tryConsume(keyId, limit));

        // 4th request must fail
        assertFalse(rateLimiterService.tryConsume(keyId, limit));
        assertEquals(0, rateLimiterService.getRemainingRequests(keyId, limit));
    }
}
