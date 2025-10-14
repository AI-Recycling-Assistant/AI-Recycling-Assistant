// dto/FaqFeedbackRequest.java
package ssedamseedam.ssedam.dto;
import lombok.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

@Getter @Setter @NoArgsConstructor
public class FaqFeedbackRequest {
    @NotNull private Long faqId;
    private Long userId;  // 비로그인도 허용 시 nullable
    @NotBlank private String reason; // "INFO_ERROR" | "POLICY_CHANGED" | "IMAGE_ISSUE" | "TEXT_ISSUE" | "OTHER"
    private String detail;
}