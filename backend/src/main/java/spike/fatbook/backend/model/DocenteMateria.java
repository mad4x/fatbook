package spike.fatbook.backend.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "docente_materia")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class DocenteMateria {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "docente_id")
    private Docente docente;

    @ManyToOne
    @JoinColumn(name = "materia_id")
    private Materia materia;
}