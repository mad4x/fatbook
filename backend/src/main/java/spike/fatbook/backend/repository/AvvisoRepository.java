package spike.fatbook.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import spike.fatbook.backend.model.Avviso;

import java.util.List;

@Repository
public interface AvvisoRepository extends JpaRepository<Avviso, Long> {
    List<Avviso> findAllByOrderByDataCreazioneDescIdDesc();
}