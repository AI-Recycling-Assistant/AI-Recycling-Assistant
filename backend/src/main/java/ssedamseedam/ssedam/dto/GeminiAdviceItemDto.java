package ssedamseedam.ssedam.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

public class GeminiAdviceItemDto {

    @JsonProperty("object")
    private String object;

    @JsonProperty("label")
    private String label;

    @JsonProperty("instruction")
    private String instruction;

    public String getObject() {
        return object;
    }

    public void setObject(String object) {
        this.object = object;
    }

    public String getLabel() {
        return label;
    }

    public void setLabel(String label) {
        this.label = label;
    }

    public String getInstruction() {
        return instruction;
    }

    public void setInstruction(String instruction) {
        this.instruction = instruction;
    }
}