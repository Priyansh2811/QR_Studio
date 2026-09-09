package com.qrstudi.api;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.util.List;

@Repository
public class GenerationRepository {
    private final JdbcTemplate jdbc;

    public GenerationRepository(JdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    public List<Generation> findRecent(int limit) {
        return jdbc.query("SELECT id, url, label, created_at FROM generations ORDER BY created_at DESC, id DESC LIMIT ?", this::map, limit);
    }

    public Generation save(String url, String label) {
        String createdAt = OffsetDateTime.now(ZoneOffset.UTC).toString();
        Long id = jdbc.queryForObject(
                "INSERT INTO generations (url, label, created_at) VALUES (?, ?, ?) RETURNING id",
                Long.class, url, label, createdAt);
        return new Generation(id, url, label, createdAt);
    }

    public int delete(long id) {
        return jdbc.update("DELETE FROM generations WHERE id = ?", id);
    }

    public int deleteAll() {
        return jdbc.update("DELETE FROM generations");
    }

    private Generation map(java.sql.ResultSet rs, int rowNum) throws java.sql.SQLException {
        return new Generation(rs.getLong("id"), rs.getString("url"), rs.getString("label"), rs.getString("created_at"));
    }
}

