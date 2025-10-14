// dto/FaqSummaryResponse.java
package ssedamseedam.ssedam.dto;
import lombok.*;

@Getter @AllArgsConstructor
public class FaqSummaryResponse {
    private Long id;
    private String question;
    private String wasteType;
    private String category;
    private Long likeCount;
    private Long dislikeCount;
}