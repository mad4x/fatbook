package spike.fatbook.backend.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "docente")
@Getter
@NoArgsConstructor
@AllArgsConstructor
public class Docente {

    @Id
    private Long id;

    @Setter
    private boolean laboratorio;

    @Setter
    @OneToOne
    @MapsId // <-- LA MAGIA È QUI
    @JoinColumn(name = "id") // Nel database avrai solo la colonna 'id' (che fa sia da PK che da FK)
    private Utente utente;

    @OneToMany(mappedBy = "docente", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<DocenteMateria> docenze = new ArrayList<>();
}