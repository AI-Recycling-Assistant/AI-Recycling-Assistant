package ssedamseedam.ssedam.service;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.multipart.MultipartFile;
import ssedamseedam.ssedam.dto.AnalyzeImageResponseDto;

@Service
@RequiredArgsConstructor
public class AiAnalyzeService {

    private final RestTemplate restTemplate;

    @Value("${ai.server.url:http://localhost:8000/analyze-image}")
    private String aiServerUrl;

    public AnalyzeImageResponseDto analyzeImage(MultipartFile file) {
        try {
            MultiValueMap<String, Object> body = new LinkedMultiValueMap<>();

            ByteArrayResource fileResource = new ByteArrayResource(file.getBytes()) {
                @Override
                public String getFilename() {
                    return file.getOriginalFilename();
                }
            };

            HttpHeaders fileHeaders = new HttpHeaders();
            fileHeaders.setContentType(MediaType.parseMediaType(file.getContentType()));

            HttpEntity<ByteArrayResource> fileEntity = new HttpEntity<>(fileResource, fileHeaders);
            body.add("image", fileEntity); // FastAPI 파라미터 이름이 image

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.MULTIPART_FORM_DATA);
            headers.setAccept(java.util.List.of(MediaType.APPLICATION_JSON));

            HttpEntity<MultiValueMap<String, Object>> requestEntity =
                    new HttpEntity<>(body, headers);

            ResponseEntity<AnalyzeImageResponseDto> response =
                    restTemplate.exchange(
                            aiServerUrl,
                            HttpMethod.POST,
                            requestEntity,
                            AnalyzeImageResponseDto.class
                    );

            return response.getBody();
        } catch (Exception e) {
            e.printStackTrace();
            return null;
        }
    }
}