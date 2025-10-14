// dto/FaqResponse.java
package ssedamseedam.ssedam.dto;
import lombok.*;
import java.time.LocalDateTime;

@Getter @AllArgsConstructor
public class FaqResponse {
    private Long id;
    private String question;
    private String answer;
    private String wasteType;
    private String category;
    private Long likeCount;
    private Long dislikeCount;
    private LocalDateTime createdAt;
}