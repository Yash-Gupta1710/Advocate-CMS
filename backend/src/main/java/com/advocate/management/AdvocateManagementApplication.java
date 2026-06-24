package com.advocate.management;

import com.advocate.management.entity.Availability;
import com.advocate.management.entity.User;
import com.advocate.management.enums.AvailabilityStatus;
import com.advocate.management.enums.Role;
import com.advocate.management.repository.AvailabilityRepository;
import com.advocate.management.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.time.LocalDate;
import java.time.LocalTime;

/**
 * Main application class to boot the Advocate Client Management System backend.
 * Seeds the database with initial lawyer and client users and default availability slots.
 */
@SpringBootApplication
public class AdvocateManagementApplication {

    public static void main(String[] args) {
        SpringApplication.run(AdvocateManagementApplication.class, args);
    }

    @Bean
    @SuppressWarnings("unused")
    CommandLineRunner seedDatabase(
            UserRepository userRepository,
            AvailabilityRepository availabilityRepository,
            PasswordEncoder passwordEncoder
    ) {
        return args -> {
            // Only seed if no users exist
            if (userRepository.count() > 0) {
                System.out.println("Database already seeded. Skipping.");
                return;
            }

            System.out.println("Seeding database with initial data...");

            // Create Lawyer user
            User lawyer = User.builder()
                    .fullName("Adv. Rajesh Sharma")
                    .email("lawyer@advocate.com")
                    .password(passwordEncoder.encode("Password123"))
                    .role(Role.ROLE_LAWYER)
                    .phoneNumber("+91-9876543210")
                    .specialization("Civil & Criminal Law")
                    .barcodeNumber("BAR/2015/12345")
                    .securityQuestion("What is your mother's maiden name?")
                    .securityAnswer("Sharma")
                    .build();
            userRepository.save(lawyer);
            System.out.println("  Created Lawyer: lawyer@advocate.com / Password123");

            // Create Client user
            User client = User.builder()
                    .fullName("Amit Patel")
                    .email("client@advocate.com")
                    .password(passwordEncoder.encode("Password123"))
                    .role(Role.ROLE_CLIENT)
                    .phoneNumber("+91-9123456789")
                    .securityQuestion("What is the name of your first pet?")
                    .securityAnswer("Bruno")
                    .build();
            userRepository.save(client);
            System.out.println("  Created Client: client@advocate.com / Password123");

            // Seed availability for the next 14 days (Monday-Friday, 10:00-13:00 and 14:00-17:00)
            LocalDate today = LocalDate.now();
            for (int i = 0; i < 14; i++) {
                LocalDate date = today.plusDays(i);
                int dayOfWeek = date.getDayOfWeek().getValue(); // 1=Mon, 7=Sun
                if (dayOfWeek <= 5) { // Only weekdays
                    // Morning slot
                    availabilityRepository.save(Availability.builder()
                            .lawyer(lawyer)
                            .date(date)
                            .startTime(LocalTime.of(10, 0))
                            .endTime(LocalTime.of(13, 0))
                            .status(AvailabilityStatus.AVAILABLE)
                            .description("Morning consultation hours")
                            .build());
                    // Afternoon slot
                    availabilityRepository.save(Availability.builder()
                            .lawyer(lawyer)
                            .date(date)
                            .startTime(LocalTime.of(14, 0))
                            .endTime(LocalTime.of(17, 0))
                            .status(AvailabilityStatus.AVAILABLE)
                            .description("Afternoon consultation hours")
                            .build());
                }
            }
            System.out.println("  Created 14-day availability schedule (Mon-Fri, 10-1 & 2-5)");
            System.out.println("Database seeding complete.");
        };
    }
}
