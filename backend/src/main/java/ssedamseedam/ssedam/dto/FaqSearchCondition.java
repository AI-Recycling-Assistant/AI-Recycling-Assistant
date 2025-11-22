// dto/FaqSearchCondition.java
package ssedamseedam.ssedam.dto;
import lombok.*;
import java.util.List;

@Getter @Setter @NoArgsConstructor
public class FaqSearchCondition {
    private String q;
    private String category;
    private String wasteType;
    private List<String> excludeWasteTypes;
    private Integer page;
    private Integer size;
}