import { http } from '../../utils/http';

export interface FaqSummary {
  id: number;
  question: string;
  wasteType: string;
  category: string;
  likeCount: number;
  dislikeCount: number;
}

export interface FaqDetail {
  id: number;
  question: string;
  answer: string;
  wasteType: string;
  category: string;
  likeCount: number;
  dislikeCount: number;
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

    return await http(`/api/faqs?${searchParams}`);
  },

  // FAQ 상세 조회
  getFaqDetail: async (id: number): Promise<FaqDetail> => {
    return await http(`/api/faqs/${id}`);
  },

  // FAQ 추천/비추천
  voteFaq: async (id: number, voteData: FaqVoteRequest) => {
    return await http(`/api/faqs/${id}/vote`, {
      method: 'POST',
      body: voteData
    });
  },

  // 피드백 제출
  submitFeedback: async (feedbackData: FaqFeedbackRequest) => {
    return await http('/api/faqs/feedback', {
      method: 'POST',
      body: feedbackData
    });
  },
};