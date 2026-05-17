package spike.fatbook.backend.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import spike.fatbook.backend.dto.AssenzaRequestDTO;
import spike.fatbook.backend.dto.AssenzaResponseDTO;
import spike.fatbook.backend.dto.AssenzaRichiestaDTO;
import spike.fatbook.backend.model.Assenza;
import spike.fatbook.backend.model.Docente;
import spike.fatbook.backend.model.UscitaDidattica;
import spike.fatbook.backend.model.Utente;
import spike.fatbook.backend.repository.AssenzaRepository;
import spike.fatbook.backend.repository.DocenteRepository;
import spike.fatbook.backend.repository.SostituzioneRepository;
import spike.fatbook.backend.repository.UscitaDidatticaRepository;
import spike.fatbook.backend.repository.UtenteRepository;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class AssenzaService {

    private final AssenzaRepository assenzaRepository;
    private final DocenteRepository docenteRepository;
    private final UtenteRepository utenteRepository;
    private final UscitaDidatticaRepository uscitaDidatticaRepository;
    private final SostituzioneRepository sostituzioneRepository;

    @Transactional(readOnly = true)
    public List<AssenzaResponseDTO> getAssenzeDelGiorno(LocalDate data) {
        List<Assenza> assenze = assenzaRepository.findByDataAndApprovataTrue(data);

        return assenze.stream()
            .map(this::toResponseDTO)
            .toList();
    }

        @Transactional(readOnly = true)
        public List<AssenzaResponseDTO> getAssenzeDocente(String emailDocente) {
        Docente docente = docenteRepository.findByUtenteEmail(emailDocente)
            .orElseThrow(() -> new RuntimeException("Docente non trovato con email: " + emailDocente));

        return assenzaRepository.findByDocenteIdOrderByDataDesc(docente.getId()).stream()
            .map(this::toResponseDTO)
            .toList();
        }

        @Transactional(readOnly = true)
        public List<AssenzaResponseDTO> getRichiesteAssenze() {
        return assenzaRepository.findByApprovataFalseOrderByDataAsc().stream()
            .map(this::toResponseDTO)
            .toList();
        }

    @Transactional
    public List<AssenzaResponseDTO> registraAssenza(AssenzaRequestDTO request, String emailVicepreside) {

        Docente docente = docenteRepository.findById(request.docenteId())
                .orElseThrow(() -> new RuntimeException("Docente non trovato con ID: " + request.docenteId()));

        Utente vicepreside = utenteRepository.findByEmail(emailVicepreside)
                .orElseThrow(() -> new RuntimeException("Utente non autorizzato o non trovato"));

        boolean isGiornaliera = (request.giornaliera() != null) ? request.giornaliera() : true;
        if (!isGiornaliera && request.ora() == null) {
            throw new IllegalArgumentException("Se l'assenza non è giornaliera, devi specificare l'ora!");
        }

        if (isGiornaliera && request.ora() != null) {
            throw new IllegalArgumentException("Un'assenza giornaliera non puo avere un'ora specifica. Rimuovi l'ora o rimuovi la giornaliera!");
        }

        if (!isGiornaliera && (request.ora() < 1 || request.ora() > 8)) {
            throw new IllegalArgumentException("L'ora deve essere compresa tra 1 e 8.");
        }

        LocalDate dataInizio = request.data();
        LocalDate dataFine = request.dataFine() != null ? request.dataFine() : request.data();
        if (dataFine.isBefore(dataInizio)) {
            throw new IllegalArgumentException("La data fine non può essere precedente alla data inizio.");
        }

        LocalDate today = LocalDate.now();
        for (LocalDate data = dataInizio; !data.isAfter(dataFine); data = data.plusDays(1)) {
            if (data.isBefore(today)) {
                throw new IllegalArgumentException("Non puoi richiedere assenze nel passato.");
            }

            switch (data.getDayOfWeek()) {
                case SATURDAY, SUNDAY -> throw new IllegalArgumentException("Non puoi richiedere assenze nel weekend.");
                default -> {
                }
            }
        }

        UscitaDidattica gita = null;
        if (request.uscitaDidatticaId() != null) {
            gita = uscitaDidatticaRepository.findById(request.uscitaDidatticaId())
                    .orElseThrow(() -> new RuntimeException("Uscita Didattica non trovata con ID: " + request.uscitaDidatticaId()));
        }

        validateConflitti(docente.getId(), dataInizio, dataFine, isGiornaliera ? oreGiornaliera() : List.of(request.ora()));

        List<Assenza> assenzeDaSalvare = new ArrayList<>();
        for (LocalDate data = dataInizio; !data.isAfter(dataFine); data = data.plusDays(1)) {
            if (isGiornaliera) {
                for (int ora = 1; ora <= 8; ora++) {
                    Assenza assenza = new Assenza();
                    assenza.setDocente(docente);
                    assenza.setRegistratoDa(vicepreside);
                    assenza.setData(data);
                    assenza.setMotivazione(request.motivazione());
                    assenza.setGiornaliera(true);
                    assenza.setOra(ora);
                    assenza.setApprovata(true);
                    if (gita != null) {
                        assenza.setUscitaDidattica(gita);
                    }
                    assenzeDaSalvare.add(assenza);
                }
            } else {
                Assenza assenza = new Assenza();
                assenza.setDocente(docente);
                assenza.setRegistratoDa(vicepreside);
                assenza.setData(data);
                assenza.setMotivazione(request.motivazione());
                assenza.setGiornaliera(false);
                assenza.setOra(request.ora());
                assenza.setApprovata(true);
                if (gita != null) {
                    assenza.setUscitaDidattica(gita);
                }
                assenzeDaSalvare.add(assenza);
            }
        }

        List<Assenza> assenzeSalvate = assenzaRepository.saveAll(assenzeDaSalvare);

        return assenzeSalvate.stream()
                .map(this::toResponseDTO)
                .toList();
    }

    @Transactional
    public List<AssenzaResponseDTO> richiediAssenza(AssenzaRichiestaDTO request, String emailDocente) {
        Docente docente = docenteRepository.findByUtenteEmail(emailDocente)
                .orElseThrow(() -> new RuntimeException("Docente non trovato con email: " + emailDocente));

        Utente richiedente = docente.getUtente();

        boolean isGiornaliera = (request.giornaliera() != null) ? request.giornaliera() : true;
        if (!isGiornaliera && request.ora() == null) {
            throw new IllegalArgumentException("Se l'assenza non è giornaliera, devi specificare l'ora!");
        }

        if (isGiornaliera && request.ora() != null) {
            throw new IllegalArgumentException("Un'assenza giornaliera non puo avere un'ora specifica. Rimuovi l'ora o rimuovi la giornaliera!");
        }

        if (!isGiornaliera && (request.ora() < 1 || request.ora() > 8)) {
            throw new IllegalArgumentException("L'ora deve essere compresa tra 1 e 8.");
        }

        LocalDate dataInizio = request.data();
        LocalDate dataFine = request.dataFine() != null ? request.dataFine() : request.data();
        if (dataFine.isBefore(dataInizio)) {
            throw new IllegalArgumentException("La data fine non può essere precedente alla data inizio.");
        }

        validateConflitti(docente.getId(), dataInizio, dataFine, isGiornaliera ? oreGiornaliera() : List.of(request.ora()));

        List<Assenza> assenzeDaSalvare = new ArrayList<>();
        for (LocalDate data = dataInizio; !data.isAfter(dataFine); data = data.plusDays(1)) {
            if (isGiornaliera) {
                for (int ora = 1; ora <= 8; ora++) {
                    Assenza assenza = new Assenza();
                    assenza.setDocente(docente);
                    assenza.setRegistratoDa(richiedente);
                    assenza.setData(data);
                    assenza.setMotivazione(request.motivazione());
                    assenza.setGiornaliera(true);
                    assenza.setOra(ora);
                    assenza.setApprovata(false);
                    assenzeDaSalvare.add(assenza);
                }
            } else {
                Assenza assenza = new Assenza();
                assenza.setDocente(docente);
                assenza.setRegistratoDa(richiedente);
                assenza.setData(data);
                assenza.setMotivazione(request.motivazione());
                assenza.setGiornaliera(false);
                assenza.setOra(request.ora());
                assenza.setApprovata(false);
                assenzeDaSalvare.add(assenza);
            }
        }

        return assenzaRepository.saveAll(assenzeDaSalvare).stream()
                .map(this::toResponseDTO)
                .toList();
    }

    @Transactional
    public AssenzaResponseDTO approvaRichiesta(Long assenzaId, String emailVicepreside) {
        Assenza assenza = assenzaRepository.findById(assenzaId)
                .orElseThrow(() -> new RuntimeException("Assenza non trovata con ID: " + assenzaId));

        if (assenza.isApprovata()) {
            return toResponseDTO(assenza);
        }

        Utente vicepreside = utenteRepository.findByEmail(emailVicepreside)
                .orElseThrow(() -> new RuntimeException("Utente non autorizzato o non trovato"));

        if (assenza.isGiornaliera()) {
            List<Assenza> giornaliere = assenzaRepository
                .findByDocenteIdAndDataAndGiornalieraTrueAndApprovataFalse(
                    assenza.getDocente().getId(),
                    assenza.getData()
                );

            if (!giornaliere.isEmpty()) {
                for (Assenza item : giornaliere) {
                    item.setApprovata(true);
                    item.setRegistratoDa(vicepreside);
                }
                assenzaRepository.saveAll(giornaliere);
            }
        } else {
            assenza.setApprovata(true);
            assenza.setRegistratoDa(vicepreside);
            assenzaRepository.save(assenza);
        }

        return toResponseDTO(assenza);
    }

    @Transactional
    public void eliminaAssenza(Long assenzaId) {
        if (!assenzaRepository.existsById(assenzaId)) {
            throw new RuntimeException("Assenza non trovata con ID: " + assenzaId);
        }

        sostituzioneRepository.deleteByAssenzaId(assenzaId);
        assenzaRepository.deleteById(assenzaId);
    }

    private void validateConflitti(Long docenteId, LocalDate dataInizio, LocalDate dataFine, List<Integer> ore) {
        List<Assenza> conflitti = assenzaRepository.findByDocenteIdAndDataBetweenAndOraIn(docenteId, dataInizio, dataFine, ore);
        if (!conflitti.isEmpty()) {
            Assenza conflitto = conflitti.get(0);
            throw new IllegalArgumentException(
                    "Esiste gia un'assenza per il docente in data " + conflitto.getData() + " alla " + conflitto.getOra() + "a ora."
            );
        }
    }

    private List<Integer> oreGiornaliera() {
        List<Integer> ore = new ArrayList<>(8);
        for (int ora = 1; ora <= 8; ora++) {
            ore.add(ora);
        }
        return ore;
    }

    private AssenzaResponseDTO toResponseDTO(Assenza assenza) {
        return new AssenzaResponseDTO(
                assenza.getId(),
                assenza.getData(),
                assenza.getOra(),
                assenza.getMotivazione(),
                assenza.isGiornaliera(),
                assenza.isApprovata(),
                assenza.getDocente().getUtente().getNome(),
                assenza.getDocente().getUtente().getCognome(),
                assenza.getDocente().getUtente().getEmail()
        );
    }
}