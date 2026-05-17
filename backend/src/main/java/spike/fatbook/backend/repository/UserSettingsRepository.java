package spike.fatbook.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import spike.fatbook.backend.model.UserSettings;

import java.util.Optional;

public interface UserSettingsRepository extends JpaRepository<UserSettings, Long> {
    Optional<UserSettings> findByUtenteId(Long utenteId);
}
