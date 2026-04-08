package spike.fatbook.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import spike.fatbook.backend.model.Assenza;

import java.time.LocalDate;
import java.util.List;

public interface AssenzaRepository extends JpaRepository<Assenza, Long> {
    public List<Assenza> findByData(LocalDate data);
}
