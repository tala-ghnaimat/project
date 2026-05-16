package com.graduation.login.controller;

import com.graduation.login.entity.User;
import com.graduation.login.service.AuthService;
import com.graduation.login.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*") // Allows your HTML file to connect
public class AuthController {

    @Autowired
    private AuthService authService;
    @Autowired
    private UserRepository userRepository;

    @PostMapping("/signup")
    public ResponseEntity<String> signup(@RequestBody User user) {
        String result = authService.registerUser(user);
        if (result.contains("بنجاح")) {
            return ResponseEntity.ok(result);
        }
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(result);
    }

    @PostMapping("/login")
    public ResponseEntity<String> login(@RequestBody Map<String, String> credentials) {
        String result = authService.loginUser(credentials.get("identifier"), credentials.get("password"));
        if (result.contains("بنجاح")) {
            return ResponseEntity.ok(result);
        }
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(result);
    }
    @GetMapping("/points/{identifier}")
    public ResponseEntity<?> getUserPoints(@PathVariable String identifier) {
        java.util.Optional<com.graduation.login.entity.User> userOpt = userRepository.findByIdentityNumber(identifier);
        if (userOpt.isEmpty()) {
            userOpt = userRepository.findByPhoneNumber(identifier);
        }

        if (userOpt.isPresent()) {
            com.graduation.login.entity.User user = userOpt.get();

            java.util.Map<String, Object> response = new java.util.HashMap<>();
            response.put("firstName", user.getFirstName());
            response.put("middleName", user.getMiddleName());
            response.put("lastName", user.getLastName());
            response.put("email", user.getEmail());
            response.put("phone", user.getPhoneNumber());
            response.put("profilePicture", user.getProfilePicture());
            response.put("fullName", user.getFirstName() + " " + (user.getMiddleName() != null ? user.getMiddleName() + " " : "") + user.getLastName());

            if (user.getUserPoints() != null) {
                response.put("totalReports", user.getUserPoints().getTotalReports());
                response.put("earnedPoints", user.getUserPoints().getEarnedPoints());
                response.put("solvedReports", user.getUserPoints().getSolvedReports());
            } else {
                response.put("totalReports", 0);
                response.put("earnedPoints", 0);
                response.put("solvedReports", 0);
            }
            return ResponseEntity.ok(response);
        }
        return ResponseEntity.notFound().build();
    }

    @PostMapping("/profile/{identifier}")
    public ResponseEntity<?> updateProfile(@PathVariable String identifier, @RequestBody java.util.Map<String, String> data) {
        java.util.Optional<com.graduation.login.entity.User> userOpt = userRepository.findByIdentityNumber(identifier);
        if (userOpt.isEmpty()) {
            userOpt = userRepository.findByPhoneNumber(identifier);
        }

        if (userOpt.isPresent()) {
            com.graduation.login.entity.User user = userOpt.get();
            user.setFirstName(data.get("firstName"));
            user.setMiddleName(data.get("middleName"));
            user.setLastName(data.get("lastName"));
            user.setEmail(data.get("email"));
            user.setProfilePicture(data.get("profilePicture")); // Saves Base64 image

            userRepository.save(user);
            return ResponseEntity.ok("تم حفظ الملف الشخصي بنجاح!");
        }
        return ResponseEntity.notFound().build();
    }
// --- end of profile persistence controller methods ---
}