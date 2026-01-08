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

# Espone la porta 3000
EXPOSE 3000

# Comando di avvio (in modalità sviluppo per vedere le modifiche live)
CMD ["npm", "run", "dev"]