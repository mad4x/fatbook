package spike.fatbook.backend.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import spike.fatbook.backend.enums.GiornoSettimana;
import spike.fatbook.backend.model.OraCanonica;
import org.springframework.stereotype.Repository;

@Repository
public interface OraCanonicaRepository extends JpaRepository<OraCanonica, Long> {
    // Recupera tutte le ore di tutte le classi dove insegna un determinato docente
    @Query("""
    SELECT d.oraCanonica
    FROM DocenteOraCanonica d
    WHERE d.docente.utente.email = :email
    """)
    List<OraCanonica> findOreByDocenteEmail(@Param("email") String email);
    
    // Recupera l'orario completo di una specifica classe
    List<OraCanonica> findByClasseId(Integer classeId);

    List<OraCanonica> findByClasseIdOrderByGiornoAscNumeroOraAsc(Long classeId);

    OraCanonica findByClasseIdAndGiornoAndNumeroOra(Long classeId, GiornoSettimana giorno, int numeroOra);

    // Recupera tutte le ore delle classi indicate, ordinate per classe e ora.
    List<OraCanonica> findByClasseIdInOrderByClasseAnnoAscClasseSezioneAscNumeroOraAsc(List<Long> classeIds);

    boolean existsByGiornoAndNumeroOraAndAulaIdAndClasseIdNot(
        GiornoSettimana giorno,
        int numeroOra,
        Long aulaId,
        Long classeId
    );
}