package com.graduation.login.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "users")
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String middleName;
    private String email;
    private String firstName;
    private String lastName;
    @Column(columnDefinition = "TEXT")
    private String profilePicture;
    @Column(unique = true)
    private String identityNumber;

    @Column(unique = true)
    private String phoneNumber;
    private String password;

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getFirstName() { return firstName; }
    public void setFirstName(String firstName) { this.firstName = firstName; }
    public String getLastName() { return lastName; }
    public void setLastName(String lastName) { this.lastName = lastName; }
    public String getIdentityNumber() { return identityNumber; }
    public void setIdentityNumber(String identityNumber) { this.identityNumber = identityNumber; }
    public String getPhoneNumber() { return phoneNumber; }
    public void setPhoneNumber(String phoneNumber) { this.phoneNumber = phoneNumber; }
    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }
    public String getMiddleName() { return middleName; }
    public void setMiddleName(String middleName) { this.middleName = middleName; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getProfilePicture() { return profilePicture; }
    public void setProfilePicture(String profilePicture) { this.profilePicture = profilePicture; }
    @OneToOne(cascade = CascadeType.ALL)
    @JoinColumn(name = "points_id", referencedColumnName = "id")
    private UserPoints userPoints;

    public UserPoints getUserPoints() { return userPoints; }
    public void setUserPoints(UserPoints userPoints) { this.userPoints = userPoints; }
}
// --- end of User entity ---