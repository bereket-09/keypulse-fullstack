package dev.keypulse.backend.config;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.License;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenApiConfig {

    @Bean
    public OpenAPI keyPulseOpenAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("KeyPulse API Gateway & Management Engine")
                        .description("REST API documentation for KeyPulse - Developer API Key Manager and Analytics Gateway")
                        .version("1.0.0")
                        .contact(new Contact()
                                .name("KeyPulse Engineering")
                                .email("dev@keypulse.dev"))
                        .license(new License()
                                .name("MIT")
                                .url("https://opensource.org/licenses/MIT")))
                .components(new Components()
                        .addSecuritySchemes("bearerAuth", new SecurityScheme()
                                .type(SecurityScheme.Type.HTTP)
                                .scheme("bearer")
                                .bearerFormat("JWT")
                                .description("Enter JWT Bearer token for Dashboard API access"))
                        .addSecuritySchemes("apiKeyAuth", new SecurityScheme()
                                .type(SecurityScheme.Type.APIKEY)
                                .in(SecurityScheme.In.HEADER)
                                .name("x-api-key")
                                .description("Enter API Key (e.g., kp_live_...) for Gateway Sandbox endpoints")))
                .addSecurityItem(new SecurityRequirement().addList("bearerAuth"));
    }
}
