package spike.fatbook.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import spike.fatbook.backend.model.Docente;

public interface DocenteRepository extends JpaRepository<Docente, Long> {
}