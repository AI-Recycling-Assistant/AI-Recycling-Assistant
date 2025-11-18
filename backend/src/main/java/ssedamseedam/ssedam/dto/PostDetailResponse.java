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

    private boolean liked;   // 현재 로그인한 유저가 좋아요 눌렀는지
    private boolean mine;    // 내가 쓴 글인지
}