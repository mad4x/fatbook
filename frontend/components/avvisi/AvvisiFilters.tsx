import { FiltroPrioritaAvviso } from '@/constants/types';

interface AvvisiFiltersProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  filtroPriorita: FiltroPrioritaAvviso;
  onFiltroPrioritaChange: (value: FiltroPrioritaAvviso) => void;
  canManageAvvisi: boolean;
  onCreateClick: () => void;
}

export function AvvisiFilters({
  searchTerm,
  onSearchChange,
  filtroPriorita,
  onFiltroPrioritaChange,
  canManageAvvisi,
  onCreateClick
}: AvvisiFiltersProps) {
  return (
    <div className="bg-gray-50 p-4 rounded-xl mb-8 flex flex-wrap gap-4 items-center border border-gray-100 shadow-sm">
      <div className="flex-1 min-w-[250px]">
        <input
          type="text"
          placeholder="Cerca titolo, contenuto, autore, categoria o tag..."
          className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
          value={searchTerm}
          onChange={(event) => onSearchChange(event.target.value)}
        />
      </div>

      <div className="w-64">
        <select
          className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white"
          value={filtroPriorita}
          onChange={(event) => onFiltroPrioritaChange(event.target.value as FiltroPrioritaAvviso)}
        >
          <option value="TUTTE">Tutte le priorità</option>
          <option value="NORMALE">Normale</option>
          <option value="ALTA">Alta</option>
        </select>
      </div>

      {canManageAvvisi && (
        <button
          onClick={onCreateClick}
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 px-6 rounded-lg shadow transition"
        >
          + Nuovo Avviso
        </button>
      )}
    </div>
  );
}
