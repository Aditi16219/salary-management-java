package com.salarymanagement.seed;

import java.nio.file.Files;
import java.nio.file.Path;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Locates the folder holding first_names.txt / last_names.txt, so seeding works from
 * backend/ (../seed), the repo root (seed) and the Docker container (/seed).
 */
public final class SeedDirectory {

    static final String MARKER = "first_names.txt";

    /** Default search order: run from backend/, from the repo root, inside Docker. */
    public static final List<Path> DEFAULT_CANDIDATES = List.of(Path.of("../seed"), Path.of("seed"), Path.of("/seed"));

    private SeedDirectory() {
    }

    /**
     * @param configured an explicit --seed.dir value, or null/blank to search the candidates
     */
    public static Path resolve(String configured, List<Path> candidates) {
        if (configured != null && !configured.isBlank()) {
            Path dir = Path.of(configured);
            if (!hasNameFiles(dir)) {
                throw new IllegalStateException(
                        "--seed.dir=" + dir.toAbsolutePath() + " does not contain " + MARKER);
            }
            return dir;
        }

        return candidates.stream()
                .filter(SeedDirectory::hasNameFiles)
                .findFirst()
                .orElseThrow(() -> new IllegalStateException(
                        "Could not find " + MARKER + ". Looked in: "
                                + candidates.stream().map(p -> p.toAbsolutePath().toString())
                                        .collect(Collectors.joining(", "))
                                + ". Run from the repo root or backend/, or pass --seed.dir=<path to seed folder>."));
    }

    private static boolean hasNameFiles(Path dir) {
        return Files.isRegularFile(dir.resolve(MARKER));
    }
}
