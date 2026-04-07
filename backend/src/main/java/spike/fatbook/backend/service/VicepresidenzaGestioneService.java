package spike.fatbook.backend.service;

import java.util.ArrayList;
import java.util.List;

import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import lombok.RequiredArgsConstructor;
import spike.fatbook.backend.dto.AulaAdminDTO;
import spike.fatbook.backend.dto.AulaWriteDTO;
import spike.fatbook.backend.dto.ClasseAdminDTO;
import spike.fatbook.backend.dto.ClasseWriteDTO;
import spike.fatbook.backend.dto.MateriaAdminDTO;
import spike.fatbook.backend.dto.MateriaWriteDTO;
import spike.fatbook.backend.dto.OrarioClasseUpsertDTO;
import spike.fatbook.backend.dto.OrarioClasseUpdateDTO;
import spike.fatbook.backend.dto.OrarioClasseVicepresideDTO;
import spike.fatbook.backend.enums.VersioneOrario;
import spike.fatbook.backend.model.Aula;
import spike.fatbook.backend.model.Classe;
import spike.fatbook.backend.model.Docente;
import spike.fatbook.backend.model.DocenteOraCanonica;
import spike.fatbook.backend.model.Materia;
import spike.fatbook.backend.model.OraCanonica;
import spike.fatbook.backend.repository.AulaRepository;
import spike.fatbook.backend.repository.ClasseRepository;
import spike.fatbook.backend.repository.DocenteOraCanonicaRepository;
import spike.fatbook.backend.repository.DocenteRepository;
import spike.fatbook.backend.repository.MateriaRepository;
import spike.fatbook.backend.repository.OraCanonicaRepository;

@Service
@RequiredArgsConstructor
public class VicepresidenzaGestioneService {

    private final ClasseRepository classeRepository;
    private final MateriaRepository materiaRepository;
    private final AulaRepository aulaRepository;
    private final OraCanonicaRepository oraCanonicaRepository;
    private final DocenteRepository docenteRepository;
    private final DocenteOraCanonicaRepository docenteOraCanonicaRepository;
    private final JdbcTemplate jdbcTemplate;

    public List<ClasseAdminDTO> getClassi() {
        return classeRepository.findAll().stream()
            .map(c -> new ClasseAdminDTO(c.getId(), c.getAnno(), c.getSezione()))
            .toList();
    }

    @Transactional
    public ClasseAdminDTO createClasse(ClasseWriteDTO dto) {
        Classe classe = new Classe();
        classe.setAnno(dto.anno());
        classe.setSezione(dto.sezione());
        Classe saved = classeRepository.save(classe);
        return new ClasseAdminDTO(saved.getId(), saved.getAnno(), saved.getSezione());
    }

    @Transactional
    public ClasseAdminDTO updateClasse(Long id, ClasseWriteDTO dto) {
        Classe classe = classeRepository.findById(id)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Classe non trovata"));
        classe.setAnno(dto.anno());
        classe.setSezione(dto.sezione());
        Classe saved = classeRepository.save(classe);
        return new ClasseAdminDTO(saved.getId(), saved.getAnno(), saved.getSezione());
    }

    @Transactional
    public void deleteClasse(Long id) {
        try {
            classeRepository.deleteById(id);
        } catch (DataIntegrityViolationException e) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Impossibile eliminare la classe: referenziata da orario o altri dati");
        }
    }

    public List<MateriaAdminDTO> getMaterie() {
        return materiaRepository.findAll().stream()
            .map(m -> new MateriaAdminDTO(m.getId(), m.getNome(), m.getDescrizione()))
            .toList();
    }

    @Transactional
    public MateriaAdminDTO createMateria(MateriaWriteDTO dto) {
        Materia materia = new Materia();
        materia.setNome(dto.nome());
        materia.setDescrizione(dto.descrizione());
        Materia saved = materiaRepository.save(materia);
        return new MateriaAdminDTO(saved.getId(), saved.getNome(), saved.getDescrizione());
    }

    @Transactional
    public MateriaAdminDTO updateMateria(Long id, MateriaWriteDTO dto) {
        Materia materia = materiaRepository.findById(id)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Materia non trovata"));
        materia.setNome(dto.nome());
        materia.setDescrizione(dto.descrizione());
        Materia saved = materiaRepository.save(materia);
        return new MateriaAdminDTO(saved.getId(), saved.getNome(), saved.getDescrizione());
    }

    @Transactional
    public void deleteMateria(Long id) {
        try {
            materiaRepository.deleteById(id);
        } catch (DataIntegrityViolationException e) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Impossibile eliminare la materia: in uso nell'orario");
        }
    }

    public List<AulaAdminDTO> getAule() {
        return aulaRepository.findAll().stream()
            .map(a -> new AulaAdminDTO(a.getId(), a.getPiano(), a.getNumero(), a.isLaboratorio()))
            .toList();
    }

    @Transactional
    public AulaAdminDTO createAula(AulaWriteDTO dto) {
        Aula aula = new Aula();
        aula.setPiano(dto.piano());
        aula.setNumero(dto.numero());
        aula.setLaboratorio(dto.laboratorio());
        Aula saved = aulaRepository.save(aula);
        return new AulaAdminDTO(saved.getId(), saved.getPiano(), saved.getNumero(), saved.isLaboratorio());
    }

    @Transactional
    public AulaAdminDTO updateAula(Long id, AulaWriteDTO dto) {
        Aula aula = aulaRepository.findById(id)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Aula non trovata"));
        aula.setPiano(dto.piano());
        aula.setNumero(dto.numero());
        aula.setLaboratorio(dto.laboratorio());
        Aula saved = aulaRepository.save(aula);
        return new AulaAdminDTO(saved.getId(), saved.getPiano(), saved.getNumero(), saved.isLaboratorio());
    }

    @Transactional
    public void deleteAula(Long id) {
        try {
            aulaRepository.deleteById(id);
        } catch (DataIntegrityViolationException e) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Impossibile eliminare l'aula: in uso nell'orario");
        }
    }

    public List<OrarioClasseVicepresideDTO> getOrarioClasse(Long classeId) {
        List<OraCanonica> ore = oraCanonicaRepository.findByClasseIdOrderByGiornoAscNumeroOraAsc(classeId);
        if (ore.isEmpty()) {
            return List.of();
        }

        return ore.stream().map(ora -> {
            List<DocenteOraCanonica> docenze = docenteOraCanonicaRepository.findByOraCanonicaIdWithDocente(ora.getId());
            List<Long> docentiIds = docenze.stream().map(d -> d.getDocente().getId()).toList();
            List<String> docenti = docenze.stream()
                .map(this::formatDocente)
                .toList();

            return new OrarioClasseVicepresideDTO(
                ora.getId(),
                ora.getClasse().getId(),
                ora.getClasse().getAnno() + ora.getClasse().getSezione(),
                ora.getGiorno(),
                ora.getNumeroOra(),
                ora.getMateria().getId(),
                ora.getMateria().getNome(),
                ora.getAula() != null ? ora.getAula().getId() : null,
                ora.getAula() != null ? ora.getAula().getNumero() : null,
                docentiIds,
                docenti
            );
        }).toList();
    }

    @Transactional
    public OrarioClasseVicepresideDTO updateOraClasse(Long classeId, Long oraId, OrarioClasseUpdateDTO dto) {
        OraCanonica ora = oraCanonicaRepository.findById(oraId)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Ora non trovata"));

        if (!ora.getClasse().getId().equals(classeId)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "L'ora non appartiene alla classe indicata");
        }

        applyOraChanges(classeId, ora, dto.materiaId(), dto.aulaId(), dto.docentiIds(), false);

        return getOrarioClasse(classeId).stream()
            .filter(item -> item.oraId().equals(oraId))
            .findFirst()
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Errore nel ricalcolo dell'ora aggiornata"));
    }

    @Transactional
    public OrarioClasseVicepresideDTO upsertOraClasse(Long classeId, OrarioClasseUpsertDTO dto) {
        if (dto.giorno() == null || dto.ora() <= 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Giorno e ora sono obbligatori");
        }

        OraCanonica ora = oraCanonicaRepository.findByClasseIdAndGiornoAndNumeroOra(classeId, dto.giorno(), dto.ora());

        if (ora == null) {
            Classe classe = classeRepository.findById(classeId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Classe non trovata"));

            ora = new OraCanonica();
            ora.setClasse(classe);
            ora.setGiorno(dto.giorno());
            ora.setNumeroOra(dto.ora());
            ora.setVersione(VersioneOrario.PROVVISORIO);
        }

        applyOraChanges(classeId, ora, dto.materiaId(), dto.aulaId(), dto.docentiIds(), true);

        return getOrarioClasse(classeId).stream()
            .filter(item -> item.giorno() == dto.giorno() && item.ora() == dto.ora())
            .findFirst()
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Errore nel ricalcolo dell'ora aggiornata"));
    }

    private void applyOraChanges(
        Long classeId,
        OraCanonica ora,
        Long materiaId,
        Long aulaId,
        List<Long> docentiIdsRaw,
        boolean materiaObbligatoria
    ) {
        if (materiaId != null) {
            Materia materia = materiaRepository.findById(materiaId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Materia non valida"));
            ora.setMateria(materia);
        } else if (materiaObbligatoria && ora.getMateria() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Materia obbligatoria per creare una nuova ora");
        }

        if (aulaId != null) {
            boolean aulaOccupata = oraCanonicaRepository.existsByGiornoAndNumeroOraAndAulaIdAndClasseIdNot(
                ora.getGiorno(), ora.getNumeroOra(), aulaId, classeId
            );
            if (aulaOccupata) {
                throw new ResponseStatusException(HttpStatus.CONFLICT, "Aula gia occupata in questa ora");
            }
            Aula aula = aulaRepository.findById(aulaId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Aula non valida"));
            ora.setAula(aula);
        } else {
            ora.setAula(null);
        }

        List<Long> docentiIds = docentiIdsRaw == null ? List.of() : docentiIdsRaw.stream().distinct().toList();
        for (Long docenteId : docentiIds) {
            boolean docenteOccupato = docenteOraCanonicaRepository.existsByDocenteIdAndOraCanonicaGiornoAndOraCanonicaNumeroOraAndOraCanonicaClasseIdNot(
                docenteId,
                ora.getGiorno(),
                ora.getNumeroOra(),
                classeId
            );
            if (docenteOccupato) {
                throw new ResponseStatusException(HttpStatus.CONFLICT, "Docente gia occupato in questa ora");
            }
        }

        oraCanonicaRepository.save(ora);

        docenteOraCanonicaRepository.deleteByOraCanonicaId(ora.getId());
        if (!docentiIds.isEmpty()) {
            List<Docente> docenti = docenteRepository.findAllById(docentiIds);
            if (docenti.size() != docentiIds.size()) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Uno o piu docenti non esistono");
            }

            List<DocenteOraCanonica> nuoviLegami = new ArrayList<>();
            for (Docente docente : docenti) {
                DocenteOraCanonica link = new DocenteOraCanonica();
                link.setDocente(docente);
                link.setOraCanonica(ora);
                nuoviLegami.add(link);
            }
            saveDocenzeWithSequenceRecovery(nuoviLegami);
        }
    }

    private void saveDocenzeWithSequenceRecovery(List<DocenteOraCanonica> nuoviLegami) {
        try {
            docenteOraCanonicaRepository.saveAll(nuoviLegami);
        } catch (DataIntegrityViolationException e) {
            String message = e.getMostSpecificCause() != null
                ? e.getMostSpecificCause().getMessage()
                : e.getMessage();

            if (message != null && message.contains("docente-ora_canonica_pkey")) {
                realignDocenteOraCanonicaSequence();
                docenteOraCanonicaRepository.saveAll(nuoviLegami);
                return;
            }

            throw e;
        }
    }

    private void realignDocenteOraCanonicaSequence() {
        jdbcTemplate.execute("""
            SELECT setval(
                pg_get_serial_sequence('"docente-ora_canonica"', 'id'),
                COALESCE((SELECT MAX(id) FROM "docente-ora_canonica"), 0) + 1,
                false
            )
            """);
    }

    private String formatDocente(DocenteOraCanonica docenza) {
        return docenza.getDocente().getUtente().getNome() + " " + docenza.getDocente().getUtente().getCognome();
    }
}
