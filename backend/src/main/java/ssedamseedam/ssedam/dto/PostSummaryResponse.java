package ssedamseedam.ssedam.dto;

import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@Builder
public class PostSummaryResponse {

    private Long id;
    private String category;     // "QUESTION", "TIP"
    private String title;
    private String writer;       // 작성자 닉네임
    private int likeCount;
    private int commentCount;
    private LocalDateTime createdAt;

    // ✅ 앱 목록 화면용으로 추가한 필드들
    private String content;      // 미리보기용 본문
    private boolean hasPhoto;    // 이미지 첨부 여부

    private boolean liked;   // 목록에서도 하트 상태 표시용
    private boolean mine;    // 내 글 여부
}
