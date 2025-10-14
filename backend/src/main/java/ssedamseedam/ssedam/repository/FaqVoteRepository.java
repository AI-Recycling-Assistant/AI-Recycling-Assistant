package ssedamseedam.ssedam.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import ssedamseedam.ssedam.domain.FaqVote;
import ssedamseedam.ssedam.domain.Faq;
import ssedamseedam.ssedam.domain.User;

import java.util.Optional;

public interface FaqVoteRepository extends JpaRepository<FaqVote, Long> {
    Optional<FaqVote> findByUserAndFaq(User user, Faq faq);
}