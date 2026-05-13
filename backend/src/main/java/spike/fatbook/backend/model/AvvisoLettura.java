package spike.fatbook.backend.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(
        name = "avviso_lettura",
        uniqueConstraints = @UniqueConstraint(columnNames = {"avviso_id", "utente_id"})
)
@Getter
@Setter
@NoArgsConstructor
public class AvvisoLettura {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "avviso_id", nullable = false)
    private Avviso avviso;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "utente_id", nullable = false)
    private Utente utente;

    @CreationTimestamp
    @Column(name = "letto_at", nullable = false, updatable = false)
    private LocalDateTime lettoAt;
}
