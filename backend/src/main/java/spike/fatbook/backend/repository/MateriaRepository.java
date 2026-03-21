package spike.fatbook.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import spike.fatbook.backend.model.Materia;

public interface MateriaRepository extends JpaRepository<Materia, Long> {
}
