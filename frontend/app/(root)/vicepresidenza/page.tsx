import DashboardCard from "@/components/DashboardCard";
import { PANNELLO_VICEPRESIDE_ELEMENTS } from "@/constants";

const Vicepresidenza = () => {
    return (
        // Contenitore principale con padding e larghezza massima centrata
        <div className="p-8 max-w-7xl mx-auto w-full h-full">

            {/* Un bel titolo per contestualizzare la dashboard */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-800">Pannello Vicepresidenza</h1>
                <p className="text-gray-500 mt-2">Seleziona un'area di gestione per iniziare</p>
            </div>

            {/* Qui c'è la magia di Tailwind:
              - grid: attiva il sistema a griglia
              - grid-cols-1: su schermi piccoli (mobile) 1 colonna
              - md:grid-cols-2: su schermi medi (tablet) 2 colonne
              - lg:grid-cols-3: su schermi grandi (desktop) 3 colonne
              - gap-6: spazio uniforme di 24px tra una card e l'altra
            */}

            {/* !! Per aggiungere nuove card nel pannello modificare il file /constants/index.tsx !! */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {PANNELLO_VICEPRESIDE_ELEMENTS.map((card, index) => (
                    <DashboardCard
                        key={index} // <--- ECCO LA KEY! Fondamentale per i cicli in React
                        href={card.href}
                        title={card.title}
                        description={card.description}
                        icon={card.icon}
                    />
                ))}
            </div>

        </div>
    );
}

export default Vicepresidenza;