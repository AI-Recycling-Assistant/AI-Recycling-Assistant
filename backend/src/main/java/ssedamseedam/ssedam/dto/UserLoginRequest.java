package ssedamseedam.ssedam.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter @Setter @NoArgsConstructor
public class UserLoginRequest {
    @NotBlank(message = "아이디는 필수입니다.")
    private String username;          // ✅ 닉네임이 아니라 아이디로 로그인
    @NotBlank(message = "비밀번호는 필수입니다.")
    private String password;
}