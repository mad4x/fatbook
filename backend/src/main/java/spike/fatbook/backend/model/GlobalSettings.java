package spike.fatbook.backend.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "impostazioni_globali")
@Getter
@NoArgsConstructor
@AllArgsConstructor
public class GlobalSettings {

    @Id
    private Long id = 1L;

    @Setter
    @Column(name = "school_domain", nullable = false)
    private String schoolDomain = "";
}
