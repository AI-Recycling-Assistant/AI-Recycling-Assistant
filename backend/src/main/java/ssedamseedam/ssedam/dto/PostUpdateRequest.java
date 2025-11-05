package ssedamseedam.ssedam.dto;

import lombok.Data;
import ssedamseedam.ssedam.domain.PostCategory;

import java.util.List;

@Data
public class PostUpdateRequest {
    private PostCategory category;
    private String title;
    private String content;
    private List<String> imageUrls;
    private boolean publish; // 수정하면서 등록할지 여부
}