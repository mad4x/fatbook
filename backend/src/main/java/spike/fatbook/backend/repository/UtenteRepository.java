package spike.fatbook.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import spike.fatbook.backend.model.Utente;

@Repository
public interface UtenteRepository extends JpaRepository<Utente, Long> {
    // Magia: non devi scrivere codice. JpaRepository ti regala già
    // i metodi .save(), .findAll(), .deleteById(), ecc.
}