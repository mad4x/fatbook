package spike.fatbook.backend.service;

import org.springframework.stereotype.Service;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import spike.fatbook.backend.enums.PrioritaAvviso;
import spike.fatbook.backend.enums.StatoAvviso;
import spike.fatbook.backend.model.Avviso;
import spike.fatbook.backend.repository.AvvisoRepository;

import java.time.LocalDate;
import java.nio.charset.StandardCharsets;
import java.util.Base64;
import java.util.Collection;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class AvvisoService {

    private final AvvisoRepository avvisoRepository;

    public AvvisoService(AvvisoRepository avvisoRepository) {
        this.avvisoRepository = avvisoRepository;
    }

    public List<Avviso> getAll() {
        return avvisoRepository.findAllByOrderByDataCreazioneDescIdDesc();
    }

    public List<Avviso> getAllVisible() {
        return getAll().stream()
                .filter(this::isVisibleForCurrentUser)
                .toList();
    }

    public Optional<Avviso> getById(Long id) {
        return avvisoRepository.findById(id);
    }

    public Optional<Avviso> getByIdVisible(Long id) {
        return getById(id).filter(this::isVisibleForCurrentUser);
    }

    public Avviso create(
            String titolo,
            String contenuto,
            String autore,
            String categoria,
            List<String> tags,
            List<String> allegati,
            PrioritaAvviso priorita,
            StatoAvviso stato
    ) {
        Avviso avviso = new Avviso();
        avviso.setTitolo(titolo);
        avviso.setContenuto(contenuto);
        avviso.setAutore(autore);
        avviso.setPriorita(priorita == null ? PrioritaAvviso.NORMALE : priorita);
        avviso.setStato(stato == null ? StatoAvviso.PUBBLICATO : stato);
        avviso.setCategoria(normalizeCategoria(categoria));
        avviso.setTagsCsv(toCsv(tags));
        avviso.setAllegatiCsv(toAllegatiStorage(allegati));
        avviso.setData(LocalDate.now());
        avviso.setLetto(false);
        avviso.setDescrizione(contenuto);
        String attore = currentActor();
        avviso.setCreatoDa(attore);
        avviso.setAggiornatoDa(attore);
        return avvisoRepository.save(avviso);
    }

    public Optional<Avviso> update(
            Long id,
            String titolo,
            String contenuto,
            String autore,
            String categoria,
            List<String> tags,
            List<String> allegati,
            PrioritaAvviso priorita,
            StatoAvviso stato
    ) {
        Optional<Avviso> avvisoOptional = avvisoRepository.findById(id);
        if (avvisoOptional.isEmpty()) {
            return Optional.empty();
        }

        Avviso avviso = avvisoOptional.get();
        avviso.setTitolo(titolo);
        avviso.setContenuto(contenuto);
        avviso.setAutore(autore);
        avviso.setPriorita(priorita == null ? PrioritaAvviso.NORMALE : priorita);
        avviso.setStato(stato == null ? StatoAvviso.PUBBLICATO : stato);
        avviso.setCategoria(normalizeCategoria(categoria));
        avviso.setTagsCsv(toCsv(tags));
        avviso.setAllegatiCsv(toAllegatiStorage(allegati));
        if (avviso.getData() == null) {
            avviso.setData(LocalDate.now());
        }
        avviso.setDescrizione(contenuto);
        if (avviso.getCreatoDa() == null || avviso.getCreatoDa().isBlank()) {
            avviso.setCreatoDa(currentActor());
        }
        avviso.setAggiornatoDa(currentActor());
        return Optional.of(avvisoRepository.save(avviso));
    }

    public boolean delete(Long id) {
        if (!avvisoRepository.existsById(id)) {
            return false;
        }

        avvisoRepository.deleteById(id);
        return true;
    }

    private String normalizeCategoria(String categoria) {
        String normalized = categoria == null ? "" : categoria.trim();
        return normalized.isBlank() ? "Generale" : normalized;
    }

    private String toCsv(List<String> values) {
        if (values == null || values.isEmpty()) {
            return "";
        }

        return values.stream()
                .map(value -> value == null ? "" : value.trim())
                .filter(value -> !value.isBlank())
                .distinct()
                .collect(Collectors.joining(", "));
    }

    private String toAllegatiStorage(List<String> allegati) {
        List<String> normalized = allegati == null
                ? List.of()
                : allegati.stream()
                .map(value -> value == null ? "" : value.trim())
                .filter(value -> !value.isBlank())
                .distinct()
                .toList();

        return normalized.stream()
                .map(value -> Base64.getUrlEncoder().encodeToString(value.getBytes(StandardCharsets.UTF_8)))
                .collect(Collectors.joining(","));
    }

    private String currentActor() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null) {
            return "sistema";
        }

        String name = authentication.getName();
        if (name == null || name.isBlank() || "anonymousUser".equalsIgnoreCase(name)) {
            return "sistema";
        }

        return name;
    }

    private boolean isVisibleForCurrentUser(Avviso avviso) {
        if (avviso.getStato() != StatoAvviso.BOZZA) {
            return true;
        }

        return canReadBozze();
    }

    private boolean canReadBozze() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null) {
            return false;
        }

        Collection<? extends GrantedAuthority> authorities = authentication.getAuthorities();
        return authorities.stream().anyMatch(authority -> {
            String role = authority.getAuthority();
            return "ROLE_VICEPRESIDE".equals(role)
                    || "ROLE_VICEPRESIDENZA".equals(role)
                    || "ROLE_ADMIN".equals(role);
        });
    }
}