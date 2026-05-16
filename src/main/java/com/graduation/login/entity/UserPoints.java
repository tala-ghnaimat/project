package com.graduation.login.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "user_points")
public class UserPoints {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // The 3 columns required in English
    private int totalReports = 0;
    private int earnedPoints = 0;
    private int solvedReports = 0;

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public int getTotalReports() { return totalReports; }
    public void setTotalReports(int totalReports) { this.totalReports = totalReports; }
    public int getEarnedPoints() { return earnedPoints; }
    public void setEarnedPoints(int earnedPoints) { this.earnedPoints = earnedPoints; }
    public int getSolvedReports() { return solvedReports; }
    public void setSolvedReports(int solvedReports) { this.solvedReports = solvedReports; }
}
// --- end of UserPoints entity ---