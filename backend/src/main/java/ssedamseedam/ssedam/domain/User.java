package ssedamseedam.ssedam.domain;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor @Builder
@Table(
        name = "users",
        indexes = {
                @Index(name = "idx_users_username", columnList = "username", unique = true),
                @Index(name = "idx_users_nickname", columnList = "nickname", unique = true)
        }
)
public class User {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 50)
    private String name;                // 이름

    @Column(nullable = false, length = 50, unique = true)
    private String username;            // 아이디 (로그인용, 중복 불가)

    @Column(nullable = false, length = 50, unique = true)
    private String nickname;            // 닉네임 (중복 불가)

    @Column(nullable = false, length = 255)
    private String password;            // 암호화된 비밀번호
}