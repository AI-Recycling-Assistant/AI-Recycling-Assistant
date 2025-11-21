package ssedamseedam.ssedam.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import ssedamseedam.ssedam.dto.AnalyzeImageResponseDto;
import ssedamseedam.ssedam.service.AiAnalyzeService;

@RestController
@RequestMapping("/api/ai")
@RequiredArgsConstructor
public class AiController {

    private final AiAnalyzeService aiAnalyzeService;

    @PostMapping("/analyze-image")
    public ResponseEntity<AnalyzeImageResponseDto> analyzeImage(
            @RequestPart("image") MultipartFile image
    ) {
        AnalyzeImageResponseDto result = aiAnalyzeService.analyzeImage(image);

        if (result == null) {
            return ResponseEntity.internalServerError().build();
        }
        return ResponseEntity.ok(result);
    }
}