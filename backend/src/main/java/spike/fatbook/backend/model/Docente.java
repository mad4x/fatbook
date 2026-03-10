package spike.fatbook.backend.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Entity
@Table(name = "docente")
@Getter
@Setter // Mettendo Setter qui, Lombok crea automaticamente setNome() e setCognome()
@NoArgsConstructor
@AllArgsConstructor
public class Docente {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // --- ECCO I CAMPI MANCANTI! ---
    @Column(name = "nome")
    private String nome;

    @Column(name = "cognome")
    private String cognome;
    // ------------------------------

    private boolean laboratorio;

    @OneToOne
    @JoinColumn(name = "utente_id", referencedColumnName = "id")
    private Utente utente;

}