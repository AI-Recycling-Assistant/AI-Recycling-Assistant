package ssedamseedam.ssedam.dto;

import java.util.List;

public class GeminiAdviceDto {

    private String item_name;
    private String category;
    private List<String> disposal_steps;
    private List<String> warnings;
    private String short_summary;

    // getter / setter 전부
    public String getItem_name() {
        return item_name;
    }

    public void setItem_name(String item_name) {
        this.item_name = item_name;
    }

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    public List<String> getDisposal_steps() {
        return disposal_steps;
    }

    public void setDisposal_steps(List<String> disposal_steps) {
        this.disposal_steps = disposal_steps;
    }

    public List<String> getWarnings() {
        return warnings;
    }

    public void setWarnings(List<String> warnings) {
        this.warnings = warnings;
    }

    public String getShort_summary() {
        return short_summary;
    }

    public void setShort_summary(String short_summary) {
        this.short_summary = short_summary;
    }
}