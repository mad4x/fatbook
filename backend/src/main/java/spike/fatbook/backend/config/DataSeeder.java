package spike.fatbook.backend.config;

import org.springframework.boot.CommandLineRunner;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Component;
import spike.fatbook.backend.enums.GiornoSettimana;
import spike.fatbook.backend.enums.VersioneOrario;
import spike.fatbook.backend.model.*;
import spike.fatbook.backend.repository.*;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Component
public class DataSeeder {

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
}