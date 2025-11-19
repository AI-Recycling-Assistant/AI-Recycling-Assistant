package ssedamseedam.ssedam.dto;

import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@Builder
public class PostSummaryResponse {

    private Long id;
    private String category;
    private String title;
    private String writer;
    private int likeCount;
    private int commentCount;
    private LocalDateTime createdAt;

    private String content;
    private boolean hasPhoto;

    private boolean liked;   // ✅ 좋아요 여부
    private Long authorId;   // ✅ 작성자 id
    private boolean mine;    // ✅ 내 글 여부
}
