package spike.fatbook.backend.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import spike.fatbook.backend.dto.AssenzaRequestDTO;
import spike.fatbook.backend.dto.AssenzaResponseDTO;
import spike.fatbook.backend.model.Assenza;
import spike.fatbook.backend.model.Docente;
import spike.fatbook.backend.model.UscitaDidattica;
import spike.fatbook.backend.model.Utente;
import spike.fatbook.backend.repository.AssenzaRepository;
import spike.fatbook.backend.repository.DocenteRepository;
import spike.fatbook.backend.repository.UscitaDidatticaRepository;
import spike.fatbook.backend.repository.UtenteRepository;

import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
public class AssenzaService {

    private final AssenzaRepository assenzaRepository;
    private final DocenteRepository docenteRepository;
    private final UtenteRepository utenteRepository;
    private final UscitaDidatticaRepository uscitaDidatticaRepository;

    @Transactional(readOnly = true)
    public List<AssenzaResponseDTO> getAssenzeDelGiorno(LocalDate data) {
        List<Assenza> assenze = assenzaRepository.findByData(data);

        return assenze.stream()
                .map(assenza -> new AssenzaResponseDTO(
                        assenza.getId(),
                        assenza.getData(),
                        assenza.getOra(),
                        assenza.getMotivazione(),
                        assenza.isGiornaliera(),
                        assenza.getDocente().getUtente().getNome(),
                        assenza.getDocente().getUtente().getCognome(),
                        assenza.getDocente().getUtente().getEmail()
                ))
                .toList();
    }

    @Transactional
    public AssenzaResponseDTO registraAssenza(AssenzaRequestDTO request, String emailVicepreside) {

        Docente docente = docenteRepository.findById(request.docenteId())
                .orElseThrow(() -> new RuntimeException("Docente non trovato con ID: " + request.docenteId()));

        Utente vicepreside = utenteRepository.findByEmail(emailVicepreside)
                .orElseThrow(() -> new RuntimeException("Utente non autorizzato o non trovato"));

        // 3. Creazione base dell'entità
        Assenza assenza = new Assenza();
        assenza.setDocente(docente);
        assenza.setRegistratoDa(vicepreside);
        assenza.setData(request.data());
        assenza.setMotivazione(request.motivazione());

        boolean isGiornaliera = (request.giornaliera() != null) ? request.giornaliera() : true;
        assenza.setGiornaliera(isGiornaliera);

        if (!isGiornaliera && request.ora() == null) {
            throw new IllegalArgumentException("Se l'assenza non è giornaliera, devi specificare l'ora!");
        }

        if (isGiornaliera && request.ora() != null) {
            throw new IllegalArgumentException("Un'assenza giornaliera non può avere un'ora specifica. Rimuovi l'ora o rimuovi la giornaliera!");
        }

        assenza.setOra(request.ora());

        if (request.uscitaDidatticaId() != null) {
            UscitaDidattica gita = uscitaDidatticaRepository.findById(request.uscitaDidatticaId())
                    .orElseThrow(() -> new RuntimeException("Uscita Didattica non trovata con ID: " + request.uscitaDidatticaId()));
            assenza.setUscitaDidattica(gita);
        }

        assenzaRepository.save(assenza);

        return new AssenzaResponseDTO(
                assenza.getId(),
                assenza.getData(),
                assenza.getOra(),
                assenza.getMotivazione(),
                assenza.isGiornaliera(),
                assenza.getDocente().getUtente().getNome(),
                assenza.getDocente().getUtente().getCognome(),
                assenza.getDocente().getUtente().getEmail()
        );
    }
}