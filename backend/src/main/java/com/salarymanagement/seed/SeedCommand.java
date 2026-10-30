package com.salarymanagement.seed;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.List;

/** Seeds the database when the app is started with --seed (see SalaryManagementApplication). */
@Component
public class SeedCommand implements ApplicationRunner {

    private static final int TARGET_COUNT = 10_000;

    private final SeedService seedService;
    private final Path seedDir;

    public SeedCommand(SeedService seedService, @Value("${seed.dir:../seed}") String seedDir) {
        this.seedService = seedService;
        this.seedDir = Path.of(seedDir);
    }

    @Override
    public void run(ApplicationArguments args) throws IOException {
        if (!args.containsOption("seed")) {
            return;
        }

        List<String> firstNames = readNames("first_names.txt");
        List<String> lastNames = readNames("last_names.txt");
        System.out.printf("Loaded %d first names, %d last names%n", firstNames.size(), lastNames.size());

        System.out.printf("Generating %,d records...%n", TARGET_COUNT);
        long t0 = System.nanoTime();
        List<SeedRecord> records = SeedGenerator.generateRecords(firstNames, lastNames, TARGET_COUNT);
        long t1 = System.nanoTime();
        System.out.printf("  Generated in %.2fs%n", seconds(t1 - t0));

        System.out.println("Inserting into database...");
        seedService.insert(records);
        long t2 = System.nanoTime();
        System.out.printf("  Inserted %,d records in %.2fs%n", TARGET_COUNT, seconds(t2 - t1));
        System.out.printf("Total time: %.2fs%n", seconds(t2 - t0));
    }

    private List<String> readNames(String fileName) throws IOException {
        return Files.readAllLines(seedDir.resolve(fileName)).stream()
                .map(String::strip)
                .filter(line -> !line.isEmpty())
                .toList();
    }

    private static double seconds(long nanos) {
        return nanos / 1_000_000_000.0;
    }
}
