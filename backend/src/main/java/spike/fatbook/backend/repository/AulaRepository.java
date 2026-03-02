package spike.fatbook.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import spike.fatbook.backend.model.Aula;

public interface AulaRepository extends JpaRepository<Aula, Long> {
}