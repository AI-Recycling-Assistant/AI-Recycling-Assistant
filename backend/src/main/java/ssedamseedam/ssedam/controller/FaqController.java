// controller/FaqController.java
package ssedamseedam.ssedam.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import ssedamseedam.ssedam.dto.*;
import ssedamseedam.ssedam.service.FaqService;

import java.net.URI;
import java.util.Map;
import java.util.List;

@RestController
@RequestMapping("/api/faqs")
@RequiredArgsConstructor
public class FaqController {

    private final FaqService faqService;

    /** 상세 조회 */
    @GetMapping("/{id}")
    public ResponseEntity<FaqResponse> get(@PathVariable Long id) {
        return ResponseEntity.ok(faqService.get(id));
    }

    /** 검색/목록 (q, category, wasteType, excludeWasteTypes, page, size) */
    @GetMapping
    public ResponseEntity<Page<FaqSummaryResponse>> search(
            @RequestParam(required = false) String q,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String wasteType,
            @RequestParam(required = false) List<String> excludeWasteTypes,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        FaqSearchCondition cond = new FaqSearchCondition();
        cond.setQ(q);
        cond.setCategory(category);
        cond.setWasteType(wasteType);
        cond.setExcludeWasteTypes(excludeWasteTypes);
        cond.setPage(page);
        cond.setSize(size);

        Page<FaqSummaryResponse> result = faqService.search(cond);
        return ResponseEntity.ok(result);
    }

    /** 추천/비추천 */
    @PostMapping("/{id}/vote")
    public ResponseEntity<?> vote(
            @PathVariable Long id,
            @Valid @RequestBody FaqVoteRequest req
    ) {
        try {
            System.out.println("투표 요청 받음: FAQ ID=" + id + ", 사용자 ID=" + req.getUserId() + ", 투표=" + req.getVote());
            faqService.vote(id, req.getUserId(), req.getVote());
            System.out.println("투표 처리 완료: FAQ ID=" + id);
            return ResponseEntity.ok(Map.of("message", "반영 완료"));
        } catch (Exception e) {
            System.err.println("투표 컨트롤러 에러: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(500).body(Map.of("error", e.getMessage()));
        }
    }

    /** 피드백 제출 */
    @PostMapping("/feedback")
    public ResponseEntity<?> feedback(@RequestBody Map<String, Object> req) {
        System.out.println("피드백 요청 받음: " + req);
        // 일단 성공 응답만 반환
        return ResponseEntity.ok(Map.of("message", "피드백 감사해요!", "id", 1));
    }
    
    /** 디버깅용: 모든 FAQ의 wasteType 확인 */
    @GetMapping("/debug/waste-types")
    public ResponseEntity<?> getWasteTypes() {
        return ResponseEntity.ok(faqService.getAllWasteTypes());
    }
    
    /** 사용자 투표 상태 확인 */
    @GetMapping("/{id}/vote-status")
    public ResponseEntity<?> getVoteStatus(
            @PathVariable Long id,
            @RequestParam String userId
    ) {
        boolean hasVoted = faqService.hasUserVoted(id, userId);
        return ResponseEntity.ok(Map.of("hasVoted", hasVoted));
    }
}