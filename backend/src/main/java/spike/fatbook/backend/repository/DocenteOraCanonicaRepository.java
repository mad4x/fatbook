package spike.fatbook.backend.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import spike.fatbook.backend.model.DocenteOraCanonica;

@Repository
public interface DocenteOraCanonicaRepository extends JpaRepository<DocenteOraCanonica, Long> {

    @Query("""
    SELECT d
    FROM DocenteOraCanonica d
    JOIN FETCH d.docente doc
    JOIN FETCH doc.utente
    WHERE d.oraCanonica.id IN :oraIds
    """)
    List<DocenteOraCanonica> findByOraCanonicaIdsWithDocente(@Param("oraIds") List<Long> oraIds);

    @Query("""
    SELECT d
    FROM DocenteOraCanonica d
    JOIN FETCH d.docente doc
    JOIN FETCH doc.utente
    WHERE d.oraCanonica.id = :oraId
    """)
    List<DocenteOraCanonica> findByOraCanonicaIdWithDocente(@Param("oraId") Long oraId);

    void deleteByOraCanonicaId(Long oraId);

    @Query("""
    SELECT d
    FROM DocenteOraCanonica d
    JOIN FETCH d.oraCanonica oc
    JOIN FETCH oc.classe
    JOIN FETCH oc.materia
    LEFT JOIN FETCH oc.aula
    WHERE d.docente.id = :docenteId
      AND oc.giorno = :giorno
      AND oc.numeroOra = :numeroOra
    """)
    List<DocenteOraCanonica> findByDocenteIdAndGiornoAndNumeroOra(
        @Param("docenteId") Long docenteId,
        @Param("giorno") spike.fatbook.backend.enums.GiornoSettimana giorno,
        @Param("numeroOra") int numeroOra
    );

    boolean existsByDocenteIdAndOraCanonicaGiornoAndOraCanonicaNumeroOra(
        Long docenteId,
        spike.fatbook.backend.enums.GiornoSettimana giorno,
        int numeroOra
    );

    @Query("""
    SELECT d
    FROM DocenteOraCanonica d
    JOIN FETCH d.docente doc
    JOIN FETCH doc.utente
    JOIN FETCH d.oraCanonica oc
    JOIN FETCH oc.classe
    JOIN FETCH oc.materia
    LEFT JOIN FETCH oc.aula
    """)
    List<DocenteOraCanonica> findAllWithOra();

    boolean existsByDocenteIdAndOraCanonicaGiornoAndOraCanonicaNumeroOraAndOraCanonicaClasseIdNot(
        Long docenteId,
        spike.fatbook.backend.enums.GiornoSettimana giorno,
        int numeroOra,
        Long classeId
    );
}
