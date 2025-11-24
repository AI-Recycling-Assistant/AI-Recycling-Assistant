package ssedamseedam.ssedam.service;

import lombok.RequiredArgsConstructor;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.multipart.MultipartFile;
import ssedamseedam.ssedam.dto.AnalyzeImageResponseDto;

import java.io.IOException;

@Service
@RequiredArgsConstructor
public class AiAnalyzeService {

    public AnalyzeImageResponseDto analyzeImage(MultipartFile image) {

        try {
            RestTemplate restTemplate = new RestTemplate();

            String fastApiUrl = "http://localhost:8000/analyze-image";

            // 🔥 FastAPI에 보낼 multipart form-data 생성
            MultiValueMap<String, Object> body = new LinkedMultiValueMap<>();
            body.add("image", new MultipartInputStreamFileResource(
                    image.getInputStream(), image.getOriginalFilename()
            ));

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.MULTIPART_FORM_DATA);

            HttpEntity<MultiValueMap<String, Object>> requestEntity =
                    new HttpEntity<>(body, headers);

            // 🔥 FastAPI 호출
            ResponseEntity<AnalyzeImageResponseDto> response =
                    restTemplate.exchange(
                            fastApiUrl,
                            HttpMethod.POST,
                            requestEntity,
                            AnalyzeImageResponseDto.class
                    );

            return response.getBody();

        } catch (IOException e) {
            e.printStackTrace();
            return null;
        }
    }
}