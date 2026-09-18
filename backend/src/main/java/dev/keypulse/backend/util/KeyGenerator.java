package dev.keypulse.backend.util;

import dev.keypulse.backend.model.Environment;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.util.HexFormat;

public class KeyGenerator {

    private static final SecureRandom SECURE_RANDOM = new SecureRandom();

    public record GeneratedKey(String rawKey, String keyPrefix, String keyHash) {}

    /**
     * Generates a secure API key, its display prefix, and its SHA-256 hash.
     * Example rawKey: "kp_live_f83a0bc1d9e248a5bc9341de2a01f56a"
     */
    public static GeneratedKey generateKey(Environment environment) {
        String envPrefix = environment == Environment.PRODUCTION ? "kp_live_" : "kp_test_";

        byte[] randomBytes = new byte[24];
        SECURE_RANDOM.nextBytes(randomBytes);
        String randomHex = HexFormat.of().formatHex(randomBytes);

        String rawKey = envPrefix + randomHex;
        String keyPrefix = rawKey.substring(0, Math.min(16, rawKey.length())) + "...";
        String keyHash = hashKey(rawKey);

        return new GeneratedKey(rawKey, keyPrefix, keyHash);
    }

    /**
     * Hashes the raw API key using SHA-256.
     */
    public static String hashKey(String rawKey) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hashBytes = digest.digest(rawKey.getBytes(StandardCharsets.UTF_8));
            return HexFormat.of().formatHex(hashBytes);
        } catch (NoSuchAlgorithmException e) {
            throw new IllegalStateException("SHA-256 algorithm not available", e);
        }
    }
}
