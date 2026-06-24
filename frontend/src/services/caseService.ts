import api from './api';

export interface Case {
  id: number;
  caseNumber: string;
  title: string;
  description: string;
  clientId: number;
  clientName: string;
  lawyerId: number;
  lawyerName: string;
  status: string; // PENDING, ACTIVE, DISPOSED, APPEALED
  priority: string; // LOW, MEDIUM, HIGH, CRITICAL
  courtName: string;
  judgeName?: string;
  filingDate: string;
  opposingParty?: string;
  opposingAdvocate?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Hearing {
  id: number;
  caseId: number;
  caseTitle: string;
  caseNumber: string;
  hearingDate: string;
  purpose: string;
  status: string; // SCHEDULED, ADJOURNED, CONCLUDED
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CaseTimeline {
  id: number;
  caseId: number;
  title: string;
  description: string;
  eventDate: string;
  createdAt: string;
}

export const caseService = {
  getCases: async (): Promise<Case[]> => {
    const { data } = await api.get('/cases');
    return data;
  },

  getCaseById: async (id: number): Promise<Case> => {
    const { data } = await api.get(`/cases/${id}`);
    return data;
  },

  createCase: async (payload: Omit<Case, 'id' | 'clientName' | 'lawyerId' | 'lawyerName' | 'createdAt' | 'updatedAt'>): Promise<Case> => {
    const { data } = await api.post('/cases', payload);
    return data;
  },

  updateCase: async (id: number, payload: Omit<Case, 'id' | 'clientName' | 'lawyerId' | 'lawyerName' | 'createdAt' | 'updatedAt'>): Promise<Case> => {
    const { data } = await api.put(`/cases/${id}`, payload);
    return data;
  },

  deleteCase: async (id: number): Promise<void> => {
    await api.delete(`/cases/${id}`);
  },

  getTimeline: async (caseId: number): Promise<CaseTimeline[]> => {
    const { data } = await api.get(`/cases/${caseId}/timeline`);
    return data;
  },

  addTimelineEvent: async (caseId: number, payload: { title: string; description: string; eventDate: string }): Promise<CaseTimeline> => {
    const { data } = await api.post(`/cases/${caseId}/timeline`, payload);
    return data;
  },

  getHearings: async (caseId: number): Promise<Hearing[]> => {
    const { data } = await api.get(`/cases/${caseId}/hearings`);
    return data;
  },

  scheduleHearing: async (caseId: number, payload: { hearingDate: string; purpose: string; notes?: string; status?: string }): Promise<Hearing> => {
    const { data } = await api.post(`/cases/${caseId}/hearings`, payload);
    return data;
  },

  updateHearingStatus: async (hearingId: number, status: string, notes?: string): Promise<Hearing> => {
    const { data } = await api.put(`/hearings/${hearingId}/status`, { status, notes });
    return data;
  },

  getUpcomingHearings: async (): Promise<Hearing[]> => {
    const { data } = await api.get('/hearings/upcoming');
    return data;
  },
};
