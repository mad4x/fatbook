package spike.fatbook.backend.service;

import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;
import spike.fatbook.backend.dto.DashboardSlotDTO;
import spike.fatbook.backend.dto.DashboardSostituzioneDTO;
import spike.fatbook.backend.dto.DashboardStatsDTO;
import spike.fatbook.backend.dto.DashboardWeeklyDTO;
import spike.fatbook.backend.enums.GiornoSettimana;
import spike.fatbook.backend.model.Assenza;
import spike.fatbook.backend.model.Docente;
import spike.fatbook.backend.model.OraCanonica;
import spike.fatbook.backend.model.Sostituzione;
import spike.fatbook.backend.repository.AssenzaRepository;
import spike.fatbook.backend.repository.DocenteRepository;
import spike.fatbook.backend.repository.OraCanonicaRepository;
import spike.fatbook.backend.repository.SostituzioneRepository;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class DashboardService {

    private final DocenteRepository docenteRepository;
    private final OraCanonicaRepository oraCanonicaRepository;
    private final AssenzaRepository assenzaRepository;
    private final SostituzioneRepository sostituzioneRepository;

    @Transactional(readOnly = true)
    public DashboardWeeklyDTO getWeeklyDashboard(String emailDocente, LocalDate referenceDate) {
        Docente docente = docenteRepository.findByUtenteEmail(emailDocente)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Docente non trovato"));

        LocalDate base = referenceDate != null ? referenceDate : LocalDate.now();
        LocalDate monday = getMonday(base);
        LocalDate friday = monday.plusDays(4);

        List<OraCanonica> ore = oraCanonicaRepository.findOreByDocenteEmail(emailDocente);
        Map<GiornoSettimana, List<OraCanonica>> oreByDay = new HashMap<>();
        for (OraCanonica ora : ore) {
            oreByDay.computeIfAbsent(ora.getGiorno(), key -> new ArrayList<>()).add(ora);
        }

        List<Assenza> assenze = assenzaRepository.findByDocenteIdAndDataBetweenAndApprovataTrue(
            docente.getId(),
            monday,
            friday
        );

        Map<String, Assenza> assenzeBySlot = new HashMap<>();
        for (Assenza assenza : assenze) {
            if (assenza.getOra() == null) {
                continue;
            }
            String key = slotKey(assenza.getData(), assenza.getOra());
            assenzeBySlot.put(key, assenza);
        }

        List<DashboardSlotDTO> slots = new ArrayList<>();
        int assenzeCount = 0;

        for (int i = 0; i < 5; i++) {
            LocalDate dayDate = monday.plusDays(i);
            GiornoSettimana dayEnum = mapDay(dayDate);

            List<OraCanonica> dayOre = oreByDay.getOrDefault(dayEnum, List.of());
            for (OraCanonica ora : dayOre) {
                int numeroOra = ora.getNumeroOra();
                Assenza assenza = assenzeBySlot.get(slotKey(dayDate, numeroOra));
                Sostituzione sostituzione = assenza != null
                    ? sostituzioneRepository.findByAssenzaId(assenza.getId()).orElse(null)
                    : null;

                if (assenza != null) {
                    assenzeCount++;
                }

                slots.add(new DashboardSlotDTO(
                    dayDate,
                    dayEnum,
                    numeroOra,
                    ora.getClasse().getAnno() + ora.getClasse().getSezione(),
                    ora.getMateria().getNome(),
                    ora.getAula() != null ? ora.getAula().getNumero() : null,
                    assenza != null ? assenza.getId() : null,
                    assenza != null ? assenza.getDocente().getUtente().getNome() : null,
                    assenza != null ? assenza.getDocente().getUtente().getCognome() : null,
                    sostituzione != null && sostituzione.getDocenteSostituto() != null
                        ? sostituzione.getDocenteSostituto().getUtente().getNome()
                        : null,
                    sostituzione != null && sostituzione.getDocenteSostituto() != null
                        ? sostituzione.getDocenteSostituto().getUtente().getCognome()
                        : null,
                    sostituzione != null ? sostituzione.getSupplenteNome() : null
                ));
            }
        }

        List<Sostituzione> sostituzioniDocente = sostituzioneRepository
            .findByDocenteSostitutoIdAndDataBetween(docente.getId(), monday, friday);

        List<DashboardSostituzioneDTO> sostituzioni = new ArrayList<>();
        for (Sostituzione sostituzione : sostituzioniDocente) {
            GiornoSettimana giorno = mapDay(sostituzione.getData());
            OraCanonica ora = oraCanonicaRepository.findByClasseIdAndGiornoAndNumeroOra(
                sostituzione.getClasse().getId(),
                giorno,
                sostituzione.getOra()
            );

            sostituzioni.add(new DashboardSostituzioneDTO(
                sostituzione.getData(),
                giorno,
                sostituzione.getOra(),
                sostituzione.getClasse().getAnno() + sostituzione.getClasse().getSezione(),
                ora != null ? ora.getMateria().getNome() : null,
                ora != null && ora.getAula() != null ? ora.getAula().getNumero() : null,
                sostituzione.getDocenteAssente().getUtente().getNome(),
                sostituzione.getDocenteAssente().getUtente().getCognome()
            ));
        }

        int oreTotali = ore.size();
        int orePresenza = Math.max(oreTotali - assenzeCount, 0);
        double percentualeAssenza = oreTotali == 0 ? 0.0 : (assenzeCount * 100.0) / oreTotali;

        DashboardStatsDTO stats = new DashboardStatsDTO(
            oreTotali,
            assenzeCount,
            orePresenza,
            percentualeAssenza
        );

        return new DashboardWeeklyDTO(slots, stats, sostituzioni);
    }

    private String slotKey(LocalDate data, int ora) {
        return data + "#" + ora;
    }

    private LocalDate getMonday(LocalDate reference) {
        int diff = reference.getDayOfWeek().getValue() - DayOfWeek.MONDAY.getValue();
        return reference.minusDays(diff);
    }

    private GiornoSettimana mapDay(LocalDate date) {
        return switch (date.getDayOfWeek()) {
            case MONDAY -> GiornoSettimana.LUNEDI;
            case TUESDAY -> GiornoSettimana.MARTEDI;
            case WEDNESDAY -> GiornoSettimana.MERCOLEDI;
            case THURSDAY -> GiornoSettimana.GIOVEDI;
            case FRIDAY -> GiornoSettimana.VENERDI;
            case SATURDAY -> GiornoSettimana.SABATO;
            default -> GiornoSettimana.LUNEDI;
        };
    }
}
