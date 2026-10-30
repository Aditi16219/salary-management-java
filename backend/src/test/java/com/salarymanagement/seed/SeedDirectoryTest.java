package com.salarymanagement.seed;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class SeedDirectoryTest {

    @TempDir
    Path tmp;

    private Path seedFolder(String name) throws IOException {
        Path dir = Files.createDirectories(tmp.resolve(name));
        Files.writeString(dir.resolve("first_names.txt"), "Alice\n");
        Files.writeString(dir.resolve("last_names.txt"), "Smith\n");
        return dir;
    }

    @Test
    void usesFirstCandidateThatContainsTheNameFiles() throws IOException {
        Path empty = Files.createDirectories(tmp.resolve("empty"));
        Path seed = seedFolder("seed");

        Path resolved = SeedDirectory.resolve(null, List.of(tmp.resolve("missing"), empty, seed));

        assertThat(resolved).isEqualTo(seed);
    }

    @Test
    void explicitDirectoryWinsOverCandidates() throws IOException {
        Path configured = seedFolder("custom");
        Path candidate = seedFolder("seed");

        Path resolved = SeedDirectory.resolve(configured.toString(), List.of(candidate));

        assertThat(resolved).isEqualTo(configured);
    }

    @Test
    void explicitDirectoryWithoutNameFilesFailsClearly() {
        Path wrong = tmp.resolve("nope");

        assertThatThrownBy(() -> SeedDirectory.resolve(wrong.toString(), List.of()))
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining(wrong.toString())
                .hasMessageContaining("first_names.txt");
    }

    @Test
    void noCandidateFoundListsTriedPathsAndHowToFixIt() {
        Path a = tmp.resolve("a");
        Path b = tmp.resolve("b");

        assertThatThrownBy(() -> SeedDirectory.resolve(null, List.of(a, b)))
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining(a.toString())
                .hasMessageContaining(b.toString())
                .hasMessageContaining("--seed.dir");
    }
}
