package spike.fatbook.backend.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;

@Entity
@Table(name = "sostituzione")
@Getter
@NoArgsConstructor
@AllArgsConstructor
public class Sostituzione {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Setter
    @Column(nullable = false)
    private LocalDate data;

    @Setter
    @Column(nullable = false)
    private int ora;

    @Setter
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "assenza_id", nullable = false)
    private Assenza assenza;

    @Setter
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "classe_id", nullable = false)
    private Classe classe;

    @Setter
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "docente_assente_id", nullable = false)
    private Docente docenteAssente;

    @Setter
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "docente_sostituto_id")
    private Docente docenteSostituto;

    @Setter
    @Column(name = "supplente_nome")
    private String supplenteNome;
}
