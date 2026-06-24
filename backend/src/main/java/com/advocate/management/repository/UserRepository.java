package com.advocate.management.repository;

import com.advocate.management.entity.User;
import com.advocate.management.enums.Role;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Repository interface for managing User entities.
 */
@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    /**
     * Finds a user by email.
     *
     * @param email the user's email address
     * @return an Optional containing the User if found, empty otherwise
     */
    Optional<User> findByEmail(String email);

    /**
     * Checks if a user exists with the given email.
     *
     * @param email the email to check
     * @return true if exists, false otherwise
     */
    boolean existsByEmail(String email);

    /**
     * Finds users by their role.
     *
     * @param role the user role
     * @return a list of Users matching the role
     */
    List<User> findByRole(Role role);
}
