package spike.fatbook.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import spike.fatbook.backend.model.AvvisoLettura;

import java.util.List;

@Repository
public interface AvvisoLetturaRepository extends JpaRepository<AvvisoLettura, Long> {
    boolean existsByAvvisoIdAndUtenteId(Long avvisoId, Long utenteId);

    long countByAvvisoId(Long avvisoId);

    List<AvvisoLettura> findAllByAvvisoIdOrderByLettoAtDesc(Long avvisoId);
}
