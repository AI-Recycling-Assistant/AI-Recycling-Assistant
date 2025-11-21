package ssedamseedam.ssedam.dto;

import java.util.List;

public class AnalyzeImageResponseDto {

    private List<GeminiAdviceItemDto> gemini_advice;
    private String temp_path;
    private String model;

    public List<GeminiAdviceItemDto> getGemini_advice() {
        return gemini_advice;
    }

    public void setGemini_advice(List<GeminiAdviceItemDto> gemini_advice) {
        this.gemini_advice = gemini_advice;
    }

    public String getTemp_path() {
        return temp_path;
    }

    public void setTemp_path(String temp_path) {
        this.temp_path = temp_path;
    }

    public String getModel() {
        return model;
    }

    public void setModel(String model) {
        this.model = model;
    }
}