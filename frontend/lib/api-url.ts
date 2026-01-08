// src/lib/api-url.ts

export function getBaseUrl() {
  // Se siamo lato server (Server Component o SSR)
  if (typeof window === 'undefined') {
    // Docker legge questa variabile interna
    // Se per caso è undefined (es. local development senza docker), fallback su localhost
    return process.env.SERVER_API_URL || 'http://localhost:8080/api';
  }

  // Se siamo lato client (Browser)
  return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api';
}