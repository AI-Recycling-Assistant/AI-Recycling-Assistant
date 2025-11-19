package ssedamseedam.ssedam.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import ssedamseedam.ssedam.domain.User;
import ssedamseedam.ssedam.dto.UserLoginRequest;
import ssedamseedam.ssedam.dto.UserLoginResponse;
import ssedamseedam.ssedam.dto.UserSignupRequest;
import ssedamseedam.ssedam.service.UserService;

import java.util.Map;

@CrossOrigin(origins = "http://localhost:8081")
@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    // 아이디 중복 확인
    @GetMapping("/check-username")
    public ResponseEntity<?> checkUsername(@RequestParam String username) {
        boolean ok = userService.isUsernameAvailable(username);
        return ResponseEntity.ok(Map.of("available", ok));
    }

    // 닉네임 중복 확인
    @GetMapping("/check-nickname")
    public ResponseEntity<?> checkNickname(@RequestParam String nickname) {
        boolean ok = userService.isNicknameAvailable(nickname);
        return ResponseEntity.ok(Map.of("available", ok));
    }

    // 회원가입
    @PostMapping("/signup")
    public ResponseEntity<?> signup(@Valid @RequestBody UserSignupRequest dto) {
        userService.register(dto);
        return ResponseEntity.ok(Map.of("message", "회원가입 성공"));
    }

    // 로그인 (아이디 + 비밀번호)
    @PostMapping("/login")
    public ResponseEntity<UserLoginResponse> login(
            @Valid @RequestBody UserLoginRequest dto
    ) {
        // 서비스에서 User 도메인을 받아옴
        User user = userService.login(dto);

        // 프론트가 필요로 하는 정보만 담은 DTO 생성
        UserLoginResponse res = new UserLoginResponse(
                user.getId(),          // userId
                user.getUsername(),    // username (로그인 아이디)
                user.getNickname(),    // nickname (커뮤니티 등에서 쓸 닉네임)
                "로그인 성공"           // message
        );

        return ResponseEntity.ok(res);
    }
}
