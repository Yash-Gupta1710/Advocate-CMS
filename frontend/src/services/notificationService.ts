import api from './api';

export interface Notification {
  id: string;
  userId: string;
  message: string;
  type: string;
  relatedEntityId?: string;
  isRead: boolean;
  createdAt: string;
}

export const notificationService = {
  getNotifications: async (): Promise<Notification[]> => {
    try {
      const response = await api.get<Notification[]>('/notifications');
      return response.data;
    } catch (error: any) {
      if (!error.response) {
        return [
          { id: '1', userId: 'u1', message: 'You have a new appointment request from John Smith.', type: 'APPOINTMENT', isRead: false, createdAt: new Date().toISOString() },
          { id: '2', userId: 'u1', message: 'Document "Case_Brief.pdf" has been uploaded.', type: 'DOCUMENT', isRead: true, createdAt: new Date(Date.now() - 86400000).toISOString() },
        ];
      }
      throw error.response?.data?.message || 'Failed to load notifications';
    }
  },

  getUnreadCount: async (): Promise<number> => {
    try {
      const response = await api.get<number>('/notifications/unread-count');
      return response.data;
    } catch (error: any) {
      if (!error.response) return 1;
      throw error;
    }
  },

  markAsRead: async (id: string): Promise<Notification> => {
    try {
      const response = await api.put<Notification>(`/notifications/${id}/read`);
      return response.data;
    } catch (error: any) {
      if (!error.response) {
        return { id, userId: 'u1', message: 'Marked as read', type: 'GENERAL', isRead: true, createdAt: new Date().toISOString() };
      }
      throw error.response?.data?.message || 'Failed to mark notification as read';
    }
  },

  markAllAsRead: async (): Promise<void> => {
    try {
      await api.put('/notifications/read-all');
    } catch (error: any) {
      if (!error.response) return;
      throw error.response?.data?.message || 'Failed to mark all as read';
    }
  }
};

export default notificationService;
