// dto/FaqSearchCondition.java
package ssedamseedam.ssedam.dto;
import lombok.*;

@Getter @Setter @NoArgsConstructor
public class FaqSearchCondition {
    private String q;
    private String category;
    private Integer page;
    private Integer size;
}