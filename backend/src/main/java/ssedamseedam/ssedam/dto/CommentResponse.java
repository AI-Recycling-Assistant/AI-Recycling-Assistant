package ssedamseedam.ssedam.dto;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
public class CommentResponse {
    private Long id;
    private String writer;
    private String content;
    private int likeCount;
    private LocalDateTime createdAt;
    private List<CommentResponse> replies;
}