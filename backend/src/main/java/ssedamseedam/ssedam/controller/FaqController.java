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

    /** 검색/목록 (q, category, page, size) */
    @GetMapping
    public ResponseEntity<Page<FaqSummaryResponse>> search(
            @RequestParam(required = false) String q,
            @RequestParam(required = false) String category,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        FaqSearchCondition cond = new FaqSearchCondition();
        cond.setQ(q);
        cond.setCategory(category);
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
        faqService.vote(id, req.getUserId(), req.getVote());
        // 리소스 상태 변경성에 맞춰 200 OK 반환
        return ResponseEntity.ok(Map.of("message", "반영 완료"));
    }

    /** 피드백 제출 */
    @PostMapping("/feedback")
    public ResponseEntity<?> feedback(@Valid @RequestBody FaqFeedbackRequest req) {
        Long savedId = faqService.submitFeedback(req);
        // 생성 의미가 있으므로 201 Created + Location 헤더
        return ResponseEntity
                .created(URI.create("/api/faqs/feedback/" + savedId))
                .body(Map.of("id", savedId, "message", "피드백 감사해요!"));
    }
}