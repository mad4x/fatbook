# Usa un'immagine leggera di Node.js
FROM node:20-alpine

# Imposta la directory di lavoro nel container
WORKDIR /app

# Copia i file di configurazione delle dipendenze
COPY package*.json ./

# Installa le dipendenze
RUN npm install

# Copia tutto il resto del codice sorgente
COPY . .

# --- INIZIO CONFIGURAZIONE PRODUZIONE ---

# 1. Cattura le variabili pubbliche passate dal docker-compose.yml
ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL

# Se nel tuo .env globale hai ALTRE variabili che iniziano con NEXT_PUBLIC_,
# devi scommentare e aggiungere anche loro qui sotto nello stesso modo:
# ARG NEXT_PUBLIC_AUTH_CLIENT_ID
# ENV NEXT_PUBLIC_AUTH_CLIENT_ID=$NEXT_PUBLIC_AUTH_CLIENT_ID

# 2. Compila l'applicazione per la produzione (crea la cartella ottimizzata .next)
RUN npm run build

# Espone la porta 3000
EXPOSE 3000

# 3. Comando di avvio in modalità PRODUZIONE (molto più veloce e sicuro di dev)
CMD ["npm", "run", "start"]