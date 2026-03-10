package spike.fatbook.backend.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Entity
@Table(name = "docente")
@Getter
@NoArgsConstructor
@AllArgsConstructor
public class Docente {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Setter
    private boolean laboratorio;

    @Setter
    @OneToOne
    @JoinColumn(name = "utente_id", referencedColumnName = "id")
    private Utente utente;

}
// Docente funziona anche senza nome e cognome
// Bastava cambiare i getter dentro il DataSeeder