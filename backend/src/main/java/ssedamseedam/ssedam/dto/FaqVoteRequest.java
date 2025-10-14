// dto/FaqVoteRequest.java
package ssedamseedam.ssedam.dto;
import lombok.*;
import jakarta.validation.constraints.NotNull;

@Getter @Setter @NoArgsConstructor
public class FaqVoteRequest {
    public enum Vote { LIKE, DISLIKE }
    @NotNull private Long userId;   // ★ 임시. 추후 JWT에서 추출
    @NotNull private Vote vote;
}