package com.graduation.login.service;

import com.graduation.login.entity.User;
import com.graduation.login.entity.UserPoints;
import com.graduation.login.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class AuthService {

    @Autowired
    private UserRepository userRepository;

    public String registerUser(User user) {
        // 1. Basic empty field check
        if (user.getFirstName() == null || user.getFirstName().isEmpty() ||
                user.getIdentityNumber() == null || user.getIdentityNumber().isEmpty()) {
            return "يرجى تعبئة جميع الحقول المطلوبة";
        }

        // 2. ID Validation: Exactly 10 digits
        if (!user.getIdentityNumber().matches("\\d{10}")) {
            return "رقم الهوية يجب أن يتكون من ١٠ أرقام فقط";
        }

        // 3. Phone Validation: Starts with 07 and is 10 digits
        if (user.getPhoneNumber() == null || !user.getPhoneNumber().startsWith("07") || user.getPhoneNumber().length() != 10) {
            return "رقم الهاتف يجب أن يبدأ بـ 07 ويتكون من ١٠ أرقام";
        }

        // 4. Duplicate Check: Identity Number
        if (userRepository.findByIdentityNumber(user.getIdentityNumber()).isPresent()) {
            return "عذراً، هذا الرقم الوطني مسجل مسبقاً";
        }

        // 5. Duplicate Check: Phone Number
        if (userRepository.findByPhoneNumber(user.getPhoneNumber()).isPresent()) {
            return "عذراً، رقم الهاتف هذا مستخدم في حساب آخر";
        }

        // 6. Password Strength (Min 8 chars, 1 Uppercase, 1 Digit)
        String password = user.getPassword();
        if (password.length() < 8 || !password.matches(".*\\d.*") || !password.matches(".*[A-Z].*")) {
            return "كلمة المرور ضعيفة! يجب أن تكون ٨ خانات وتحتوي على رقم وحرف كبير";
        }
        user.setUserPoints(new UserPoints());
        userRepository.save(user);
        return "تم إنشاء الحساب بنجاح";
    }
    // --- end of registerUser method ---

    // THIS IS THE MISSING METHOD CAUSING YOUR ERROR
    public String loginUser(String identifier, String password) {
        // 1. Try finding the user by Identity Number first
        Optional<User> user = userRepository.findByIdentityNumber(identifier);

        // 2. If no user was found by ID, try searching by Phone Number
        if (user.isEmpty()) {
            user = userRepository.findByPhoneNumber(identifier);
        }

        // 3. Check if a user was found and if the password matches
        return user
                .filter(u -> u.getPassword().equals(password))
                .map(u -> "تم تسجيل الدخول بنجاح")
                .orElse("خطأ في الرقم الوطني/الهاتف أو كلمة المرور");
    }
// --- end of loginUser method ---
    // --- end of loginUser method ---
}
// --- end of AuthService class ---