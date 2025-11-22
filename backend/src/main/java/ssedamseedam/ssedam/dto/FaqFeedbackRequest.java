// dto/FaqFeedbackRequest.java
package ssedamseedam.ssedam.dto;
import lombok.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

@Getter @Setter @NoArgsConstructor
public class FaqFeedbackRequest {
    private Long faqId;  // nullable로 변경
    private String userId;  // String으로 변경
    @NotBlank private String content;
    private String category;
}