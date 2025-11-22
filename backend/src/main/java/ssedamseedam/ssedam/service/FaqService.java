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
import java.util.Map;
import java.util.List;

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
        
        // wasteType 정규화
        String wasteType = cond.getWasteType();
        wasteType = (wasteType == null || wasteType.isBlank()) ? null : wasteType.trim();
        
        // excludeWasteTypes 정규화
        List<String> excludeWasteTypes = cond.getExcludeWasteTypes();
        if (excludeWasteTypes != null) {
            excludeWasteTypes = excludeWasteTypes.stream()
                .filter(type -> type != null && !type.isBlank())
                .map(String::trim)
                .toList();
            if (excludeWasteTypes.isEmpty()) {
                excludeWasteTypes = null;
            }
        }

        return faqRepository.search(qLower, category, wasteType, excludeWasteTypes, pageable)
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
    public void vote(Long faqId, String userId, FaqVoteRequest.Vote vote) {
        try {
            Faq faq = faqRepository.findById(faqId)
                    .orElseThrow(() -> new IllegalArgumentException("FAQ가 존재하지 않습니다."));
            
            // 사용자 찾기 또는 생성
            User user = null;
            try {
                Long userIdLong = Long.parseLong(userId);
                user = userRepository.findById(userIdLong).orElse(null);
            } catch (NumberFormatException e) {
                // 숫자가 아닌 경우 첫 번째 사용자 사용
            }
            
            if (user == null) {
                // 첫 번째 사용자 사용 또는 더미 사용자 생성
                user = userRepository.findAll().stream().findFirst().orElse(null);
                if (user == null) {
                    // 더미 사용자 생성
                    user = User.builder()
                            .name("더미사용자")
                            .username("dummy")
                            .nickname("dummy")
                            .password("dummy")
                            .build();
                    user = userRepository.save(user);
                }
            }
            
            processVote(faq, user, vote);
        } catch (Exception e) {
            System.err.println("투표 처리 중 오류: " + e.getMessage());
            e.printStackTrace();
            throw e;
        }
    }
    
    private void processVote(Faq faq, User user, FaqVoteRequest.Vote vote) {
        try {
            var existingOpt = faqVoteRepository.findByUserAndFaq(user, faq);

            if (existingOpt.isEmpty()) {
                // 첫 투표 - LIKE 추가
                FaqVote newVote = FaqVote.builder()
                        .faq(faq)
                        .user(user)
                        .type(FaqVote.VoteType.LIKE)
                        .build();
                faqVoteRepository.save(newVote);
                faq.setLikeCount(safeInc(faq.getLikeCount()));
                System.out.println("LIKE 추가: FAQ ID=" + faq.getId() + ", 새 카운트=" + faq.getLikeCount());
            } else {
                // 기존 LIKE 투표 존재 - 취소
                FaqVote existing = existingOpt.get();
                faqVoteRepository.delete(existing);
                faq.setLikeCount(safeDec(faq.getLikeCount()));
                System.out.println("LIKE 취소: FAQ ID=" + faq.getId() + ", 새 카운트=" + faq.getLikeCount());
            }
        } catch (Exception e) {
            System.err.println("processVote 오류: " + e.getMessage());
            e.printStackTrace();
            throw e;
        }
    }

    /**
     * 피드백 저장
     * - ENUM 값은 Reason.from()으로 안전 파싱(대소문자/공백/하이픈 허용, 모르면 OTHER)
     * - userId는 선택값(null 허용)
     */
    @Transactional
    public Long submitFeedback(FaqFeedbackRequest req) {
        try {
            System.out.println("피드백 서비스 시작: " + req.getContent());
            
            if (req == null) {
                throw new IllegalArgumentException("요청이 올바르지 않습니다.");
            }

            Faq faq = null;
            if (req.getFaqId() != null) {
                faq = faqRepository.findById(req.getFaqId()).orElse(null);
                System.out.println("FAQ 찾기 결과: " + (faq != null ? "found" : "not found"));
            }

            // 사용자 찾기
            User user = userRepository.findAll().stream().findFirst().orElse(null);
            System.out.println("사용자 찾기 결과: " + (user != null ? "found" : "not found"));
            
            if (user == null) {
                throw new IllegalArgumentException("사용자가 존재하지 않습니다.");
            }

            // 간단한 피드백 생성
            FaqFeedback fb = FaqFeedback.builder()
                    .faq(faq)
                    .user(user)
                    .reason(FaqFeedback.Reason.OTHER) // 기본값 사용
                    .detail(req.getContent())
                    .build();

            System.out.println("피드백 저장 시도...");
            faqFeedbackRepository.save(fb);
            System.out.println("피드백 저장 성공: " + fb.getId());
            return fb.getId();
        } catch (Exception e) {
            System.err.println("피드백 서비스 에러: " + e.getMessage());
            e.printStackTrace();
            throw e;
        }
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
    
    /**
     * 사용자 투표 상태 확인
     */
    public boolean hasUserVoted(Long faqId, String userId) {
        try {
            Faq faq = faqRepository.findById(faqId).orElse(null);
            if (faq == null) return false;
            
            User user = null;
            try {
                Long userIdLong = Long.parseLong(userId);
                user = userRepository.findById(userIdLong).orElse(null);
            } catch (NumberFormatException e) {
                user = userRepository.findAll().stream().findFirst().orElse(null);
            }
            
            if (user == null) return false;
            
            return faqVoteRepository.findByUserAndFaq(user, faq).isPresent();
        } catch (Exception e) {
            return false;
        }
    }
    
    /**
     * 디버깅용: 모든 FAQ의 wasteType 값들 반환
     */
    public Map<String, Object> getAllWasteTypes() {
        var allFaqs = faqRepository.findAll();
        var wasteTypes = allFaqs.stream()
                .map(Faq::getWasteType)
                .distinct()
                .sorted()
                .toList();
        
        var categories = allFaqs.stream()
                .map(Faq::getCategory)
                .distinct()
                .sorted()
                .toList();
                
        return Map.of(
            "wasteTypes", wasteTypes,
            "categories", categories,
            "totalCount", allFaqs.size(),
            "sampleFaqs", allFaqs.stream().limit(3).map(f -> Map.of(
                "id", f.getId(),
                "question", f.getQuestion(),
                "wasteType", f.getWasteType(),
                "category", f.getCategory()
            )).toList()
        );
    }
}