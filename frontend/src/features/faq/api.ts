import axios from 'axios';

const httpClient = axios.create({
  baseURL: 'http://localhost:8080',
  timeout: 10000,
});

export interface FaqSummary {
  id: number;
  question: string;
  category: string;
  helpful: number;
}

export interface FaqDetail {
  id: number;
  question: string;
  answer: string;
  category: string;
  helpful: number;
  createdAt: string;
}

export interface FaqSearchParams {
  q?: string;
  category?: string;
  page?: number;
  size?: number;
}

export interface FaqVoteRequest {
  userId: string;
  vote: 'UP' | 'DOWN';
}

export interface FaqFeedbackRequest {
  userId: string;
  content: string;
  category: string;
}

export const faqApi = {
  // FAQ 목록 조회
  searchFaqs: async (params: FaqSearchParams = {}) => {
    const searchParams = new URLSearchParams();
    if (params.q) searchParams.append('q', params.q);
    if (params.category) searchParams.append('category', params.category);
    searchParams.append('page', (params.page || 0).toString());
    searchParams.append('size', (params.size || 10).toString());

    const response = await httpClient.get(`/api/faqs?${searchParams}`);
    return response.data;
  },

  // FAQ 상세 조회
  getFaqDetail: async (id: number): Promise<FaqDetail> => {
    const response = await httpClient.get(`/api/faqs/${id}`);
    return response.data;
  },

  // FAQ 추천/비추천
  voteFaq: async (id: number, voteData: FaqVoteRequest) => {
    const response = await httpClient.post(`/api/faqs/${id}/vote`, voteData);
    return response.data;
  },

  // 피드백 제출
  submitFeedback: async (feedbackData: FaqFeedbackRequest) => {
    const response = await httpClient.post('/api/faqs/feedback', feedbackData);
    return response.data;
  },
};