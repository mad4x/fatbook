package spike.fatbook.backend.model;

import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import spike.fatbook.backend.enums.PrioritaAvviso;
import spike.fatbook.backend.enums.StatoAvviso;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "avviso")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Avviso {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 255)
    private String titolo;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String contenuto;

    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    private LocalDateTime dataCreazione;

    @Column(nullable = false, length = 120)
    private String autore;

    @Enumerated(EnumType.STRING)
    @Column(nullable = true, length = 20)
    private PrioritaAvviso priorita;

    @Enumerated(EnumType.STRING)
    @Column(nullable = true, length = 20)
    private StatoAvviso stato;

    @Column(name = "categoria", nullable = false, length = 120)
    private String categoria;

    @Column(name = "tags", columnDefinition = "TEXT")
    private String tagsCsv;

    @Column(name = "allegati", columnDefinition = "TEXT")
    private String allegatiCsv;

    @Column(name = "creato_da", length = 120)
    private String creatoDa;

    @Column(name = "aggiornato_da", length = 120)
    private String aggiornatoDa;

    @UpdateTimestamp
    @Column(name = "data_aggiornamento")
    private LocalDateTime dataAggiornamento;

    @Column(name = "data", nullable = false)
    private LocalDate data;

    @Column(name = "letto", nullable = false)
    private boolean letto;

    @Column(name = "descrizione", columnDefinition = "TEXT")
    private String descrizione;

    @PrePersist
    public void onCreate() {
        ensureLegacyCompatibility();

        if (priorita == null) {
            priorita = PrioritaAvviso.NORMALE;
        }

        if (stato == null) {
            stato = StatoAvviso.PUBBLICATO;
        }

        if (creatoDa == null || creatoDa.isBlank()) {
            creatoDa = "sistema";
        }

        if (aggiornatoDa == null || aggiornatoDa.isBlank()) {
            aggiornatoDa = creatoDa;
        }
    }

    @PreUpdate
    public void onUpdate() {
        ensureLegacyCompatibility();
    }

    private void ensureLegacyCompatibility() {
        if (categoria == null || categoria.isBlank()) {
            categoria = "Comunicazione - Circolare";
        }

        if (data == null) {
            data = LocalDate.now();
        }

        if (descrizione == null || descrizione.isBlank()) {
            descrizione = contenuto;
        }
    }
}