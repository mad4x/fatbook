E' necessario possedere docker e docker compose installati sul pc.

Una volta copiata la repo eseguire il comando:


docker compose up --build -d


🌐 Porte e Servizi

L'infrastruttura è containerizzata e i servizi risponderanno sulle seguenti porte locali:
localhost:3000 --> Frontend (Next.js / UI Rendering)
localhost:8080 --> Backend (Spring Boot API REST)
localhost:5050 --> pgAdmin (Gestione Database UI)
localhost:5432 --> Database PostgreSQL


🛠️ Dettagli Implementativi (Sprint 1)

Architettura: Basata su Spring Boot per la logica di business e Vanilla JavaScript/CSS3 (integrabile in Next.js) per il Frontend.
Modellazione Dati: Traduzione dello schema ER in entità JPA con relazioni `ManyToOne` tra Lezioni, Docenti e Aule. Persistenza garantita su PostgreSQL.
Seeding del Database: Nessun mock frontend. I dati vengono generati e iniettati nel database all'avvio del container Backend tramite una classe `DataSeeder`.
API Design: Implementazione di endpoint RESTful (es. `GET /api/orario/classe/{sezione}`) per il recupero asincrono dei dati dal client.
Frontend Integration: Utilizzo nativo della `fetch` API e del pattern `async/await` per la gestione fluida del flusso dati asincrono.
UI/UX & Print Engine: Sviluppo di un layout di stampa ottimizzato tramite CSS Media Queries (`@media print`) per garantire la portabilità dell'orario su un unico foglio A4 orizzontale, funzione essenziale per docenti e vicepresidenza.


👥 Metodologia e Versioning

Il progetto è gestito a Sprint (metodologia SCRUM) applicando il **Vertical Slicing**. Ogni commit rispetta la regola dell'atomicità per isolare le singole feature introdotte.