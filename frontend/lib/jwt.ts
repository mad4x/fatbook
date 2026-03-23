import { jwtDecode } from "jwt-decode";

// 1. Definiamo la struttura del Token (adatteremo 'authorities' dopo il test)
export interface CustomJwtPayload {
    sub: string;
    iat: number;
    exp: number;
    nome: string;
    cognome: string;
    authorities?: string[]; // Potrebbe essere 'roles', lo scopriremo a breve!
}

// 2. Funzione sicura per prendere il token dal cassetto (Client-side)
export const getToken = (): string | null => {
    if (typeof window !== "undefined") {
        return localStorage.getItem("token");
    }
    return null;
};

// 3. Decodifica il token ed estrae l'array dei ruoli
export const getRolesFromToken = (): string[] => {
    const token = getToken();
    if (!token) return [];

    try {
        const decoded = jwtDecode<CustomJwtPayload>(token);
        return decoded.authorities || [];
    } catch (error) {
        console.error("Token non valido o malformato:", error);
        return [];
    }
};

export const hasVicepresidenzaRole = (roles: string[]): boolean => {
    return roles.includes("ROLE_VICEPRESIDE") || roles.includes("ROLE_VICEPRESIDENZA") || roles.includes("ROLE_ADMIN");
};

// Estrae i dati anagrafici per la Sidebar
export const getUserInfo = (token: string|null) => {

    // Valori di default se l'utente non è loggato
    if (!token) return { nome: "Ospite", cognome: "", email: "" };

    try {
        const decoded = jwtDecode<CustomJwtPayload>(token);
        return {
            nome: decoded.nome || "Utente",
            cognome: decoded.cognome || "",
            email: decoded.sub || "" // Ricorda che l'email si nasconde dentro 'sub'!
        };
    } catch (error) {
        console.error("Errore nella lettura dei dati utente:", error);
        return { nome: "Ospite", cognome: "", email: "" };
    }
};

// 4. Controllo specifico per la Sidebar
export const isVicepreside = (): boolean => {
    const roles = getRolesFromToken();
    return hasVicepresidenzaRole(roles);
};

// 5. Il "Postino" (Interceptor Custom per Next.js)
export const fetchWithAuth =
    async (url: string, options: RequestInit = {}): Promise<Response> => {

    const token = getToken();

    // Prepariamo gli header, unendo quelli eventuali della chiamata a quelli di base
    const headers = new Headers(options.headers);

    // Se abbiamo un token, aggiungiamo l'header Authorization
    if (token) {
        headers.set("Authorization", `Bearer ${token}`);
    }

    // Lanciamo la chiamata fetch originale "potenziata"
    const response = await fetch(url, {
        ...options,
        headers,
    });

    // Se il token è scaduto o invalido, facciamo pulizia e cacciamo l'utente al login
    if (response.status === 401) {
        if (typeof window !== "undefined") {
            localStorage.removeItem("token");
            window.location.href = "/sign-in";
        }
    }

    return response;
};