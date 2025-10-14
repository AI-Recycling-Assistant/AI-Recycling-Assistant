// src/main/java/ssedamseedam/ssedam/repository/FaqFeedbackRepository.java
package ssedamseedam.ssedam.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import ssedamseedam.ssedam.domain.FaqFeedback;

public interface FaqFeedbackRepository extends JpaRepository<FaqFeedback, Long> {
}