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

        // 1. Controllo email
        if (utenteRepository.findByEmail(dto.getEmail()).isPresent()) {
            throw new IllegalArgumentException("Esiste già un utente con questa email!");
        }

        // 2. Creazione Utente
        Utente nuovoUtente = new Utente();
        nuovoUtente.setNome(dto.getNome());
        nuovoUtente.setCognome(dto.getCognome());
        nuovoUtente.setEmail(dto.getEmail());
        nuovoUtente.setRuoli(List.of(RuoliDisponibili.ROLE_DOCENTE));
        utenteRepository.save(nuovoUtente);

        // 3. Creazione Docente (senza materie per ora)
        Docente nuovoDocente = new Docente();
        nuovoDocente.setUtente(nuovoUtente);
        nuovoDocente.setLaboratorio(dto.isLaboratorio());

        // 4. Creiamo i legami con le materie (DocenteMateria)
        if (dto.getMaterieIds() != null && !dto.getMaterieIds().isEmpty()) {
            List<Materia> materieSelezionate = materiaRepository.findAllById(dto.getMaterieIds());

            for (Materia materia : materieSelezionate) {
                DocenteMateria legame = new DocenteMateria();
                legame.setDocente(nuovoDocente);
                legame.setMateria(materia);
                // legame.setOreSettimanali(18); // Futuro!
                nuovoDocente.getDocenze().add(legame);
            }
        }

        // 5. Salviamo il Docente (Grazie a CascadeType.ALL, Spring salverà in automatico anche tutti i record in DocenteMateria!)
        docenteRepository.save(nuovoDocente);
    }

    public List<DocenteResponseDTO> getAllDocenti() {
        return docenteRepository.findAll().stream()
                .map(docente -> {
                    DocenteResponseDTO dto = new DocenteResponseDTO();
                    // I dati anagrafici li prendiamo dall'Utente collegato
                    dto.setId(docente.getId());
                    dto.setNome(docente.getUtente().getNome());
                    dto.setCognome(docente.getUtente().getCognome());
                    dto.setEmail(docente.getUtente().getEmail());

                    // I dati specifici li prendiamo dal Docente
                    dto.setLaboratorio(docente.isLaboratorio());

                    // Estraiamo solo i nomi delle materie dai "ponti" DocenteMateria
                    List<String> nomiMaterie = docente.getDocenze().stream()
                            .map(legame -> legame.getMateria().getNome())
                            .toList();
                    dto.setMaterie(nomiMaterie);

                    return dto;
                })
                .toList();
    }
}