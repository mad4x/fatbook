package spike.fatbook.backend.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "classe")
@Getter 
@Setter 
@NoArgsConstructor // Lombok crea il costruttore vuoto per noi!
public class Classe {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private int anno; // Es: 5
    private String sezione; // Es: "L"

    // Costruttore personalizzato per comodità
    public Classe(int anno, String sezione) {
        this.anno = anno;
        this.sezione = sezione;
    }
}