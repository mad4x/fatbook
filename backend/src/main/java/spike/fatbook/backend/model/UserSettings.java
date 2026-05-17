package spike.fatbook.backend.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "utente_settings")
@Getter
@NoArgsConstructor
@AllArgsConstructor
public class UserSettings {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Setter
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "utente_id", nullable = false, unique = true)
    private Utente utente;

    @Setter
    @Column(nullable = false)
    private String theme;

    @Setter
    @Column(nullable = false)
    private boolean compactTables;

    @Setter
    @Column(nullable = false)
    private boolean reduceMotion;

    @Setter
    @Column(nullable = false)
    private boolean confirmCritical;

    @Setter
    @Column(nullable = false)
    private boolean weeklyDigest;

    @Setter
    @Column(nullable = false)
    private boolean smartHints;

    @Setter
    @Column(nullable = false)
    private boolean reminderOrario;

    @Setter
    @Column(nullable = false)
    private boolean laboratorioDefault;
}
