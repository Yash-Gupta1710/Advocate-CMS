import api from './api';

export interface Appointment {
  id: number;
  clientId: number;
  clientName: string;
  clientEmail: string;
  lawyerId: number;
  lawyerName: string;
  date: string;
  startTime: string;
  endTime: string;
  status: string;
  description: string;
  rejectionReason?: string;
  cancellationReason?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AvailabilitySlot {
  id: number;
  lawyerId: number;
  date: string;
  startTime: string;
  endTime: string;
  status: string;
  description?: string;
}

const appointmentService = {
  getMyAppointments: async (): Promise<Appointment[]> => {
    const { data } = await api.get('/appointments');
    return data;
  },

  requestAppointment: async (payload: {
    date: string;
    startTime: string;
    endTime: string;
    description: string;
  }): Promise<Appointment> => {
    const { data } = await api.post('/appointments', payload);
    return data;
  },

  approveAppointment: async (id: number): Promise<Appointment> => {
    const { data } = await api.put(`/appointments/${id}/approve`);
    return data;
  },

  rejectAppointment: async (id: number, reason: string): Promise<Appointment> => {
    const { data } = await api.put(`/appointments/${id}/reject`, { reason });
    return data;
  },

  rescheduleAppointment: async (id: number, payload: {
    date: string;
    startTime: string;
    endTime: string;
    description: string;
  }): Promise<Appointment> => {
    const { data } = await api.put(`/appointments/${id}/reschedule`, payload);
    return data;
  },

  cancelAppointment: async (id: number, reason: string): Promise<Appointment> => {
    const { data } = await api.put(`/appointments/${id}/cancel`, { reason });
    return data;
  },

  completeAppointment: async (id: number): Promise<Appointment> => {
    const { data } = await api.put(`/appointments/${id}/complete`);
    return data;
  },
};

const availabilityService = {
  getAvailability: async (startDate?: string, endDate?: string): Promise<AvailabilitySlot[]> => {
    const params: any = {};
    if (startDate) params.startDate = startDate;
    if (endDate) params.endDate = endDate;
    const { data } = await api.get('/availability', { params });
    return data;
  },

  getAvailabilityForDate: async (date: string): Promise<AvailabilitySlot[]> => {
    const { data } = await api.get('/availability/date', { params: { date } });
    return data;
  },

  createSlot: async (slot: {
    date: string;
    startTime: string;
    endTime: string;
    status: string;
    description?: string;
  }): Promise<AvailabilitySlot> => {
    const { data } = await api.post('/availability', slot);
    return data;
  },

  createRecurring: async (payload: {
    daysOfWeek: string[];
    startTime: string;
    endTime: string;
    weeksAhead: number;
    status: string;
    description?: string;
  }): Promise<AvailabilitySlot[]> => {
    const { data } = await api.post('/availability/recurring', payload);
    return data;
  },

  deleteSlot: async (id: number): Promise<void> => {
    await api.delete(`/availability/${id}`);
  },
};

export { appointmentService, availabilityService };
