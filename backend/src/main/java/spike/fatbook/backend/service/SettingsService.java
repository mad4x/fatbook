package spike.fatbook.backend.service;

import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;
import spike.fatbook.backend.dto.GlobalSettingsDTO;
import spike.fatbook.backend.dto.UserSettingsDTO;
import spike.fatbook.backend.model.GlobalSettings;
import spike.fatbook.backend.model.UserSettings;
import spike.fatbook.backend.model.Utente;
import spike.fatbook.backend.repository.GlobalSettingsRepository;
import spike.fatbook.backend.repository.UserSettingsRepository;
import spike.fatbook.backend.repository.UtenteRepository;

@Service
@RequiredArgsConstructor
public class SettingsService {

    private static final UserSettingsDTO DEFAULT_USER_SETTINGS = new UserSettingsDTO(
        "system",
        false,
        false,
        true,
        true,
        true,
        true,
        false
    );

    private final UtenteRepository utenteRepository;
    private final UserSettingsRepository userSettingsRepository;
    private final GlobalSettingsRepository globalSettingsRepository;

    @Transactional(readOnly = true)
    public UserSettingsDTO getUserSettings(String email) {
        Utente utente = utenteRepository.findByEmail(email)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Utente non trovato"));

        return userSettingsRepository.findByUtenteId(utente.getId())
            .map(this::toDto)
            .orElse(DEFAULT_USER_SETTINGS);
    }

    @Transactional
    public UserSettingsDTO updateUserSettings(String email, UserSettingsDTO dto) {
        Utente utente = utenteRepository.findByEmail(email)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Utente non trovato"));

        UserSettings settings = userSettingsRepository.findByUtenteId(utente.getId())
            .orElseGet(() -> createDefault(utente));

        settings.setTheme(dto.theme());
        settings.setCompactTables(dto.compactTables());
        settings.setReduceMotion(dto.reduceMotion());
        settings.setConfirmCritical(dto.confirmCritical());
        settings.setWeeklyDigest(dto.weeklyDigest());
        settings.setSmartHints(dto.smartHints());
        settings.setReminderOrario(dto.reminderOrario());
        settings.setLaboratorioDefault(dto.laboratorioDefault());

        return toDto(userSettingsRepository.save(settings));
    }

    @Transactional(readOnly = true)
    public GlobalSettingsDTO getGlobalSettings() {
        GlobalSettings settings = globalSettingsRepository.findById(1L)
            .orElseGet(() -> globalSettingsRepository.save(new GlobalSettings()));
        return new GlobalSettingsDTO(settings.getSchoolDomain());
    }

    @Transactional
    public GlobalSettingsDTO updateGlobalSettings(GlobalSettingsDTO dto) {
        GlobalSettings settings = globalSettingsRepository.findById(1L)
            .orElseGet(() -> new GlobalSettings());

        String domain = normalizeDomain(dto.schoolDomain());
        settings.setSchoolDomain(domain);
        globalSettingsRepository.save(settings);
        return new GlobalSettingsDTO(domain);
    }

    @Transactional(readOnly = true)
    public String getSchoolDomain() {
        return getGlobalSettings().schoolDomain();
    }

    private UserSettingsDTO toDto(UserSettings settings) {
        return new UserSettingsDTO(
            settings.getTheme(),
            settings.isCompactTables(),
            settings.isReduceMotion(),
            settings.isConfirmCritical(),
            settings.isWeeklyDigest(),
            settings.isSmartHints(),
            settings.isReminderOrario(),
            settings.isLaboratorioDefault()
        );
    }

    private UserSettings createDefault(Utente utente) {
        UserSettings settings = new UserSettings();
        settings.setUtente(utente);
        settings.setTheme(DEFAULT_USER_SETTINGS.theme());
        settings.setCompactTables(DEFAULT_USER_SETTINGS.compactTables());
        settings.setReduceMotion(DEFAULT_USER_SETTINGS.reduceMotion());
        settings.setConfirmCritical(DEFAULT_USER_SETTINGS.confirmCritical());
        settings.setWeeklyDigest(DEFAULT_USER_SETTINGS.weeklyDigest());
        settings.setSmartHints(DEFAULT_USER_SETTINGS.smartHints());
        settings.setReminderOrario(DEFAULT_USER_SETTINGS.reminderOrario());
        settings.setLaboratorioDefault(DEFAULT_USER_SETTINGS.laboratorioDefault());
        return userSettingsRepository.save(settings);
    }

    private String normalizeDomain(String domain) {
        if (domain == null) {
            return "";
        }
        String trimmed = domain.trim().toLowerCase();
        while (trimmed.startsWith("@")) {
            trimmed = trimmed.substring(1);
        }
        return trimmed;
    }
}
