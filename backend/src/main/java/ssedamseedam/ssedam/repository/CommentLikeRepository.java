package ssedamseedam.ssedam.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import ssedamseedam.ssedam.domain.CommentLike;

import java.util.Optional;

public interface CommentLikeRepository extends JpaRepository<CommentLike, Long> {

    Optional<CommentLike> findByCommentIdAndUserId(Long commentId, Long userId);
}