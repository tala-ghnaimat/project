package com.graduation.login.repository;

import com.graduation.login.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByIdentityNumber(String identityNumber);
    Optional<User> findByPhoneNumber(String phoneNumber); // New: Find by phone
}
// --- end of UserRepository interface ---