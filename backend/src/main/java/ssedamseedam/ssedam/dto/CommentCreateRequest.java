package ssedamseedam.ssedam.dto;

import lombok.Data;

@Data
public class CommentCreateRequest {
    private Long parentId;  // 대댓글일 때만
    private String content;
}