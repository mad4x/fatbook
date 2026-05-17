package spike.fatbook.backend.service;

import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;
import spike.fatbook.backend.dto.SostituzioneAssignDTO;
import spike.fatbook.backend.dto.SostituzioneDocenteStatsDTO;
import spike.fatbook.backend.dto.SostituzioneSlotDTO;
import spike.fatbook.backend.enums.GiornoSettimana;
import spike.fatbook.backend.model.Assenza;
import spike.fatbook.backend.model.Docente;
import spike.fatbook.backend.model.DocenteOraCanonica;
import spike.fatbook.backend.model.OraCanonica;
import spike.fatbook.backend.model.Sostituzione;
import spike.fatbook.backend.repository.AssenzaRepository;
import spike.fatbook.backend.repository.DocenteOraCanonicaRepository;
import spike.fatbook.backend.repository.DocenteRepository;
import spike.fatbook.backend.repository.SostituzioneRepository;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.util.HashMap;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class SostituzioneService {

    private final AssenzaRepository assenzaRepository;
    private final DocenteRepository docenteRepository;
    private final DocenteOraCanonicaRepository docenteOraCanonicaRepository;
    private final SostituzioneRepository sostituzioneRepository;

    @Transactional(readOnly = true)
    public List<SostituzioneSlotDTO> getSlots(LocalDate data) {
        GiornoSettimana giorno = mapDay(data);
        List<Assenza> assenze = assenzaRepository.findByDataAndApprovataTrue(data);
        List<SostituzioneSlotDTO> slots = new ArrayList<>();

        for (Assenza assenza : assenze) {
            if (assenza.getOra() == null) {
                continue;
            }

            List<DocenteOraCanonica> docenze = docenteOraCanonicaRepository
                .findByDocenteIdAndGiornoAndNumeroOra(assenza.getDocente().getId(), giorno, assenza.getOra());

            if (docenze.isEmpty()) {
                continue;
            }

            OraCanonica oraCanonica = docenze.get(0).getOraCanonica();
            Sostituzione sostituzione = sostituzioneRepository.findByAssenzaId(assenza.getId()).orElse(null);

            slots.add(toSlotDTO(assenza, oraCanonica, sostituzione, giorno));
        }

        slots.sort((a, b) -> {
            int byOra = Integer.compare(a.ora(), b.ora());
            if (byOra != 0) {
                return byOra;
            }
            return a.classeNome().compareToIgnoreCase(b.classeNome());
        });

        return slots;
    }

    @Transactional
    public SostituzioneSlotDTO assegna(SostituzioneAssignDTO request, LocalDate data) {
        if (request.assenzaId() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Assenza non valida");
        }

        Assenza assenza = assenzaRepository.findById(request.assenzaId())
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Assenza non trovata"));

        if (data != null && !data.equals(assenza.getData())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "La data non corrisponde all'assenza selezionata");
        }

        if (!assenza.isApprovata()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Assenza non approvata");
        }

        if (assenza.getOra() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Assenza senza ora");
        }

        LocalDate dataAssenza = assenza.getData();
        GiornoSettimana giorno = mapDay(dataAssenza);
        List<DocenteOraCanonica> docenze = docenteOraCanonicaRepository
            .findByDocenteIdAndGiornoAndNumeroOra(assenza.getDocente().getId(), giorno, assenza.getOra());

        if (docenze.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Ora canonica non trovata per l'assenza");
        }

        OraCanonica oraCanonica = docenze.get(0).getOraCanonica();

        Long docenteSostitutoId = request.docenteSostitutoId();
        String supplenteNome = normalizeSupplente(request.supplenteNome());

        if (docenteSostitutoId == null || supplenteNome != null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Seleziona un docente registrato");
        }

        Docente docenteSostituto = null;
        if (docenteSostitutoId != null) {
            if (docenteSostitutoId.equals(assenza.getDocente().getId())) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Il docente assente non può sostituire");
            }

            docenteSostituto = docenteRepository.findById(docenteSostitutoId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Docente sostituto non trovato"));

            boolean occupato = docenteOraCanonicaRepository.existsByDocenteIdAndOraCanonicaGiornoAndOraCanonicaNumeroOra(
                docenteSostitutoId,
                giorno,
                assenza.getOra()
            );

            if (occupato) {
                throw new ResponseStatusException(HttpStatus.CONFLICT, "Docente già occupato in quell'ora");
            }

            boolean assente = !assenzaRepository
                .findByDocenteIdAndDataBetweenAndOraIn(docenteSostitutoId, dataAssenza, dataAssenza, List.of(assenza.getOra()))
                .isEmpty();

            if (assente) {
                throw new ResponseStatusException(HttpStatus.CONFLICT, "Docente assente in quell'ora");
            }
        }

        Sostituzione sostituzione = sostituzioneRepository.findByAssenzaId(assenza.getId())
            .orElseGet(Sostituzione::new);

        sostituzione.setAssenza(assenza);
        sostituzione.setData(dataAssenza);
        sostituzione.setOra(assenza.getOra());
        sostituzione.setClasse(oraCanonica.getClasse());
        sostituzione.setDocenteAssente(assenza.getDocente());
        sostituzione.setDocenteSostituto(docenteSostituto);
        sostituzione.setSupplenteNome(null);

        Sostituzione saved = sostituzioneRepository.save(sostituzione);

        return toSlotDTO(assenza, oraCanonica, saved, giorno);
    }

    @Transactional(readOnly = true)
    public List<SostituzioneDocenteStatsDTO> getDocenteStats(LocalDate referenceDate) {
        LocalDate base = referenceDate != null ? referenceDate : LocalDate.now();
        LocalDate monday = getMonday(base);
        LocalDate friday = monday.plusDays(4);

        Map<GiornoSettimana, LocalDate> dateByDay = new HashMap<>();
        for (int i = 0; i < 5; i++) {
            LocalDate day = monday.plusDays(i);
            dateByDay.put(mapDay(day), day);
        }

        List<DocenteOraCanonica> docenze = docenteOraCanonicaRepository.findAllWithOra();
        Map<Long, List<DocenteOraCanonica>> docenzeByDocente = new HashMap<>();
        for (DocenteOraCanonica link : docenze) {
            docenzeByDocente.computeIfAbsent(link.getDocente().getId(), key -> new ArrayList<>()).add(link);
        }

        List<Docente> docenti = docenteRepository.findAll();
        List<SostituzioneDocenteStatsDTO> result = new ArrayList<>();

        for (Docente docente : docenti) {
            List<DocenteOraCanonica> ore = docenzeByDocente.getOrDefault(docente.getId(), List.of());
            int oreTotali = ore.size();

            Map<String, Boolean> scheduledSlots = new HashMap<>();
            for (DocenteOraCanonica link : ore) {
                LocalDate date = dateByDay.get(link.getOraCanonica().getGiorno());
                if (date == null) {
                    continue;
                }
                String key = date + "#" + link.getOraCanonica().getNumeroOra();
                scheduledSlots.put(key, true);
            }

            List<Assenza> assenze = assenzaRepository.findByDocenteIdAndDataBetweenAndApprovataTrue(
                docente.getId(),
                monday,
                friday
            );

            int assenzeCount = 0;
            for (Assenza assenza : assenze) {
                if (assenza.getOra() == null) {
                    continue;
                }
                String key = assenza.getData() + "#" + assenza.getOra();
                if (scheduledSlots.containsKey(key)) {
                    assenzeCount++;
                }
            }

            int orePresenza = Math.max(oreTotali - assenzeCount, 0);
            double percentualeAssenza = oreTotali == 0 ? 0.0 : (assenzeCount * 100.0) / oreTotali;

            int oreSostituzione = sostituzioneRepository
                .findByDocenteSostitutoIdAndDataBetween(docente.getId(), monday, friday)
                .size();

            result.add(new SostituzioneDocenteStatsDTO(
                docente.getId(),
                docente.getUtente().getNome(),
                docente.getUtente().getCognome(),
                docente.getUtente().getEmail(),
                oreTotali,
                assenzeCount,
                orePresenza,
                oreSostituzione,
                percentualeAssenza
            ));
        }

        result.sort((a, b) -> a.cognome().compareToIgnoreCase(b.cognome()));
        return result;
    }

    private GiornoSettimana mapDay(LocalDate data) {
        DayOfWeek day = data.getDayOfWeek();
        return switch (day) {
            case MONDAY -> GiornoSettimana.LUNEDI;
            case TUESDAY -> GiornoSettimana.MARTEDI;
            case WEDNESDAY -> GiornoSettimana.MERCOLEDI;
            case THURSDAY -> GiornoSettimana.GIOVEDI;
            case FRIDAY -> GiornoSettimana.VENERDI;
            case SATURDAY -> GiornoSettimana.SABATO;
            default -> GiornoSettimana.LUNEDI;
        };
    }

    private LocalDate getMonday(LocalDate reference) {
        int diff = reference.getDayOfWeek().getValue() - DayOfWeek.MONDAY.getValue();
        return reference.minusDays(diff);
    }

    private String normalizeSupplente(String supplenteNome) {
        if (supplenteNome == null) {
            return null;
        }

        String trimmed = supplenteNome.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }

    private SostituzioneSlotDTO toSlotDTO(Assenza assenza, OraCanonica oraCanonica, Sostituzione sostituzione, GiornoSettimana giorno) {
        Docente docenteAssente = assenza.getDocente();
        Docente docenteSostituto = sostituzione != null ? sostituzione.getDocenteSostituto() : null;

        return new SostituzioneSlotDTO(
            sostituzione != null ? sostituzione.getId() : null,
            assenza.getId(),
            assenza.getData(),
            giorno,
            assenza.getOra(),
            oraCanonica.getClasse().getId(),
            oraCanonica.getClasse().getAnno() + oraCanonica.getClasse().getSezione(),
            oraCanonica.getMateria().getNome(),
            oraCanonica.getAula() != null ? oraCanonica.getAula().getNumero() : null,
            docenteAssente.getId(),
            docenteAssente.getUtente().getNome(),
            docenteAssente.getUtente().getCognome(),
            docenteAssente.getUtente().getEmail(),
            docenteSostituto != null ? docenteSostituto.getId() : null,
            docenteSostituto != null ? docenteSostituto.getUtente().getNome() : null,
            docenteSostituto != null ? docenteSostituto.getUtente().getCognome() : null,
            sostituzione != null ? sostituzione.getSupplenteNome() : null
        );
    }
}
