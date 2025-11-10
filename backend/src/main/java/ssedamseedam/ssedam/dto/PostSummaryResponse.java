package ssedamseedam.ssedam.dto;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class PostSummaryResponse {

    private Long id;
    private String category;     // "질문" 이런 식으로 프론트에서 변환해도 됨
    private String title;
    private String writer;
    private int likeCount;
    private int commentCount;
    private LocalDateTime createdAt;
}