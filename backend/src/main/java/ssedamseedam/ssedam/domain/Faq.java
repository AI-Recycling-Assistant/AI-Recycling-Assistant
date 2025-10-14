package ssedamseedam.ssedam.domain;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
@Table(name = "faqs", indexes = {
        @Index(name="idx_faq_category", columnList = "category"),
        @Index(name="idx_faq_wasteType", columnList = "wasteType"),
        @Index(name="idx_faq_createdAt", columnList = "createdAt")
})
public class Faq {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable=false, length=120)
    private String question;

    @Lob @Column(nullable=false)
    private String answer;

    @Column(nullable=false, length=50)
    private String wasteType;   // 어떤 쓰레기인지

    @Column(nullable=false, length=50)
    private String category;    // 카테고리

    @Column(nullable=false)
    private Long likeCount;     // 추천수

    @Column(nullable=false)
    private Long dislikeCount;  // 비추천수(아쉬워요)

    @Column(nullable=false)
    private LocalDateTime createdAt;

    @PrePersist
    void prePersist() {
        if (createdAt == null) createdAt = LocalDateTime.now();
        if (likeCount == null) likeCount = 0L;
        if (dislikeCount == null) dislikeCount = 0L;
    }
}