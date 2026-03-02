package spike.fatbook.backend.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "aula")
@Getter 
@Setter 
@NoArgsConstructor
public class Aula {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private int piano;
    private String numero;
    private boolean laboratorio;

    public Aula(int piano, String numero, boolean laboratorio) {
        this.piano = piano;
        this.numero = numero;
        this.laboratorio = laboratorio;
    }
}