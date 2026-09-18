package dev.keypulse.backend.repository;

import dev.keypulse.backend.model.ApiKey;
import dev.keypulse.backend.model.KeyStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ApiKeyRepository extends JpaRepository<ApiKey, Long> {
    Optional<ApiKey> findByKeyHash(String keyHash);
    List<ApiKey> findByUserIdOrderByCreatedAtDesc(Long userId);
    Optional<ApiKey> findByIdAndUserId(Long id, Long userId);
    long countByUserIdAndStatus(Long userId, KeyStatus status);
}
