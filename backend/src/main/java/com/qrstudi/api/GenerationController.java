package com.qrstudi.api;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.CrossOrigin;

import java.net.URI;
import java.net.URISyntaxException;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = {"http://localhost:5173", "http://127.0.0.1:5173"})
public class GenerationController {
    private final GenerationRepository repository;

    public GenerationController(GenerationRepository repository) {
        this.repository = repository;
    }

    @GetMapping("/generations")
    public List<Generation> list(@RequestParam(defaultValue = "25") int limit) {
        return repository.findRecent(Math.max(1, Math.min(limit, 100)));
    }

    @PostMapping("/generations")
    public ResponseEntity<?> create(@RequestBody GenerationRequest request) {
        String url = request == null || request.url() == null ? "" : request.url().trim();
        if (!isValidUrl(url)) {
            return ResponseEntity.badRequest().body(Map.of("error", "Enter a valid http:// or https:// link."));
        }
        String label = request.label() == null ? "" : request.label().trim();
        if (label.length() > 80) {
            return ResponseEntity.badRequest().body(Map.of("error", "Labels must be 80 characters or fewer."));
        }
        return ResponseEntity.status(HttpStatus.CREATED).body(repository.save(url, label));
    }

    @DeleteMapping("/generations/{id}")
    public ResponseEntity<Void> delete(@PathVariable long id) {
        return repository.delete(id) == 0 ? ResponseEntity.notFound().build() : ResponseEntity.noContent().build();
    }

    @DeleteMapping("/generations")
    public ResponseEntity<Void> deleteAll() {
        repository.deleteAll();
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/health")
    public Map<String, String> health() {
        return Map.of("status", "ok", "service", "qr-studio-api");
    }

    static boolean isValidUrl(String value) {
        if (value.length() > 2048) return false;
        try {
            URI uri = new URI(value);
            return ("http".equalsIgnoreCase(uri.getScheme()) || "https".equalsIgnoreCase(uri.getScheme()))
                    && uri.getHost() != null && !uri.getHost().isBlank();
        } catch (URISyntaxException ex) {
            return false;
        }
    }
}

