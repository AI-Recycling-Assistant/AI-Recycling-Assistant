package ssedamseedam.ssedam.dto;

public class GeminiAdviceItemDto {

    private String object;       // "plastic cup"
    private String label;        // "plastic"
    private String instruction;  // "Rinse and discard ..."

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