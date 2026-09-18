package dev.keypulse.backend;

import dev.keypulse.backend.model.Environment;
import dev.keypulse.backend.util.KeyGenerator;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@ActiveProfiles("dev")
class KeyPulseApplicationTests {

    @Test
    void contextLoads() {
        // Verifies Spring application context boots successfully with H2 profile
    }

    @Test
    void testKeyGenerator() {
        KeyGenerator.GeneratedKey key = KeyGenerator.generateKey(Environment.PRODUCTION);
        assertNotNull(key);
        assertTrue(key.rawKey().startsWith("kp_live_"));
        assertTrue(key.keyPrefix().startsWith("kp_live_"));
        assertEquals(64, key.keyHash().length()); // SHA-256 is 64 hex characters
    }
}
