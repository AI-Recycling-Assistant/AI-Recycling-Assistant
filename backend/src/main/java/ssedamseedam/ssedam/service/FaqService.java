// service/FaqService.java
package ssedamseedam.ssedam.service;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ssedamseedam.ssedam.domain.*;
import ssedamseedam.ssedam.dto.*;
import ssedamseedam.ssedam.repository.*;

import java.util.Locale;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class FaqService {

    private final FaqRepository faqRepository;
    private final FaqVoteRepository faqVoteRepository;
    private final FaqFeedbackRepository faqFeedbackRepository;
    private final UserRepository userRepository;

    /**
     * FAQ 검색
     * - 키워드: null/blank → null 로 정규화, 나머지는 Locale.ROOT 기준 소문자화
     * - 카테고리: null/blank → null 로 정규화 후 필터
     * - 정렬: likeCount, createdAt DESC (필드명 엔티티와 일치 필요)
     */
    public Page<FaqSummaryResponse> search(FaqSearchCondition cond) {
        // null 안전
        if (cond == null) cond = new FaqSearchCondition();

        // 페이지/사이즈 가드
        int page = Optional.ofNullable(cond.getPage()).orElse(0);
        int size = Optional.ofNullable(cond.getSize()).orElse(10);
        if (page < 0) page = 0;
        if (size <= 0) size = 10;
        if (size > 200) size = 200; // 과도한 요청 방지

        Pageable pageable = PageRequest.of(
                page,
                size,
                Sort.by(Sort.Direction.DESC, "likeCount", "createdAt")
        );

        // 키워드 정규화 (소문자, 공백 트리밍)
        String q = cond.getQ();
        String qLower = (q == null || q.isBlank())
                ? null
                : q.trim().toLowerCase(Locale.ROOT);

        // 카테고리 정규화
        String category = cond.getCategory();
        category = (category == null || category.isBlank()) ? null : category.trim();

        return faqRepository.search(qLower, category, pageable)
                .map(f -> new FaqSummaryResponse(
                        f.getId(),
                        f.getQuestion(),
                        f.getWasteType(),
                        f.getCategory(),
                        f.getLikeCount(),
                        f.getDislikeCount()
                ));
    }

    /**
     * 단건 조회
     */
    public FaqResponse get(Long id) {
        Faq f = faqRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("FAQ가 존재하지 않습니다."));
        return new FaqResponse(
                f.getId(),
                f.getQuestion(),
                f.getAnswer(),
                f.getWasteType(),
                f.getCategory(),
                f.getLikeCount(),
                f.getDislikeCount(),
                f.getCreatedAt()
        );
    }

    /**
     * 추천/비추천
     * - 계정당 1개, 서로 전환 가능
     * - 동일 선택이면 NOP
     * - 집계는 음수 방지
     */
    @Transactional
    public void vote(Long faqId, Long userId, FaqVoteRequest.Vote vote) {
        Faq faq = faqRepository.findById(faqId)
                .orElseThrow(() -> new IllegalArgumentException("FAQ가 존재하지 않습니다."));
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("사용자가 존재하지 않습니다."));

        var existingOpt = faqVoteRepository.findByUserAndFaq(user, faq);

        FaqVote.VoteType newType = (vote == FaqVoteRequest.Vote.LIKE)
                ? FaqVote.VoteType.LIKE
                : FaqVote.VoteType.DISLIKE;

        if (existingOpt.isEmpty()) {
            // 첫 투표
            FaqVote newVote = FaqVote.builder()
                    .faq(faq)
                    .user(user)
                    .type(newType)
                    .build();
            faqVoteRepository.save(newVote);

            if (newType == FaqVote.VoteType.LIKE) {
                faq.setLikeCount(safeInc(faq.getLikeCount()));
            } else {
                faq.setDislikeCount(safeInc(faq.getDislikeCount()));
            }
            return;
        }

        // 기존 투표 존재: 전환/유지
        FaqVote existing = existingOpt.get();
        if (existing.getType() == newType) {
            // 동일 선택이면 아무 것도 하지 않음
            return;
        }

        // 전환
        if (existing.getType() == FaqVote.VoteType.LIKE) {
            faq.setLikeCount(safeDec(faq.getLikeCount()));
            faq.setDislikeCount(safeInc(faq.getDislikeCount()));
        } else {
            faq.setDislikeCount(safeDec(faq.getDislikeCount()));
            faq.setLikeCount(safeInc(faq.getLikeCount()));
        }
        existing.setType(newType);
        // JPA dirty checking 으로 flush 시점 반영
    }

    /**
     * 피드백 저장
     * - ENUM 값은 Reason.from()으로 안전 파싱(대소문자/공백/하이픈 허용, 모르면 OTHER)
     * - userId는 선택값(null 허용)
     */
    @Transactional
    public Long submitFeedback(FaqFeedbackRequest req) {
        if (req == null) {
            throw new IllegalArgumentException("요청이 올바르지 않습니다.");
        }

        Faq faq = faqRepository.findById(req.getFaqId())
                .orElseThrow(() -> new IllegalArgumentException("FAQ가 존재하지 않습니다."));

        // 🔽 여기만 핵심 변경: 안전 파서 사용
        FaqFeedback.Reason reason = FaqFeedback.Reason.from(req.getReason());

        User user = null;
        if (req.getUserId() != null) {
            user = userRepository.findById(req.getUserId()).orElse(null); // 비로그인 허용
        }

        FaqFeedback fb = FaqFeedback.builder()
                .faq(faq)
                .user(user)
                .reason(reason)
                .detail(req.getDetail())
                .build();

        faqFeedbackRepository.save(fb);
        return fb.getId();
    }

    /**
     * 음수 방지 증가
     */
    private Long safeInc(Long v) {
        return (v == null ? 1L : v + 1L);
    }

    /**
     * 음수 방지 감소
     */
    private Long safeDec(Long v) {
        long cur = (v == null ? 0L : v);
        return Math.max(0L, cur - 1L);
    }
}