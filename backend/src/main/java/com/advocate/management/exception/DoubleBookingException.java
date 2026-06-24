package com.advocate.management.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

/**
 * Custom exception representing a 409 Conflict error for double-booking appointments.
 */
@ResponseStatus(HttpStatus.CONFLICT)
public class DoubleBookingException extends RuntimeException {

    public DoubleBookingException(String message) {
        super(message);
    }
}
