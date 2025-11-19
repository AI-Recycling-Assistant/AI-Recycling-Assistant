package ssedamseedam.ssedam.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import ssedamseedam.ssedam.domain.PostImage;

public interface PostImageRepository extends JpaRepository<PostImage, Long> {
}