package ssedamseedam.ssedam.domain;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Table(name = "faq_vote", uniqueConstraints = {
        @UniqueConstraint(columnNames = {"faq_id", "user_id"})
})
public class FaqVote {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** 어떤 FAQ에 대한 투표인지 (필수) */
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "faq_id", nullable = false)
    private Faq faq;

    /** 누가 투표했는지 (필수) */
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    /** LIKE / DISLIKE 구분 */
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 10)
    private VoteType type;

    public enum VoteType {
        LIKE, DISLIKE
    }
}