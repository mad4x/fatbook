package spike.fatbook.backend.model;

import jakarta.persistence.*;
import lombok.*;
import spike.fatbook.backend.enums.RuoliDisponibili;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "ruolo")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
public class Ruolo {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @EqualsAndHashCode.Include
    private Long id;

    @Column(nullable = false, unique = true)
    @Enumerated(EnumType.STRING)
    private RuoliDisponibili nomeRuolo;

    @OneToMany(mappedBy = "ruolo", fetch = FetchType.LAZY)
    @ToString.Exclude
    private List<UtenteRuolo> utenti = new ArrayList<>();
}
