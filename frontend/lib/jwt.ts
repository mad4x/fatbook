import { jwtDecode } from "jwt-decode";

// 1. Definiamo la struttura del Token (adatteremo 'authorities' dopo il test)
export interface CustomJwtPayload {
    sub: string;
    iat: number;
    exp: number;
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

        // --- DEBUG TEMPORANEO ---
        // Questo ci mostrerà nella console del browser com'è fatto il token dentro!
        console.log("Token decodificato:", decoded);
        // ------------------------

        return decoded.authorities || [];
    } catch (error) {
        console.error("Token non valido o malformato:", error);
        return [];
    }
};

// 4. Controllo specifico per la Sidebar
export const isVicepreside = (): boolean => {
    const roles = getRolesFromToken();
    return roles.includes("ROLE_VICEPRESIDE");
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
            window.location.href = "/login"; // Redirect forzato
        }
    }

    return response;
};