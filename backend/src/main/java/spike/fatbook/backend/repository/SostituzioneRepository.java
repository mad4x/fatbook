package spike.fatbook.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import spike.fatbook.backend.model.Sostituzione;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface SostituzioneRepository extends JpaRepository<Sostituzione, Long> {
    Optional<Sostituzione> findByAssenzaId(Long assenzaId);

    void deleteByAssenzaId(Long assenzaId);

    List<Sostituzione> findByDataOrderByOraAsc(LocalDate data);

    Optional<Sostituzione> findByDataAndOraAndClasseId(LocalDate data, int ora, Long classeId);

    List<Sostituzione> findByDocenteSostitutoIdAndDataBetween(Long docenteSostitutoId, LocalDate dataInizio, LocalDate dataFine);
}
