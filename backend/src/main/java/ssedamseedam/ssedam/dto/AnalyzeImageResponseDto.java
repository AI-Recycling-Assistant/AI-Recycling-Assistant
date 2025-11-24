package ssedamseedam.ssedam.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import java.util.List;

public class AnalyzeImageResponseDto {

    @JsonProperty("gemini_advice")
    private List<GeminiAdviceItemDto> geminiAdvice;

    @JsonProperty("temp_path")
    private String tempPath;

    @JsonProperty("model")
    private String model;

    public List<GeminiAdviceItemDto> getGeminiAdvice() {
        return geminiAdvice;
    }

    public void setGeminiAdvice(List<GeminiAdviceItemDto> geminiAdvice) {
        this.geminiAdvice = geminiAdvice;
    }

    public String getTempPath() {
        return tempPath;
    }

    public void setTempPath(String tempPath) {
        this.tempPath = tempPath;
    }

    public String getModel() {
        return model;
    }

    public void setModel(String model) {
        this.model = model;
    }
}