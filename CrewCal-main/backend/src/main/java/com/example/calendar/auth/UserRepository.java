package com.example.calendar.auth;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

@Repository
public class UserRepository {
    private final JdbcTemplate jdbc;

    public UserRepository(JdbcTemplate jdbc) { this.jdbc = jdbc; }

    public boolean existsByEmail(String email) {
        Integer n = jdbc.queryForObject("select count(*) from users where email = ?", Integer.class, email);
        return n != null && n > 0;
    }

    public long findIdByEmail(String email) {
        Long id = jdbc.queryForObject("select id from users where email = ?", Long.class, email);
        return id == null ? -1 : id;
    }

    public String findProvider(String email) {
        return jdbc.queryForObject("select provider from users where email = ?", String.class, email);
    }


    public String findPasswordHash(String email) {
        return jdbc.queryForObject("select password_hash from users where email = ?", String.class, email);
    }

    public String findDisplayName(String email) {
        return jdbc.queryForObject("select display_name from users where email = ?", String.class, email);
    }

    public void createEmailUser(String email, String passwordHash, String displayName) {
        jdbc.update("insert into users (email, password_hash, display_name, provider) values (?,?,?, 'EMAIL')",
                email, passwordHash, displayName);
    }

    public long upsertGoogleUser(String email, String displayName, String providerId) {
        return jdbc.queryForObject("""
            insert into users (email, password_hash, display_name, provider, provider_id)
            values (?, null, ?, 'GOOGLE', ?)
            on conflict (email)
            do update set
                provider = 'GOOGLE',
                provider_id = excluded.provider_id,
                display_name = coalesce(excluded.display_name, users.display_name),
                password_hash = null
            returning id
            """,
                Long.class,
                email, displayName, providerId
        );
    }
}
