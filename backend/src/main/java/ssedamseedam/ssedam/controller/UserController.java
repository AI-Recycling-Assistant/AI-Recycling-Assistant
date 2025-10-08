package ssedamseedam.ssedam.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import ssedamseedam.ssedam.dto.UserLoginRequest;
import ssedamseedam.ssedam.dto.UserSignupRequest;
import ssedamseedam.ssedam.service.UserService;

import java.util.Map;

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
    public ResponseEntity<?> login(@Valid @RequestBody UserLoginRequest dto) {
        userService.login(dto);
        return ResponseEntity.ok(Map.of("message", "로그인 성공"));
    }
}