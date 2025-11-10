package ssedamseedam.ssedam.dto;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
public class PostDetailResponse {

    private Long id;
    private String category;
    private String title;
    private String content;
    private String writer;
    private LocalDateTime createdAt;
    private int likeCount;
    private int commentCount;
    private List<String> images;
}