// dto/FaqVoteRequest.java
package ssedamseedam.ssedam.dto;
import lombok.*;
import jakarta.validation.constraints.NotNull;

@Getter @Setter @NoArgsConstructor
public class FaqVoteRequest {
    public enum Vote { UP, DOWN, LIKE, DISLIKE }
    @NotNull private String userId;   // String으로 변경
    @NotNull private Vote vote;
}