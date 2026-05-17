package spike.fatbook.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import spike.fatbook.backend.model.GlobalSettings;

public interface GlobalSettingsRepository extends JpaRepository<GlobalSettings, Long> {
}
