import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  faqApi,
  FaqSearchParams,
  FaqVoteRequest,
  FaqFeedbackRequest,
  FaqDetail,
  FaqSummary,
} from './api';

export const useFaqList = (params: FaqSearchParams) => {
  return useQuery({
    queryKey: ['faqs', params],
    queryFn: () => {
      console.log('API 호출 파라미터:', params);
      return faqApi.searchFaqs(params);
    },
  });
};

export const useFaqDetail = (id: number) => {
  return useQuery({
    queryKey: ['faq', id],
    queryFn: () => faqApi.getFaqDetail(id),
    enabled: !!id,
  });
};

export const useFaqVote = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, voteData }: { id: number; voteData: FaqVoteRequest }) =>
      faqApi.voteFaq(id, voteData),

    onSuccess: (_data, { id }) => {
      // 서버와 동기화 (재요청)
      queryClient.invalidateQueries({ queryKey: ['faq', id] });
      queryClient.invalidateQueries({ queryKey: ['faqs'] });
    },
  });
};

export const useFaqFeedback = () => {
  return useMutation({
    mutationFn: (feedbackData: FaqFeedbackRequest) =>
      faqApi.submitFeedback(feedbackData),
  });
};