package dev.keypulse.backend.service;

import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Iterator;
import java.util.List;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class RateLimiterService {

    private final ConcurrentHashMap<Long, List<Long>> requestWindows = new ConcurrentHashMap<>();

    /**
     * Checks if the given API key is allowed to make a request.
     * Uses a sliding-window algorithm over 60 seconds.
     *
     * @param apiKeyId           Unique ID of the API key
     * @param limitPerMinute     Configured max requests per minute
     * @return true if allowed, false if rate limited
     */
    public synchronized boolean tryConsume(Long apiKeyId, int limitPerMinute) {
        long now = System.currentTimeMillis();
        long windowStart = now - 60_000L;

        List<Long> timestamps = requestWindows.computeIfAbsent(apiKeyId, k -> new ArrayList<>());

        // Evict timestamps older than 60 seconds
        Iterator<Long> iterator = timestamps.iterator();
        while (iterator.hasNext()) {
            if (iterator.next() < windowStart) {
                iterator.remove();
            } else {
                break; // List is sorted by insertion time
            }
        }

        if (timestamps.size() < limitPerMinute) {
            timestamps.add(now);
            return true;
        }

        return false;
    }

    public synchronized int getRemainingRequests(Long apiKeyId, int limitPerMinute) {
        long now = System.currentTimeMillis();
        long windowStart = now - 60_000L;

        List<Long> timestamps = requestWindows.getOrDefault(apiKeyId, List.of());
        long currentCount = timestamps.stream().filter(t -> t >= windowStart).count();

        return (int) Math.max(0, limitPerMinute - currentCount);
    }
}
