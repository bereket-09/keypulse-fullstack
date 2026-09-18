package dev.keypulse.backend.repository;

import dev.keypulse.backend.model.ApiUsageLog;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface ApiUsageLogRepository extends JpaRepository<ApiUsageLog, Long> {

    long countByApiKey_User_Id(Long userId);

    long countByApiKey_User_IdAndStatusCodeBetween(Long userId, Integer startStatus, Integer endStatus);

    long countByApiKey_User_IdAndStatusCode(Long userId, Integer statusCode);

    @Query("SELECT COALESCE(AVG(l.latencyMs), 0.0) FROM ApiUsageLog l WHERE l.apiKey.user.id = :userId")
    Double calculateAverageLatencyByUserId(@Param("userId") Long userId);

    @Query("SELECT l FROM ApiUsageLog l WHERE l.apiKey.user.id = :userId ORDER BY l.timestamp DESC")
    Page<ApiUsageLog> findByUserIdOrderByTimestampDesc(@Param("userId") Long userId, Pageable pageable);

    @Query("SELECT l FROM ApiUsageLog l WHERE l.apiKey.user.id = :userId AND l.timestamp >= :since ORDER BY l.timestamp ASC")
    List<ApiUsageLog> findRecentLogsForAnalytics(@Param("userId") Long userId, @Param("since") LocalDateTime since);

    @Query("SELECT l.statusCode as code, COUNT(l) as count FROM ApiUsageLog l WHERE l.apiKey.user.id = :userId GROUP BY l.statusCode")
    List<Object[]> countByStatusCodeGrouped(@Param("userId") Long userId);
}
