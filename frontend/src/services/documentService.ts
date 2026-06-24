import api from './api';

export interface Document {
  id: number;
  filename: string;
  originalFilename: string;
  contentType: string;
  size: number;
  category: string; // AADHAAR, PAN, PROPERTY_DEED, COURT_ORDER, AGREEMENT, OTHER
  ownerId: number;
  ownerName: string;
  caseId?: number;
  caseTitle?: string;
  uploadedAt: string;
}

export const documentService = {
  getDocuments: async (): Promise<Document[]> => {
    const { data } = await api.get('/documents');
    return data;
  },

  getCaseDocuments: async (caseId: number): Promise<Document[]> => {
    const { data } = await api.get(`/documents/case/${caseId}`);
    return data;
  },

  uploadDocument: async (file: File, category: string, caseId?: number): Promise<Document> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('category', category);
    if (caseId) {
      formData.append('caseId', caseId.toString());
    }

    const { data } = await api.post('/documents/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return data;
  },

  downloadDocument: async (id: number, filename: string): Promise<void> => {
    const response = await api.get(`/documents/download/${id}`, {
      responseType: 'blob',
    });

    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  },

  deleteDocument: async (id: number): Promise<void> => {
    await api.delete(`/documents/${id}`);
  },
};
