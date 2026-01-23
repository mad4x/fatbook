package spike.fatbook.backend.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity // 1. Dice a Spring: "Questa classe è una tabella del database"
@Table(name = "utente") // 2. Opzionale: dà un nome specifico alla tabella
public class Utente {

    // Getter e Setter (servono a Spring per leggere e scrivere i dati)
    @Getter
    @Id // 3. Ogni tabella ha bisogno di una chiave primaria
    @GeneratedValue(strategy = GenerationType.IDENTITY) // 4. L'ID cresce da solo (1, 2, 3...)
    private Long id;

    @Getter
    @Setter
    private String nome;
    @Setter
    @Getter
    private String email;
    @Getter
    @Setter
    private String password;

    // Fondamentale: serve un costruttore vuoto per JPA
    public Utente() {}

}