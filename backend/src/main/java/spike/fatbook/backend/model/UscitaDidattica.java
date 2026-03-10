package spike.fatbook.backend.model;

import jakarta.persistence.*;
import lombok.*;
import spike.fatbook.backend.enums.StatoUscita;

import java.time.LocalDate;

@Entity
@Table(name = "uscita_didattica")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
public class UscitaDidattica {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @EqualsAndHashCode.Include
    private Long id;

    private LocalDate data;
    private int ora;
    private String luogo;

    @Enumerated(EnumType.STRING)
    private StatoUscita stato;
}
