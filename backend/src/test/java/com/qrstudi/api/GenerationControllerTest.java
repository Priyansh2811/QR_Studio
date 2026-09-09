package com.qrstudi.api;

import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

class GenerationControllerTest {
    @Test
    void acceptsHttpAndHttpsLinks() {
        assertThat(GenerationController.isValidUrl("https://example.com/path?q=qr")).isTrue();
        assertThat(GenerationController.isValidUrl("http://localhost:8080")).isTrue();
    }

    @Test
    void rejectsUnsafeOrIncompleteLinks() {
        assertThat(GenerationController.isValidUrl("javascript:alert(1)")).isFalse();
        assertThat(GenerationController.isValidUrl("example.com")).isFalse();
        assertThat(GenerationController.isValidUrl("https://")).isFalse();
    }
}

