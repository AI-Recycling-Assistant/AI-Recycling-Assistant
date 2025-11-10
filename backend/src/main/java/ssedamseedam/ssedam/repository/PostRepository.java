package ssedamseedam.ssedam.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import ssedamseedam.ssedam.domain.Post;
import ssedamseedam.ssedam.domain.PostCategory;
import ssedamseedam.ssedam.domain.PostStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface PostRepository extends JpaRepository<Post, Long> {

    Page<Post> findByStatus(PostStatus status, Pageable pageable);

    Page<Post> findByCategoryAndStatus(PostCategory category, PostStatus status, Pageable pageable);
}