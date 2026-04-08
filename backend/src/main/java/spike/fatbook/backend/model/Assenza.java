package spike.fatbook.backend.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;

@Entity
@Table(name = "assenza")
@Getter
@NoArgsConstructor
@AllArgsConstructor
public class Assenza {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Setter
    @Column(nullable = false)
    private LocalDate data;

    // Cambiato in Integer per permettere valori nulli (es. se è giornaliera)
    @Setter
    @Column(name = "ora")
    private Integer ora;

    @Setter
    @Column(nullable = false)
    private String motivazione;

    @Setter
    @Column(nullable = false)
    private boolean giornaliera = true;

    @Setter
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "uscita_didattica_id")
    private UscitaDidattica uscitaDidattica;

    @Setter
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "docente_id", nullable = false) // Non può esistere un'assenza senza docente
    private Docente docente;

    @Setter
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "registrato_da_id", nullable = false)
    private Utente registratoDa;
}