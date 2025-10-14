package ssedamseedam.ssedam.domain;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.Locale;

@Entity
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
@Table(name = "faq_feedback")
public class FaqFeedback {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** 어떤 FAQ에 대한 피드백인지 (필수) */
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "faq_id", nullable = false)
    private Faq faq;

    /** 피드백 남긴 사용자 (비로그인 허용 → null 가능) */
    @ManyToOne(fetch = FetchType.LAZY, optional = true)
    @JoinColumn(name = "user_id", nullable = true)
    private User user;

    /** 피드백 사유 */
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private Reason reason;

    /** 상세 설명 (선택) */
    @Column(length = 300)
    private String detail;

    @Column(nullable = false)
    private LocalDateTime createdAt;

    @PrePersist
    void prePersist() {
        if (createdAt == null) createdAt = LocalDateTime.now();
    }

    public enum Reason {
        WRONG_INFO, OUTDATED, NOT_CLEAR, IRRELEVANT, OTHER;

        /** 대소문자/공백/하이픈 허용, 모르면 OTHER */
        public static Reason from(String s) {
            if (s == null || s.isBlank()) return OTHER;
            String norm = s.trim()
                    .replace('-', '_')
                    .replace(' ', '_')
                    .toUpperCase(Locale.ROOT);
            try {
                return Reason.valueOf(norm);
            } catch (IllegalArgumentException e) {
                return OTHER;
            }
        }
    }
}