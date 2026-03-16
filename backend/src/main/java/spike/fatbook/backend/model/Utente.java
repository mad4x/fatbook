package spike.fatbook.backend.model;

import jakarta.persistence.*;
import lombok.*;
import spike.fatbook.backend.enums.RuoliDisponibili;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "utente")
@Getter
@NoArgsConstructor
@AllArgsConstructor
public class Utente {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Setter
    @Column(nullable = false)
    private String nome;

    @Setter
    @Column(nullable = false)
    private String cognome;

    @Setter
    @Column(nullable = false, unique = true)
    private String email;

    @ElementCollection(fetch = FetchType.EAGER) // EAGER va benissimo qui, sono solo stringhe e ci servono sempre per il login!
    @CollectionTable(
            name = "utente_ruolo", // Il nome esatto della tabella nel DB
            joinColumns = @JoinColumn(name = "utente_id") // La colonna della foreign key
    )
    @Enumerated(EnumType.STRING)
    @Column(name = "ruolo") // Il nome della colonna che conterrà la stringa (es. "DOCENTE")
    private List<RuoliDisponibili> ruoli = new ArrayList<>();

    public boolean hasRole(RuoliDisponibili ruolo) {
        return this.ruoli.contains(ruolo);
    }
}