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

        System.out.println("Costruzione orario completo 5L ITTS C.Grassi in corso...");

        // 1. CREAZIONE CLASSE
        Classe classe5L = new Classe(5, "L");
        classeRepo.save(classe5L);

        // 2. CREAZIONE DOCENTI
        Docente profHu = new Docente("Filippo", "Hu");
        Docente profZambon = new Docente("Tiziano", "Zambon");
        Docente profPerrone = new Docente("Giulio", "Perrone");
        Docente profPaesano = new Docente("Melania", "Paesano");
        Docente profBottiglieri = new Docente("Claudia", "Bottiglieri");
        Docente profGiorgio = new Docente("Miriam", "Giorgio");
        Docente profCaristi = new Docente("Concetta", "Caristi");
        Docente profVecchio = new Docente("Emanuele", "Vecchio");
        Docente profDaidone = new Docente("Gioacchino", "Daidone");
        Docente profReligione = new Docente("Docente", "Religione"); // Placeholder per religione
        
        docenteRepo.saveAll(List.of(profHu, profZambon, profPerrone, profPaesano, 
                            profBottiglieri, profGiorgio, profCaristi, profVecchio, profDaidone, profReligione));

        // 3. CREAZIONE AULE E LABORATORI
        Aula labB26 = new Aula(0, "B26", true);
        Aula labB24 = new Aula(0, "B24", true);
        Aula aulaC01 = new Aula(0, "C01", false);
        Aula aulaC10 = new Aula(0, "C10", false);
        Aula aulaC05 = new Aula(0, "C05", false);
        Aula aulaC21 = new Aula(0, "C21", false);
        Aula aulaG01 = new Aula(0, "G01", false);
        Aula palestraG00 = new Aula(0, "G00", false); // Palestra
        
        aulaRepo.saveAll(List.of(labB26, labB24, aulaC01, aulaC10, aulaC05, aulaC21, aulaG01, palestraG00));

        // ==========================================================
        // 4. INSERIMENTO ORARIO COMPLETO (Usando il metodo helper)
        // ==========================================================

        // --- LUNEDÌ ---
        inserisciOra(1, "Sistemi e Reti", GiornoSettimana.LUNEDI, classe5L, profBottiglieri, labB26);
        inserisciOra(2, "Sistemi e Reti", GiornoSettimana.LUNEDI, classe5L, profBottiglieri, labB26);
        inserisciOra(3, "Informatica", GiornoSettimana.LUNEDI, classe5L, profZambon, labB26);
        inserisciOra(4, "Informatica", GiornoSettimana.LUNEDI, classe5L, profZambon, labB26);
        inserisciOra(5, "Matematica", GiornoSettimana.LUNEDI, classe5L, profVecchio, aulaC01);
        inserisciOra(6, "Matematica", GiornoSettimana.LUNEDI, classe5L, profVecchio, aulaC01);
        inserisciOra(7, "Italiano", GiornoSettimana.LUNEDI, classe5L, profGiorgio, aulaC01);
        inserisciOra(8, "Storia", GiornoSettimana.LUNEDI, classe5L, profGiorgio, aulaC01);

        // --- MARTEDÌ ---
        inserisciOra(1, "Sistemi e Reti", GiornoSettimana.MARTEDI, classe5L, profBottiglieri, aulaC10);
        inserisciOra(2, "Italiano", GiornoSettimana.MARTEDI, classe5L, profGiorgio, aulaC10);
        inserisciOra(3, "Informatica", GiornoSettimana.MARTEDI, classe5L, profHu, labB26);
        inserisciOra(4, "Informatica", GiornoSettimana.MARTEDI, classe5L, profHu, labB26);
        inserisciOra(5, "Sistemi e Reti", GiornoSettimana.MARTEDI, classe5L, profBottiglieri, labB26);
        inserisciOra(6, "TPSIT", GiornoSettimana.MARTEDI, classe5L, profPaesano, labB26);

        // --- MERCOLEDÌ ---
        inserisciOra(1, "Informatica", GiornoSettimana.MERCOLEDI, classe5L, profHu, aulaG01);
        inserisciOra(2, "Informatica", GiornoSettimana.MERCOLEDI, classe5L, profHu, aulaG01);
        inserisciOra(3, "TPSIT", GiornoSettimana.MERCOLEDI, classe5L, profPaesano, aulaG01);
        inserisciOra(4, "Inglese", GiornoSettimana.MERCOLEDI, classe5L, profCaristi, aulaG01);
        inserisciOra(5, "Scienze Motorie", GiornoSettimana.MERCOLEDI, classe5L, profDaidone, palestraG00);
        inserisciOra(6, "Scienze Motorie", GiornoSettimana.MERCOLEDI, classe5L, profDaidone, palestraG00);

        // --- GIOVEDÌ ---
        inserisciOra(1, "Inglese", GiornoSettimana.GIOVEDI, classe5L, profCaristi, aulaC05);
        inserisciOra(2, "Italiano", GiornoSettimana.GIOVEDI, classe5L, profGiorgio, aulaC05);
        inserisciOra(3, "Italiano", GiornoSettimana.GIOVEDI, classe5L, profGiorgio, aulaC05);
        inserisciOra(4, "Matematica", GiornoSettimana.GIOVEDI, classe5L, profVecchio, aulaC05);
        inserisciOra(5, "TPSIT", GiornoSettimana.GIOVEDI, classe5L, profHu, labB26);
        inserisciOra(6, "TPSIT", GiornoSettimana.GIOVEDI, classe5L, profHu, labB26);

        // --- VENERDÌ ---
        inserisciOra(1, "Inglese", GiornoSettimana.VENERDI, classe5L, profCaristi, aulaC21);
        inserisciOra(2, "GPOI", GiornoSettimana.VENERDI, classe5L, profPerrone, aulaC21);
        inserisciOra(3, "Religione", GiornoSettimana.VENERDI, classe5L, profReligione, aulaC21);
        inserisciOra(4, "GPOI", GiornoSettimana.VENERDI, classe5L, profPerrone, aulaC21);
        inserisciOra(5, "Storia", GiornoSettimana.VENERDI, classe5L, profGiorgio, aulaC21);
        inserisciOra(6, "GPOI", GiornoSettimana.VENERDI, classe5L, profZambon, labB24);

        System.out.println("Orario COMPLETO della 5L inserito con successo!");
    }

    private void inserisciOra(int numeroOra, String materia, GiornoSettimana giorno, 
                              Classe classe, Docente docente, Aula aula) {
        OraCanonica ora = new OraCanonica();
        ora.setNumeroOra(numeroOra);
        ora.setMateria(materia);
        ora.setGiorno(giorno);
        ora.setVersione(VersioneOrario.DEFINITIVO);
        ora.setClasse(classe);
        ora.setDocente(docente);
        ora.setAula(aula);
        oraRepo.save(ora);
    }
}