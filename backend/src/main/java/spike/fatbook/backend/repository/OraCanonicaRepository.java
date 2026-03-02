package spike.fatbook.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import spike.fatbook.backend.model.OraCanonica;

public interface OraCanonicaRepository extends JpaRepository<OraCanonica, Long> {
}