package com.advocate.management.service;

import com.advocate.management.dto.NotificationDTO;
import com.advocate.management.entity.Notification;
import com.advocate.management.entity.User;
import com.advocate.management.exception.ResourceNotFoundException;
import com.advocate.management.repository.NotificationRepository;
import com.advocate.management.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;

    private User getAuthenticatedUser() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Authenticated user not found"));
    }

    public List<NotificationDTO> getMyNotifications(boolean onlyUnread) {
        User user = getAuthenticatedUser();
        List<Notification> list;
        if (onlyUnread) {
            list = notificationRepository.findByRecipientIdAndIsReadOrderByCreatedAtDesc(user.getId(), false);
        } else {
            list = notificationRepository.findByRecipientIdOrderByCreatedAtDesc(user.getId());
        }
        return list.stream().map(this::mapToDTO).collect(Collectors.toList());
    }

    @Transactional
    public void markAsRead(Long id) {
        User user = getAuthenticatedUser();
        Notification notification = notificationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Notification not found with ID: " + id));

        if (!notification.getRecipient().getId().equals(user.getId())) {
            throw new ResourceNotFoundException("Notification not found for this user");
        }

        notification.setRead(true);
        notificationRepository.save(notification);
    }

    @Transactional
    public void markAllAsRead() {
        User user = getAuthenticatedUser();
        List<Notification> unread = notificationRepository.findByRecipientIdAndIsReadOrderByCreatedAtDesc(user.getId(), false);
        for (Notification n : unread) {
            n.setRead(true);
        }
        notificationRepository.saveAll(unread);
    }

    public long getUnreadCount() {
        User user = getAuthenticatedUser();
        return notificationRepository.countByRecipientIdAndIsRead(user.getId(), false);
    }

    @Transactional
    public void sendNotification(User recipient, String message) {
        Notification notification = Notification.builder()
                .recipient(recipient)
                .message(message)
                .isRead(false)
                .build();
        notificationRepository.save(notification);
    }

    private NotificationDTO mapToDTO(Notification notification) {
        return NotificationDTO.builder()
                .id(notification.getId())
                .message(notification.getMessage())
                .isRead(notification.isRead())
                .createdAt(notification.getCreatedAt())
                .build();
    }
}
