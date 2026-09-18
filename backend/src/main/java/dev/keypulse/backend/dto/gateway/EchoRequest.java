package dev.keypulse.backend.dto.gateway;

import lombok.Data;

import java.util.Map;

@Data
public class EchoRequest {
    private String message;
    private Map<String, Object> payload;
}
