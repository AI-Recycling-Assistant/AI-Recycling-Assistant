package ssedamseedam.ssedam.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import ssedamseedam.ssedam.domain.Faq;
import java.util.List;

public interface FaqRepository extends JpaRepository<Faq, Long> {

    Page<Faq> findByCategory(String category, Pageable pageable);

    @Query("""
        SELECT f
        FROM Faq f
        WHERE (:category IS NULL OR f.category = :category)
          AND (:wasteType IS NULL OR f.wasteType = :wasteType)
          AND (:excludeWasteTypes IS NULL OR f.wasteType NOT IN :excludeWasteTypes)
          AND (
              :qLower IS NULL
              OR LOWER(f.question) LIKE CONCAT('%', :qLower, '%')
              OR LOWER(CAST(f.answer AS string)) LIKE CONCAT('%', :qLower, '%')
              OR LOWER(f.wasteType) LIKE CONCAT('%', :qLower, '%')
          )
        """)
    Page<Faq> search(@Param("qLower") String qLower,
                     @Param("category") String category,
                     @Param("wasteType") String wasteType,
                     @Param("excludeWasteTypes") List<String> excludeWasteTypes,
                     Pageable pageable);
}