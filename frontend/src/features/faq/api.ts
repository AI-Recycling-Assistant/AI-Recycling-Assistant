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
  wasteType?: string;
  excludeWasteTypes?: string[];
  page?: number;
  size?: number;
}

export interface FaqVoteRequest {
  userId: string;
  vote: 'LIKE';
}

export interface FaqFeedbackRequest {
  faqId?: number;
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
    if (params.wasteType) searchParams.append('wasteType', params.wasteType);
    if (params.excludeWasteTypes && params.excludeWasteTypes.length > 0) {
      params.excludeWasteTypes.forEach(type => {
        searchParams.append('excludeWasteTypes', type);
      });
    }
    searchParams.append('page', (params.page || 0).toString());
    searchParams.append('size', (params.size || 10).toString());

    const url = `/api/faqs?${searchParams}`;
    console.log('요청 URL:', url);
    console.log('요청 파라미터:', params);
    
    const result = await http(url);
    console.log('API 응답 결과:', result);
    return result;
  },

  // FAQ 상세 조회
  getFaqDetail: async (id: number): Promise<FaqDetail> => {
    return await http(`/api/faqs/${id}`);
  },

  // FAQ 추천/비추천
  voteFaq: async (id: number, voteData: FaqVoteRequest) => {
    console.log('투표 요청:', { id, voteData });
    const result = await http(`/api/faqs/${id}/vote`, {
      method: 'POST',
      body: voteData
    });
    console.log('투표 응답:', result);
    return result;
  },

  // 피드백 제출
  submitFeedback: async (feedbackData: FaqFeedbackRequest) => {
    console.log('피드백 요청:', feedbackData);
    const result = await http('/api/faqs/feedback', {
      method: 'POST',
      body: feedbackData
    });
    console.log('피드백 응답:', result);
    return result;
  },
  
  // 사용자 투표 상태 확인
  getVoteStatus: async (id: number, userId: string) => {
    return await http(`/api/faqs/${id}/vote-status?userId=${userId}`);
  },
};