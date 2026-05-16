package com.graduation.login;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import java.awt.Desktop;
import java.net.URI;

@SpringBootApplication
public class ProjectApplication {

    public static void main(String[] args) {
        SpringApplication.run(ProjectApplication.class, args);

        // Automatically open the browser once the server finishes booting
        openBrowser("http://localhost:8081/index.html");
    }
    // --- end of main method ---

    private static void openBrowser(String url) {
        String os = System.getProperty("os.name").toLowerCase();

        try {
            if (os.contains("win")) {
                // Forces Windows Command Prompt to launch the URL with the default handler (Yandex)
                new ProcessBuilder("cmd", "/c", "start", url).start();
                System.out.println("🚀 Windows shell triggered browser launcher successfully!");
            } else if (os.contains("nix") || os.contains("nux")) {
                // Forces Linux Mint to pass the URL straight to xdg-open
                new ProcessBuilder("xdg-open", url).start();
                System.out.println("🚀 Linux shell triggered browser launcher successfully!");
            }
        } catch (Exception e) {
            System.out.println("⚠️ Command-line launcher failed: " + e.getMessage());
            System.out.println("🔗 Please manually open: " + url);
        }
    }
// --- end of openBrowser method ---
    // --- end of openBrowser method ---
}
// --- end of ProjectApplication class ---