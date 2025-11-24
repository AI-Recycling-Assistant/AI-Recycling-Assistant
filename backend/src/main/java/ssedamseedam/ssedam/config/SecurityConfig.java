package ssedamseedam.ssedam.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;

@Configuration
public class SecurityConfig {

    // 🔥 PasswordEncoder 등록 (필수)
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    // 🔥 SecurityFilterChain 통합 버전
    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {

        http
                // CSRF 비활성화 (REST API에서는 보통 끈다)
                .csrf(csrf -> csrf.disable())

                // CORS 허용
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))

                // 모든 요청 허용
                .authorizeHttpRequests(auth -> auth
                        .anyRequest().permitAll()
                )


                // 기본 Basic 인증 off (문제 생기면 활성)
                .httpBasic(Customizer.withDefaults());

        return http.build();
    }

    // 🔥 CORS 설정
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {

        CorsConfiguration configuration = new CorsConfiguration();

        // 모든 Origin 허용
        configuration.setAllowedOriginPatterns(Arrays.asList("*"));

        // 허용할 메서드
        configuration.setAllowedMethods(Arrays.asList(
                "GET", "POST", "PUT", "DELETE", "OPTIONS"
        ));

        // 요청 Header 허용
        configuration.setAllowedHeaders(Arrays.asList("*"));

        // 쿠키 인증 허용 여부 (필요 시 true)
        configuration.setAllowCredentials(true);

        // 전송 허용 경로 설정
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);

        return source;
    }
}