package spike.fatbook.backend.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "docente")
@Getter 
@Setter 
@NoArgsConstructor
public class Docente {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String nome;
    private String cognome;
    
    public Docente(String nome, String cognome) {
        this.nome = nome;
        this.cognome = cognome;
    }
}