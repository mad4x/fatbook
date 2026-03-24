import { FormEvent, useEffect, useMemo, useState } from 'react';
import {
  AVVISO_INITIAL_FORM_DATA,
  Avviso,
  AvvisoFormData,
  FiltroPrioritaAvviso
} from '@/constants/types';
import { getBaseUrl } from '@/lib/api-url';
import {
  buildPayload,
  filterAvvisi,
  getFriendlyError,
  isDataAttachment,
  normalizeAvviso
} from '@/lib/avvisi';
import { fetchWithAuth, getRolesFromToken, hasVicepresidenzaRole } from '@/lib/jwt';

export function useAvvisi() {
  const [avvisi, setAvvisi] = useState<Avviso[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [networkError, setNetworkError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [isUpdating, setIsUpdating] = useState<boolean>(false);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  const [searchTerm, setSearchTerm] = useState<string>('');
  const [filtroPriorita, setFiltroPriorita] = useState<FiltroPrioritaAvviso>('TUTTE');
  const [userRoles, setUserRoles] = useState<string[]>([]);

  const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState<boolean>(false);
  const [selectedAvviso, setSelectedAvviso] = useState<Avviso | null>(null);
  const [selectedViewAvviso, setSelectedViewAvviso] = useState<Avviso | null>(null);
  const [createFormData, setCreateFormData] = useState<AvvisoFormData>(AVVISO_INITIAL_FORM_DATA);
  const [editFormData, setEditFormData] = useState<AvvisoFormData>(AVVISO_INITIAL_FORM_DATA);
  const [newAttachmentFiles, setNewAttachmentFiles] = useState<File[]>([]);
  const [editAttachmentFiles, setEditAttachmentFiles] = useState<File[]>([]);
  const [editEmbeddedAttachments, setEditEmbeddedAttachments] = useState<string[]>([]);

  const canManageAvvisi = hasVicepresidenzaRole(userRoles);

  useEffect(() => {
    setUserRoles(getRolesFromToken());

    const fetchAvvisi = async () => {
      try {
        setLoading(true);
        setError(null);
        setNetworkError(null);

        const response = await fetchWithAuth(`${getBaseUrl()}/avvisi`, {
          method: 'GET',
          cache: 'no-store'
        });

        if (!response.ok) {
          if (response.status === 401 || response.status === 403) {
            setError('Accesso negato agli avvisi: effettua il login con un utente autorizzato.');
            setAvvisi([]);
            return;
          }
          throw new Error(`Errore del server: ${response.status}`);
        }

        const data = await response.json();
        const normalized = Array.isArray(data) ? data.map(normalizeAvviso) : [];
        setAvvisi(normalized);
      } catch (err) {
        console.error('Errore di connessione:', err);
        setNetworkError(getFriendlyError(err));
      } finally {
        setLoading(false);
      }
    };

    fetchAvvisi();
  }, []);

  const closeCreateModal = () => {
    setIsCreateModalOpen(false);
    setCreateFormData(AVVISO_INITIAL_FORM_DATA);
    setNewAttachmentFiles([]);
  };

  const openEditModal = (avviso: Avviso) => {
    const embeddedAttachments = (avviso.allegati || []).filter((item) => isDataAttachment(item));
    const linkAttachments = (avviso.allegati || []).filter((item) => !isDataAttachment(item));

    setSelectedAvviso(avviso);
    setEditFormData({
      titolo: avviso.titolo,
      contenuto: avviso.contenuto,
      autore: avviso.autore,
      categoria: avviso.categoria || 'Generale',
      priorita: avviso.priorita,
      stato: avviso.stato,
      tagsInput: (avviso.tags || []).join(', '),
      allegatiInput: linkAttachments.join(', ')
    });
    setEditEmbeddedAttachments(embeddedAttachments);
    setEditAttachmentFiles([]);
    setIsEditModalOpen(true);
  };

  const closeEditModal = () => {
    setIsEditModalOpen(false);
    setSelectedAvviso(null);
    setEditAttachmentFiles([]);
    setEditEmbeddedAttachments([]);
  };

  const openViewModal = (avviso: Avviso) => {
    setSelectedViewAvviso(avviso);
    setIsViewModalOpen(true);
  };

  const closeViewModal = () => {
    setIsViewModalOpen(false);
    setSelectedViewAvviso(null);
  };

  const removeExistingAttachment = (indexToRemove: number) => {
    setEditEmbeddedAttachments((previous) => previous.filter((_, index) => index !== indexToRemove));
  };

  const handleCreateSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    try {
      setIsSaving(true);
      setError(null);
      setNetworkError(null);

      const payload = await buildPayload(createFormData, newAttachmentFiles);
      const response = await fetchWithAuth(`${getBaseUrl()}/avvisi`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        if (response.status === 403) {
          throw new Error('FORBIDDEN_CREATE_AVVISO');
        }
        throw new Error(`Errore del server: ${response.status}`);
      }

      const nuovoAvviso: Avviso = normalizeAvviso(await response.json());
      setAvvisi((previous) => [nuovoAvviso, ...previous]);
      closeCreateModal();
    } catch (err) {
      console.error('Errore creazione avviso:', err);
      if (err instanceof Error && err.message === 'FORBIDDEN_CREATE_AVVISO') {
        setError('Permesso negato (403): accedi con un utente VICEPRESIDENZA per creare avvisi.');
        return;
      }
      setNetworkError(getFriendlyError(err));
    } finally {
      setIsSaving(false);
    }
  };

  const handleEditSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!selectedAvviso) {
      return;
    }

    try {
      setIsUpdating(true);
      setError(null);
      setNetworkError(null);

      const payload = await buildPayload(editFormData, editAttachmentFiles, editEmbeddedAttachments);
      const response = await fetchWithAuth(`${getBaseUrl()}/avvisi/${selectedAvviso.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error(`Errore del server: ${response.status}`);
      }

      const updated: Avviso = normalizeAvviso(await response.json());
      setAvvisi((previous) => previous.map((item) => (item.id === updated.id ? updated : item)));
      closeEditModal();
    } catch (err) {
      console.error('Errore modifica avviso:', err);
      setNetworkError(getFriendlyError(err));
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDeleteSelected = async () => {
    if (!selectedAvviso) {
      return;
    }

    const confirmed = window.confirm("Confermi l'eliminazione dell'avviso selezionato?");
    if (!confirmed) {
      return;
    }

    try {
      setIsDeleting(true);
      setError(null);
      setNetworkError(null);

      const response = await fetchWithAuth(`${getBaseUrl()}/avvisi/${selectedAvviso.id}`, {
        method: 'DELETE'
      });

      if (!response.ok && response.status !== 204) {
        throw new Error(`Errore del server: ${response.status}`);
      }

      setAvvisi((previous) => previous.filter((item) => item.id !== selectedAvviso.id));
      closeEditModal();
    } catch (err) {
      console.error('Errore eliminazione avviso:', err);
      setNetworkError(getFriendlyError(err));
    } finally {
      setIsDeleting(false);
    }
  };

  const avvisiFiltrati = useMemo(
    () => filterAvvisi(avvisi, searchTerm, filtroPriorita),
    [avvisi, searchTerm, filtroPriorita]
  );

  return {
    avvisiFiltrati,
    loading,
    error,
    networkError,
    canManageAvvisi,
    searchTerm,
    setSearchTerm,
    filtroPriorita,
    setFiltroPriorita,
    isCreateModalOpen,
    setIsCreateModalOpen,
    isEditModalOpen,
    selectedAvviso,
    isViewModalOpen,
    selectedViewAvviso,
    createFormData,
    setCreateFormData,
    editFormData,
    setEditFormData,
    newAttachmentFiles,
    setNewAttachmentFiles,
    editAttachmentFiles,
    setEditAttachmentFiles,
    editEmbeddedAttachments,
    openEditModal,
    openViewModal,
    closeViewModal,
    closeCreateModal,
    closeEditModal,
    removeExistingAttachment,
    handleCreateSubmit,
    handleEditSubmit,
    handleDeleteSelected,
    isSaving,
    isUpdating,
    isDeleting
  };
}
