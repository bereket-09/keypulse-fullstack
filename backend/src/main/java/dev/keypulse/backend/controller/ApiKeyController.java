package dev.keypulse.backend.controller;

import dev.keypulse.backend.dto.common.ApiResponse;
import dev.keypulse.backend.dto.key.ApiKeyResponse;
import dev.keypulse.backend.dto.key.CreateApiKeyRequest;
import dev.keypulse.backend.dto.key.CreatedApiKeyResponse;
import dev.keypulse.backend.security.UserPrincipal;
import dev.keypulse.backend.service.ApiKeyService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/keys")
@RequiredArgsConstructor
@Tag(name = "API Keys", description = "Endpoints for managing developer API keys")
@SecurityRequirement(name = "bearerAuth")
public class ApiKeyController {

    private final ApiKeyService apiKeyService;

    @PostMapping
    @Operation(summary = "Create a new API key (reveals raw key once)")
    public ResponseEntity<ApiResponse<CreatedApiKeyResponse>> createApiKey(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody CreateApiKeyRequest request) {
        CreatedApiKeyResponse response = apiKeyService.createApiKey(principal.getId(), request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("API key generated successfully", response));
    }

    @GetMapping
    @Operation(summary = "List all API keys for the current user (masked)")
    public ResponseEntity<ApiResponse<List<ApiKeyResponse>>> getApiKeys(
            @AuthenticationPrincipal UserPrincipal principal) {
        List<ApiKeyResponse> keys = apiKeyService.getApiKeysForUser(principal.getId());
        return ResponseEntity.ok(ApiResponse.success(keys));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get API key details by ID")
    public ResponseEntity<ApiResponse<ApiKeyResponse>> getApiKeyById(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long id) {
        ApiKeyResponse response = apiKeyService.getApiKeyById(principal.getId(), id);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @PatchMapping("/{id}/revoke")
    @Operation(summary = "Revoke an API key")
    public ResponseEntity<ApiResponse<ApiKeyResponse>> revokeApiKey(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long id) {
        ApiKeyResponse response = apiKeyService.revokeApiKey(principal.getId(), id);
        return ResponseEntity.ok(ApiResponse.success("API key revoked successfully", response));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete an API key")
    public ResponseEntity<ApiResponse<Void>> deleteApiKey(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long id) {
        apiKeyService.deleteApiKey(principal.getId(), id);
        return ResponseEntity.ok(ApiResponse.success("API key deleted successfully", null));
    }
}
