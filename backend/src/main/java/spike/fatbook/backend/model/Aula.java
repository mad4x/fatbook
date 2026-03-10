package spike.fatbook.backend.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Entity
@Table(name = "aula")
@Getter
@NoArgsConstructor
@AllArgsConstructor
public class Aula {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Setter
    @Column(nullable = false)
    private int piano;

    @Setter
    @Column(nullable = false)
    private String numero;

    @Setter
    private boolean laboratorio;

    // Costruttore manuale per il DataSeeder
    public Aula(int piano, String numero, boolean laboratorio) {
        this.piano = piano;
        this.numero = numero;
        this.laboratorio = laboratorio;
    }
}