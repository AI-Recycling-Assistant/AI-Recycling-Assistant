package ssedamseedam.ssedam.service;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;   // ✅ 추가
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ssedamseedam.ssedam.domain.*;
import ssedamseedam.ssedam.dto.*;
import ssedamseedam.ssedam.repository.*;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class CommunityService {

    private final PostRepository postRepository;
    private final PostImageRepository postImageRepository;
    private final PostLikeRepository postLikeRepository;
    private final PostReportRepository postReportRepository;
    private final CommentRepository commentRepository;
    private final CommentLikeRepository commentLikeRepository;
    private final UserRepository userRepository;   // 기존에 있던 거 재사용

    /**
     * 게시글 목록
     */
    @Transactional(readOnly = true)
    public Page<PostSummaryResponse> getPosts(PostCategory category,
                                              int page,
                                              int size,
                                              Long currentUserId) {

        // ✅ createdAt 기준 내림차순 정렬(최신글 먼저)
        PageRequest pr = PageRequest.of(
                page,
                size,
                Sort.by(Sort.Direction.DESC, "createdAt")
        );

        Page<Post> posts;
        if (category == null) {
            posts = postRepository.findByStatus(PostStatus.PUBLISHED, pr);
        } else {
            posts = postRepository.findByCategoryAndStatus(category, PostStatus.PUBLISHED, pr);
        }

        return posts.map(p -> {
            Long authorId = (p.getAuthor() != null ? p.getAuthor().getId() : null);

            boolean liked = false;
            if (currentUserId != null) {
                liked = postLikeRepository
                        .findByPostIdAndUserId(p.getId(), currentUserId)
                        .isPresent();
            }

            boolean mine = currentUserId != null
                    && authorId != null
                    && authorId.equals(currentUserId);

            return PostSummaryResponse.builder()
                    .id(p.getId())
                    .category(p.getCategory().name())
                    .title(p.getTitle())
                    .writer(p.getAuthor() != null ? p.getAuthor().getNickname() : "익명")
                    .likeCount(p.getLikeCount())
                    .commentCount(p.getCommentCount())
                    .createdAt(p.getCreatedAt())
                    .content(p.getContent())
                    .hasPhoto(!p.getImages().isEmpty())
                    .authorId(authorId)
                    .liked(liked)
                    .mine(mine)
                    .build();
        });
    }

    /**
     * 게시글 상세
     */
    @Transactional(readOnly = true)
    public PostDetailResponse getPostDetail(Long postId, Long currentUserId) {
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new IllegalArgumentException("게시글이 없습니다."));

        return PostDetailResponse.builder()
                .id(post.getId())
                .category(post.getCategory().name())
                .title(post.getTitle())
                .content(post.getContent())
                .writer(post.getAuthor() != null ? post.getAuthor().getNickname() : "익명")
                .createdAt(post.getCreatedAt())
                .likeCount(post.getLikeCount())
                .commentCount(post.getCommentCount())
                .images(post.getImages().stream().map(PostImage::getImageUrl).toList())
                .build();
    }

    /**
     * 게시글 작성 (임시저장 포함)
     */
    public Long createPost(PostCreateRequest dto, Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("유저 없음"));

        Post post = Post.builder()
                .author(user)
                .category(dto.getCategory())
                .title(dto.getTitle())
                .content(dto.getContent())
                .status(dto.isDraft() ? PostStatus.DRAFT : PostStatus.PUBLISHED)
                .build();

        if (dto.getImageUrls() != null) {
            dto.getImageUrls().forEach(url -> post.addImage(
                    PostImage.builder().imageUrl(url).build()
            ));
        }

        postRepository.save(post);
        return post.getId();
    }

    /**
     * 게시글 수정
     */
    public void updatePost(Long postId, PostUpdateRequest dto, Long userId) {
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new IllegalArgumentException("게시글이 없습니다."));

        if (!post.getAuthor().getId().equals(userId)) {
            throw new IllegalStateException("본인 글만 수정 가능합니다.");
        }

        post.setCategory(dto.getCategory());
        post.setTitle(dto.getTitle());
        post.setContent(dto.getContent());

        // 이미지 교체
        post.getImages().clear();
        if (dto.getImageUrls() != null) {
            dto.getImageUrls().forEach(url -> post.addImage(
                    PostImage.builder().imageUrl(url).build()
            ));
        }

        if (dto.isPublish()) {
            post.setStatus(PostStatus.PUBLISHED);
        }
    }

    /**
     * 좋아요
     */
    public void likePost(Long postId, Long userId) {
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new IllegalArgumentException("게시글이 없습니다."));

        boolean already = postLikeRepository.findByPostIdAndUserId(postId, userId).isPresent();
        if (already) {
            return; // 이미 눌렀으면 무시
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("유저 없음"));

        PostLike like = PostLike.builder()
                .post(post)
                .user(user)
                .build();
        postLikeRepository.save(like);

        post.setLikeCount(post.getLikeCount() + 1);
    }

    /**
     * 댓글 작성 (대댓글 포함)
     */
    public Long createComment(Long postId, CommentCreateRequest dto, Long userId) {
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new IllegalArgumentException("게시글이 없습니다."));

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("유저 없음"));

        Comment comment = Comment.builder()
                .post(post)
                .author(user)
                .content(dto.getContent())
                .build();

        if (dto.getParentId() != null) {
            Comment parent = commentRepository.findById(dto.getParentId())
                    .orElseThrow(() -> new IllegalArgumentException("부모 댓글이 없습니다."));
            comment.setParent(parent);
        }

        commentRepository.save(comment);

        post.setCommentCount(post.getCommentCount() + 1);

        return comment.getId();
    }

    /**
     * 게시글의 댓글들 조회
     */
    @Transactional(readOnly = true)
    public List<CommentResponse> getComments(Long postId) {
        // 부모 댓글만 가져오고, 자식은 각각 조회
        List<Comment> parents = commentRepository.findByPostIdAndParentIsNullOrderByCreatedAtAsc(postId);

        return parents.stream()
                .map(this::toCommentResponse)
                .collect(Collectors.toList());
    }

    private CommentResponse toCommentResponse(Comment c) {
        List<CommentResponse> replies = c.getChildren().stream()
                .map(this::toCommentResponse)
                .collect(Collectors.toList());

        return CommentResponse.builder()
                .id(c.getId())
                .writer(c.getAuthor() != null ? c.getAuthor().getNickname() : "익명")
                .content(c.getContent())
                .likeCount(c.getLikeCount())
                .createdAt(c.getCreatedAt())
                .replies(replies)
                .build();
    }

    /**
     * 댓글 좋아요
     */
    public void likeComment(Long commentId, Long userId) {
        Comment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new IllegalArgumentException("댓글이 없습니다."));

        boolean already = commentLikeRepository.findByCommentIdAndUserId(commentId, userId).isPresent();
        if (already) return;

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("유저 없음"));

        CommentLike like = CommentLike.builder()
                .comment(comment)
                .user(user)
                .build();
        commentLikeRepository.save(like);

        comment.setLikeCount(comment.getLikeCount() + 1);
    }

    // 신고 메서드 위쪽 아무 데나 추가
    // 신고 메서드 위쪽 아무 데나 추가되어 있던 메서드 교체
    public void deletePost(Long postId, Long userId) {
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new IllegalArgumentException("게시글이 없습니다."));

        // 내가 쓴 글인지 검증
        if (post.getAuthor() == null || !post.getAuthor().getId().equals(userId)) {
            throw new IllegalStateException("본인 글만 삭제할 수 있습니다.");
        }

        // ✅ 물리 삭제 대신 "소프트 삭제" 처리
        //    - 상태를 PUBLISHED가 아닌 값으로 바꿔서 목록에서 안 보이게 함
        post.setStatus(PostStatus.DRAFT);  // 또는 DELETED 같은 상태가 있으면 그걸 사용

        // (선택) 내용 가리기
        post.setTitle("(삭제된 게시글입니다)");
        post.setContent("");
    }


    /**
     * 게시글 신고
     */
    public void reportPost(Long postId, PostReportRequest dto, Long userId) {
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new IllegalArgumentException("게시글이 없습니다."));

        boolean already = postReportRepository.findByPostIdAndReporterId(postId, userId).isPresent();
        if (already) {
            return; // 이미 신고한 사람
        }

        User reporter = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("유저 없음"));

        PostReport report = PostReport.builder()
                .post(post)
                .reporter(reporter)
                .reason(dto.getReason())
                .detail(dto.getDetail())
                .build();

        postReportRepository.save(report);
    }
}
