package ssedamseedam.ssedam.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import ssedamseedam.ssedam.domain.PostLike;

import java.util.Optional;

public interface PostLikeRepository extends JpaRepository<PostLike, Long> {

    Optional<PostLike> findByPostIdAndUserId(Long postId, Long userId);

    int countByPostId(Long postId);
}