package ssedamseedam.ssedam.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class UserLoginResponse {

    private Long userId;     // User 엔티티 PK
    private String username; // 로그인에 사용하는 아이디
    private String nickname; // 화면에 보여줄 닉네임
    private String message;  // "로그인 성공"
}
