package dev.keypulse.backend.controller;

import dev.keypulse.backend.dto.common.ApiResponse;
import dev.keypulse.backend.dto.gateway.EchoRequest;
import dev.keypulse.backend.dto.gateway.GatewayDataResponse;
import dev.keypulse.backend.model.ApiKey;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.enums.ParameterIn;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/gateway")
@Tag(name = "API Gateway (Sandbox)", description = "Gateway endpoints requiring x-api-key authentication")
public class GatewayController {

    @GetMapping("/mock-data")
    @Operation(
            summary = "Fetch mock service data via API key",
            parameters = {
                    @Parameter(name = "x-api-key", in = ParameterIn.HEADER, required = true, description = "Developer API Key")
            }
    )
    public ResponseEntity<ApiResponse<GatewayDataResponse>> getMockData(HttpServletRequest request) {
        ApiKey apiKey = (ApiKey) request.getAttribute("CURRENT_API_KEY");

        Map<String, Object> mockPayload = new HashMap<>();
        mockPayload.put("serverStatus", "OPERATIONAL");
        mockPayload.put("uptimeSeconds", 142857);
        mockPayload.put("version", "v1.4.2");
        mockPayload.put("activeNodes", 8);
        mockPayload.put("currentLoad", "23.4%");
        mockPayload.put("scopesGranted", apiKey != null ? apiKey.getScopes() : List.of());

        GatewayDataResponse response = GatewayDataResponse.builder()
                .status("SUCCESS")
                .authenticatedKey(apiKey != null ? apiKey.getKeyPrefix() : "unknown")
                .environment(apiKey != null ? apiKey.getEnvironment().name() : "unknown")
                .timestamp(LocalDateTime.now())
                .data(mockPayload)
                .build();

        return ResponseEntity.ok(ApiResponse.success("Gateway request verified and authorized", response));
    }

    @PostMapping("/echo")
    @Operation(
            summary = "Echo back custom payload via API key",
            parameters = {
                    @Parameter(name = "x-api-key", in = ParameterIn.HEADER, required = true, description = "Developer API Key")
            }
    )
    public ResponseEntity<ApiResponse<GatewayDataResponse>> echo(
            HttpServletRequest request,
            @RequestBody(required = false) EchoRequest echoRequest) {
        ApiKey apiKey = (ApiKey) request.getAttribute("CURRENT_API_KEY");

        Map<String, Object> data = new HashMap<>();
        data.put("echoedMessage", echoRequest != null ? echoRequest.getMessage() : "No message supplied");
        data.put("payloadReceived", echoRequest != null ? echoRequest.getPayload() : Map.of());

        GatewayDataResponse response = GatewayDataResponse.builder()
                .status("SUCCESS")
                .authenticatedKey(apiKey != null ? apiKey.getKeyPrefix() : "unknown")
                .environment(apiKey != null ? apiKey.getEnvironment().name() : "unknown")
                .timestamp(LocalDateTime.now())
                .data(data)
                .build();

        return ResponseEntity.ok(ApiResponse.success("Payload processed successfully", response));
    }
}
