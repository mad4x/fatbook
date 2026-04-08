package spike.fatbook.backend.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import spike.fatbook.backend.dto.DocenteRequestDTO;
import spike.fatbook.backend.dto.DocenteResponseDTO;
import spike.fatbook.backend.enums.RuoliDisponibili;
import spike.fatbook.backend.model.Docente;
import spike.fatbook.backend.model.DocenteMateria;
import spike.fatbook.backend.model.Materia;
import spike.fatbook.backend.model.Utente;
import spike.fatbook.backend.repository.DocenteRepository;
import spike.fatbook.backend.repository.MateriaRepository;
import spike.fatbook.backend.repository.UtenteRepository;

import java.util.List;

@Service
@RequiredArgsConstructor
public class DocenteService {

    private final UtenteRepository utenteRepository;
    private final DocenteRepository docenteRepository;
    private final MateriaRepository materiaRepository;

    @Transactional
    public void creaNuovoDocente(DocenteRequestDTO dto) {

        // 1. Controllo email - Uso dto.email() invece di dto.getEmail()
        if (utenteRepository.findByEmail(dto.email()).isPresent()) {
            throw new IllegalArgumentException("Esiste già un utente con questa email!");
        }

        // 2. Creazione Utente
        Utente nuovoUtente = new Utente();
        nuovoUtente.setNome(dto.nome());
        nuovoUtente.setCognome(dto.cognome());
        nuovoUtente.setEmail(dto.email());
        nuovoUtente.setRuoli(List.of(RuoliDisponibili.ROLE_DOCENTE));
        utenteRepository.save(nuovoUtente);

        // 3. Creazione Docente (senza materie per ora)
        Docente nuovoDocente = new Docente();
        nuovoDocente.setUtente(nuovoUtente);
        // Assumo che il campo nel record si chiami "laboratorio" o "isLaboratorio"
        nuovoDocente.setLaboratorio(dto.laboratorio());

        // 4. Creiamo i legami con le materie (DocenteMateria)
        if (dto.materieIds() != null && !dto.materieIds().isEmpty()) {
            List<Materia> materieSelezionate = materiaRepository.findAllById(dto.materieIds());

            for (Materia materia : materieSelezionate) {
                DocenteMateria legame = new DocenteMateria();
                legame.setDocente(nuovoDocente);
                legame.setMateria(materia);
                // legame.setOreSettimanali(18); // Futuro!
                nuovoDocente.getDocenze().add(legame);
            }
        }

        // 5. Salviamo il Docente
        docenteRepository.save(nuovoDocente);
    }

    public List<DocenteResponseDTO> getAllDocenti() {
        return docenteRepository.findAll().stream()
                .map(docente -> {
                    // 1. Prepariamo la lista delle materie
                    List<String> nomiMaterie = docente.getDocenze().stream()
                            .map(legame -> legame.getMateria().getNome())
                            .toList();

                    // 2. Costruiamo il Record passando tutti i parametri in un colpo solo!
                    // L'ordine dei parametri DEVE rispettare quello in cui li hai scritti nel file DocenteResponseDTO.java
                    return new DocenteResponseDTO(
                            docente.getId(),
                            docente.getUtente().getNome(),
                            docente.getUtente().getCognome(),
                            docente.getUtente().getEmail(),
                            docente.isLaboratorio(), // O getLaboratorio() a seconda dell'entità
                            nomiMaterie
                    );
                })
                .toList();
    }

    @Transactional
    public void deleteDocente(Long id) {
        Docente docente = docenteRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Docente non trovato"));

        Utente utenteCollegato = docente.getUtente();
        // Disabilito l'utente così non fa più login
        if (utenteCollegato != null) {
            utenteCollegato.setEliminato(true);
            utenteRepository.save(utenteCollegato);
        }
        docenteRepository.deleteById(id);
    }
}