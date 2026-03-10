package spike.fatbook.backend.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Entity
@Table(name = "classe")
@Getter
@NoArgsConstructor
@AllArgsConstructor
public class Classe {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Setter
    @Column(nullable = false)
    private int anno;

    @Setter
    @Column(nullable = false)
    private String sezione;
}