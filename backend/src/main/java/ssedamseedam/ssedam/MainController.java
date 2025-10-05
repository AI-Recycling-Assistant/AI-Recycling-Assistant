package ssedamseedam.ssedam;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class MainController {

    @GetMapping("/")
    public String hello() {
        return "백엔드 서버 잘 돌아가고 있어요!";
    }
}