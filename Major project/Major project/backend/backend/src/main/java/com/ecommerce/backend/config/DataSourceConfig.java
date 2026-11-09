package com.ecommerce.backend.config;

import com.zaxxer.hikari.HikariConfig;
import com.zaxxer.hikari.HikariDataSource;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;

import javax.sql.DataSource;
import java.net.URI;

@Configuration
public class DataSourceConfig {

    private static final Logger logger = LoggerFactory.getLogger(DataSourceConfig.class);

    @Value("${spring.datasource.url:}")
    private String configuredUrl;

    @Value("${spring.datasource.username:postgres}")
    private String defaultUsername;

    @Value("${spring.datasource.password:deepika08}")
    private String defaultPassword;

    @Bean
    @Primary
    public DataSource dataSource() {
        HikariConfig config = new HikariConfig();

        // 1. Check environment variables: DB_URL, DATABASE_URL, or configuredUrl
        String rawUrl = System.getenv("DB_URL");
        if (rawUrl == null || rawUrl.trim().isEmpty()) {
            rawUrl = System.getenv("DATABASE_URL");
        }
        if (rawUrl == null || rawUrl.trim().isEmpty()) {
            rawUrl = configuredUrl;
        }
        if (rawUrl == null || rawUrl.trim().isEmpty()) {
            rawUrl = "jdbc:postgresql://localhost:5432/ecommerce_db";
        }

        String username = System.getenv("DB_USERNAME");
        if (username == null || username.trim().isEmpty()) {
            username = defaultUsername;
        }

        String password = System.getenv("DB_PASSWORD");
        if (password == null || password.trim().isEmpty()) {
            password = defaultPassword;
        }

        // 2. Handle Cloud URLs starting with postgres:// or postgresql:// (Render, Railway, Supabase, Neon)
        if (rawUrl.startsWith("postgres://") || rawUrl.startsWith("postgresql://")) {
            try {
                URI uri = new URI(rawUrl);
                String host = uri.getHost();
                int port = uri.getPort() == -1 ? 5432 : uri.getPort();
                String path = uri.getPath(); // e.g. /ecommerce_db
                String dbName = (path != null && path.length() > 1) ? path.substring(1) : "ecommerce_db";

                if (uri.getUserInfo() != null) {
                    String[] userParts = uri.getUserInfo().split(":");
                    if (userParts.length > 0 && !userParts[0].isEmpty()) {
                        username = userParts[0];
                    }
                    if (userParts.length > 1 && !userParts[1].isEmpty()) {
                        password = userParts[1];
                    }
                }

                String query = uri.getQuery();
                String jdbcUrl = "jdbc:postgresql://" + host + ":" + port + "/" + dbName;
                if (query != null && !query.isEmpty()) {
                    jdbcUrl += "?" + query;
                } else if (!"localhost".equalsIgnoreCase(host) && !"127.0.0.1".equalsIgnoreCase(host)) {
                    jdbcUrl += "?sslmode=require";
                }

                logger.info("[DataSourceConfig] Parsed cloud DATABASE_URL into JDBC target: jdbc:postgresql://{}:{}/{}", host, port, dbName);
                config.setJdbcUrl(jdbcUrl);
            } catch (Exception e) {
                logger.warn("[DataSourceConfig] Could not parse URI '{}', prefixing with jdbc: - {}", rawUrl, e.getMessage());
                config.setJdbcUrl("jdbc:" + rawUrl);
            }
        } else {
            // Standard JDBC URL
            config.setJdbcUrl(rawUrl);
        }

        config.setUsername(username);
        config.setPassword(password);
        config.setDriverClassName("org.postgresql.Driver");

        // Hikari pool resilience
        config.setMaximumPoolSize(10);
        config.setMinimumIdle(2);
        config.setConnectionTimeout(30000);
        config.setIdleTimeout(600000);
        config.setMaxLifetime(1800000);

        logger.info("[DataSourceConfig] Initializing HikariDataSource for user '{}' with target URL: {}", username, config.getJdbcUrl());
        return new HikariDataSource(config);
    }
}

