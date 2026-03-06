package spike.fatbook.backend.config;

import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;
import spike.fatbook.backend.enums.GiornoSettimana;
import spike.fatbook.backend.enums.VersioneOrario;
import spike.fatbook.backend.model.*;
import spike.fatbook.backend.repository.*;

import java.util.List;

@Component
public class DataSeeder implements CommandLineRunner {

    private final ClasseRepository classeRepo;
    private final DocenteRepository docenteRepo;
    private final AulaRepository aulaRepo;
    private final OraCanonicaRepository oraRepo;

    public DataSeeder(ClasseRepository classeRepo, DocenteRepository docenteRepo, 
                      AulaRepository aulaRepo, OraCanonicaRepository oraRepo) {
        this.classeRepo = classeRepo;
        this.docenteRepo = docenteRepo;
        this.aulaRepo = aulaRepo;
        this.oraRepo = oraRepo;
    }

    @Override
    public void run(String... args) throws Exception {
        if (oraRepo.count() > 0) {
            System.out.println("L'orario è già presente nel database. Nessun nuovo inserimento.");
            return;
        }

        System.out.println("Costruzione orario completo 5L ITTS C.Grassi con Compropresenze...");

        // 1. CREAZIONE CLASSE
        Classe classe5L = new Classe();
        classe5L.setAnno(5);
        classe5L.setSezione("L");
        classeRepo.save(classe5L);

        // 2. CREAZIONE DOCENTI (Teoria e Laboratorio)
        Docente profHu = new Docente("Filippo", "Hu");
        Docente profZambon = new Docente("Tiziano", "Zambon");
        Docente profPerrone = new Docente("Giulio", "Perrone");
        Docente profPaesano = new Docente("Melania", "Paesano");
        Docente profBottiglieri = new Docente("Claudia", "Bottiglieri");
        Docente profGiorgio = new Docente("Miriam", "Giorgio");
        Docente profCaristi = new Docente("Concetta", "Caristi");
        Docente profVecchio = new Docente("Emanuele", "Vecchio");
        Docente profDaidone = new Docente("Gioacchino", "Daidone");
        Docente profReligione = new Docente("D'Amico", "Religione");
        Docente profAlternativa = new Docente("Emanuele", "Salvatore");
        
        docenteRepo.saveAll(List.of(profHu, profZambon, profPerrone, profPaesano, 
                                profBottiglieri, profGiorgio, profCaristi, profVecchio, 
                                profDaidone, profReligione, profAlternativa));

        // 3. CREAZIONE AULE E LABORATORI
        Aula labB26 = new Aula(0, "B26", true);
        Aula labB24 = new Aula(0, "B24", true);
        Aula aulaC01 = new Aula(0, "C01", false);
        Aula aulaC10 = new Aula(0, "C10", false);
        Aula aulaC05 = new Aula(0, "C05", false);
        Aula aulaC21 = new Aula(0, "C21", false);
        Aula aulaG01 = new Aula(0, "G01", false);
        Aula palestraG00 = new Aula(0, "G00", false); 
        
        aulaRepo.saveAll(List.of(labB26, labB24, aulaC01, aulaC10, aulaC05, aulaC21, aulaG01, palestraG00));

        // ==========================================================
        // 4. INSERIMENTO ORARIO COMPLETO (Con logica Compropresenza)
        // ==========================================================

        // --- LUNEDÌ --- (Sistemi Lab e Info Lab)
        inserisciOra(1, "Sistemi e Reti", GiornoSettimana.LUNEDI, classe5L, profBottiglieri, profPaesano, labB26, false);
        inserisciOra(2, "Sistemi e Reti", GiornoSettimana.LUNEDI, classe5L, profBottiglieri, profPaesano, labB26, false);
        inserisciOra(3, "Informatica", GiornoSettimana.LUNEDI, classe5L, profHu, profZambon, labB26, false);
        inserisciOra(4, "Informatica", GiornoSettimana.LUNEDI, classe5L, profHu, profZambon, labB26, false);
        inserisciOra(5, "Matematica", GiornoSettimana.LUNEDI, classe5L, profVecchio, null, aulaC01, false);
        inserisciOra(6, "Matematica", GiornoSettimana.LUNEDI, classe5L, profVecchio, null, aulaC01, false);
        inserisciOra(7, "Italiano", GiornoSettimana.LUNEDI, classe5L, profGiorgio, null, aulaC01, false);
        inserisciOra(8, "Storia", GiornoSettimana.LUNEDI, classe5L, profGiorgio, null, aulaC01, false);

        // --- MARTEDÌ --- (Informatica Lab, Sistemi Lab, TPSIT Lab)
        inserisciOra(1, "Sistemi e Reti", GiornoSettimana.MARTEDI, classe5L, profBottiglieri, null, aulaC10, false);
        inserisciOra(2, "Italiano", GiornoSettimana.MARTEDI, classe5L, profGiorgio, null, aulaC10, false);
        inserisciOra(3, "Informatica", GiornoSettimana.MARTEDI, classe5L, profHu, profZambon, labB26, false);
        inserisciOra(4, "Informatica", GiornoSettimana.MARTEDI, classe5L, profHu, profZambon, labB26, false);
        inserisciOra(5, "Sistemi e Reti", GiornoSettimana.MARTEDI, classe5L, profBottiglieri, profPaesano, labB26, false);
        inserisciOra(6, "TPSIT", GiornoSettimana.MARTEDI, classe5L, profHu, profPaesano, labB26, false);

        // --- MERCOLEDÌ ---
        inserisciOra(1, "Informatica", GiornoSettimana.MERCOLEDI, classe5L, profHu, null, aulaG01, false);
        inserisciOra(2, "Informatica", GiornoSettimana.MERCOLEDI, classe5L, profHu, null, aulaG01, false);
        inserisciOra(3, "TPSIT", GiornoSettimana.MERCOLEDI, classe5L, profHu, null, aulaG01, false);
        inserisciOra(4, "Inglese", GiornoSettimana.MERCOLEDI, classe5L, profCaristi, null, aulaG01, false);
        inserisciOra(5, "Scienze Motorie", GiornoSettimana.MERCOLEDI, classe5L, profDaidone, null, palestraG00, false);
        inserisciOra(6, "Scienze Motorie", GiornoSettimana.MERCOLEDI, classe5L, profDaidone, null, palestraG00, false);

        // --- GIOVEDÌ --- (TPSIT Lab)
        inserisciOra(1, "Inglese", GiornoSettimana.GIOVEDI, classe5L, profCaristi, null, aulaC05, false);
        inserisciOra(2, "Italiano", GiornoSettimana.GIOVEDI, classe5L, profGiorgio, null, aulaC05, false);
        inserisciOra(3, "Italiano", GiornoSettimana.GIOVEDI, classe5L, profGiorgio, null, aulaC05, false);
        inserisciOra(4, "Matematica", GiornoSettimana.GIOVEDI, classe5L, profVecchio, null, aulaC05, false);
        inserisciOra(5, "TPSIT", GiornoSettimana.GIOVEDI, classe5L, profHu, profPaesano, labB26, false);
        inserisciOra(6, "TPSIT", GiornoSettimana.GIOVEDI, classe5L, profHu, profPaesano, labB26, false);

        // --- VENERDÌ --- (GPOI Lab e Gestione Religione/Alternativa)
        inserisciOra(1, "Inglese", GiornoSettimana.VENERDI, classe5L, profCaristi, null, aulaC21, false);
        inserisciOra(2, "GPOI", GiornoSettimana.VENERDI, classe5L, profPerrone, null, aulaC21, false);
        
        // Logica Sdoppiamento Religione/Alternativa
        inserisciOra(3, "Religione", GiornoSettimana.VENERDI, classe5L, profReligione, null, aulaC21, false);
        inserisciOra(3, "Alternativa", GiornoSettimana.VENERDI, classe5L, profAlternativa, null, aulaC01, true);
        
        inserisciOra(4, "GPOI", GiornoSettimana.VENERDI, classe5L, profPerrone, null, aulaC21, false);
        inserisciOra(5, "Storia", GiornoSettimana.VENERDI, classe5L, profGiorgio, null, aulaC21, false);
        inserisciOra(6, "GPOI", GiornoSettimana.VENERDI, classe5L, profPerrone, profZambon, labB24, false);

        System.out.println("Orario COMPLETO della 5L inserito con successo!");
    }

    private void inserisciOra(int numeroOra, String materia, GiornoSettimana giorno, 
                              Classe classe, Docente teoria, Docente lab, Aula aula, boolean isAlt) {
        OraCanonica ora = new OraCanonica();
        ora.setNumeroOra(numeroOra);
        ora.setMateria(materia);
        ora.setGiorno(giorno);
        ora.setVersione(VersioneOrario.DEFINITIVO);
        ora.setClasse(classe);
        ora.setDocenteTeoria(teoria);
        ora.setDocenteLaboratorio(lab);
        ora.setAula(aula);
        ora.setAlternativa(isAlt);
        oraRepo.save(ora);
    }
}