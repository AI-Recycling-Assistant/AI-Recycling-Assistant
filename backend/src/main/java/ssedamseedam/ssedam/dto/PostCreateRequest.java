package ssedamseedam.ssedam.dto;

import lombok.Data;
import ssedamseedam.ssedam.domain.PostCategory;
import java.util.List;

@Data
public class PostCreateRequest {
    private PostCategory category;   // QUESTION / TIP / REVIEW
    private String title;
    private String content;
    private List<String> imageUrls;  // 업로드 후 받은 url
    private boolean draft;           // true면 임시저장
}