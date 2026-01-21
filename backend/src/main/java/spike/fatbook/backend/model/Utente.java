package spike.fatbook.backend.model;

import jakarta.persistence.*;

@Entity // 1. Dice a Spring: "Questa classe è una tabella del database"
@Table(name = "utenti") // 2. Opzionale: dà un nome specifico alla tabella
public class Utente {

    @Id // 3. Ogni tabella ha bisogno di una chiave primaria
    @GeneratedValue(strategy = GenerationType.IDENTITY) // 4. L'ID cresce da solo (1, 2, 3...)
    private Long id;

    private String nome;
    private String email;

    // Fondamentale: serve un costruttore vuoto per JPA
    public Utente() {}

    // Getter e Setter (servono a Spring per leggere e scrivere i dati)
    public Long getId() { return id; }
    public String getNome() { return nome; }
    public void setNome(String nome) { this.nome = nome; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
}