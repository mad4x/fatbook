package spike.fatbook.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import spike.fatbook.backend.model.Assenza;

import java.time.LocalDate;
import java.util.List;

public interface AssenzaRepository extends JpaRepository<Assenza, Long> {
    List<Assenza> findByData(LocalDate data);

    List<Assenza> findByDataAndApprovataTrue(LocalDate data);

    List<Assenza> findByDocenteIdOrderByDataDesc(Long docenteId);

    List<Assenza> findByApprovataFalseOrderByDataAsc();

    List<Assenza> findByDocenteIdAndDataBetweenAndOraIn(Long docenteId, LocalDate dataInizio, LocalDate dataFine, List<Integer> ore);

    List<Assenza> findByDocenteIdAndDataBetweenAndApprovataTrue(Long docenteId, LocalDate dataInizio, LocalDate dataFine);

    List<Assenza> findByDocenteIdAndDataAndGiornalieraTrueAndApprovataFalse(Long docenteId, LocalDate data);
}
