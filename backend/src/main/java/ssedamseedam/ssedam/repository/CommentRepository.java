package ssedamseedam.ssedam.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import ssedamseedam.ssedam.domain.Comment;

import java.util.List;

public interface CommentRepository extends JpaRepository<Comment, Long> {

    List<Comment> findByPostIdAndParentIsNullOrderByCreatedAtAsc(Long postId);

    List<Comment> findByParentIdOrderByCreatedAtAsc(Long parentId);
}