package dev.keypulse.backend.service;

import dev.keypulse.backend.dto.key.ApiKeyResponse;
import dev.keypulse.backend.dto.key.CreateApiKeyRequest;
import dev.keypulse.backend.dto.key.CreatedApiKeyResponse;
import dev.keypulse.backend.exception.ResourceNotFoundException;
import dev.keypulse.backend.model.ApiKey;
import dev.keypulse.backend.model.KeyStatus;
import dev.keypulse.backend.model.User;
import dev.keypulse.backend.repository.ApiKeyRepository;
import dev.keypulse.backend.repository.UserRepository;
import dev.keypulse.backend.util.KeyGenerator;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ApiKeyService {

    private final ApiKeyRepository apiKeyRepository;
    private final UserRepository userRepository;

    @Transactional
    public CreatedApiKeyResponse createApiKey(Long userId, CreateApiKeyRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        KeyGenerator.GeneratedKey generated = KeyGenerator.generateKey(request.getEnvironment());

        LocalDateTime expiresAt = null;
        if (request.getExpiresInDays() != null && request.getExpiresInDays() > 0) {
            expiresAt = LocalDateTime.now().plusDays(request.getExpiresInDays());
        }

        ApiKey apiKey = ApiKey.builder()
                .user(user)
                .name(request.getName().trim())
                .description(request.getDescription())
                .keyPrefix(generated.keyPrefix())
                .keyHash(generated.keyHash())
                .environment(request.getEnvironment())
                .status(KeyStatus.ACTIVE)
                .rateLimitPerMinute(request.getRateLimitPerMinute() != null ? request.getRateLimitPerMinute() : 60)
                .scopes(request.getScopes() != null ? new HashSet<>(request.getScopes()) : new HashSet<>(List.of("read:data")))
                .expiresAt(expiresAt)
                .build();

        ApiKey savedKey = apiKeyRepository.save(apiKey);

        return CreatedApiKeyResponse.of(savedKey, generated.rawKey());
    }

    @Transactional(readOnly = true)
    public List<ApiKeyResponse> getApiKeysForUser(Long userId) {
        return apiKeyRepository.findByUserIdOrderByCreatedAtDesc(userId)
                .stream()
                .map(ApiKeyResponse::fromEntity)
                .toList();
    }

    @Transactional(readOnly = true)
    public ApiKeyResponse getApiKeyById(Long userId, Long keyId) {
        ApiKey apiKey = apiKeyRepository.findByIdAndUserId(keyId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("API Key not found with id: " + keyId));

        return ApiKeyResponse.fromEntity(apiKey);
    }

    @Transactional
    public ApiKeyResponse revokeApiKey(Long userId, Long keyId) {
        ApiKey apiKey = apiKeyRepository.findByIdAndUserId(keyId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("API Key not found with id: " + keyId));

        apiKey.setStatus(KeyStatus.REVOKED);
        ApiKey updated = apiKeyRepository.save(apiKey);

        return ApiKeyResponse.fromEntity(updated);
    }

    @Transactional
    public void deleteApiKey(Long userId, Long keyId) {
        ApiKey apiKey = apiKeyRepository.findByIdAndUserId(keyId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("API Key not found with id: " + keyId));

        apiKeyRepository.delete(apiKey);
    }
}
