package ssedamseedam.ssedam.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.web.bind.annotation.*;
import ssedamseedam.ssedam.domain.PostCategory;
import ssedamseedam.ssedam.dto.*;
import ssedamseedam.ssedam.service.CommunityService;

import java.util.List;

@RestController
@RequestMapping("/api/community")
@CrossOrigin(origins = "http://localhost:8081")
@RequiredArgsConstructor
public class CommunityController {

    private final CommunityService communityService;

    /**
     * 게시글 목록
     * /api/community/posts?category=QUESTION&page=0&size=20
     * category 없으면 전체
     */
    @GetMapping("/posts")
    public Page<PostSummaryResponse> getPosts(
            @RequestParam(required = false) PostCategory category,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        return communityService.getPosts(category, page, size);
    }

    /**
     * 게시글 상세
     */
    @GetMapping("/posts/{postId}")
    public PostDetailResponse getPost(
            @PathVariable Long postId,
            @RequestParam Long userId   // TODO: 인증으로 대체
    ) {
        return communityService.getPostDetail(postId, userId);
    }

    /**
     * 게시글 작성 (임시저장 포함)
     */
    @PostMapping("/posts")
    public Long createPost(
            @RequestBody PostCreateRequest request,
            @RequestParam Long userId
    ) {
        return communityService.createPost(request, userId);
    }

    /**
     * 게시글 수정
     */
    @PutMapping("/posts/{postId}")
    public void updatePost(
            @PathVariable Long postId,
            @RequestBody PostUpdateRequest request,
            @RequestParam Long userId
    ) {
        communityService.updatePost(postId, request, userId);
    }

    /**
     * 게시글 좋아요
     */
    @PostMapping("/posts/{postId}/like")
    public void likePost(
            @PathVariable Long postId,
            @RequestParam Long userId
    ) {
        communityService.likePost(postId, userId);
    }

    /**
     * 댓글 목록
     */
    @GetMapping("/posts/{postId}/comments")
    public List<CommentResponse> getComments(@PathVariable Long postId) {
        return communityService.getComments(postId);
    }

    /**
     * 댓글 등록 (대댓글 포함)
     */
    @PostMapping("/posts/{postId}/comments")
    public Long createComment(
            @PathVariable Long postId,
            @RequestBody CommentCreateRequest request,
            @RequestParam Long userId
    ) {
        return communityService.createComment(postId, request, userId);
    }

    /**
     * 댓글 좋아요
     */
    @PostMapping("/comments/{commentId}/like")
    public void likeComment(
            @PathVariable Long commentId,
            @RequestParam Long userId
    ) {
        communityService.likeComment(commentId, userId);
    }

    /**
     * 게시글 신고
     */
    @PostMapping("/posts/{postId}/report")
    public void reportPost(
            @PathVariable Long postId,
            @RequestBody PostReportRequest request,
            @RequestParam Long userId
    ) {
        communityService.reportPost(postId, request, userId);
    }
}