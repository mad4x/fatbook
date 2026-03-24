'use client';

import { AlertBanner } from '@/components/avvisi/AlertBanner';
import { AvvisiFilters } from '@/components/avvisi/AvvisiFilters';
import { AvvisoCard } from '@/components/avvisi/AvvisoCard';
import { AvvisoDetailModal } from '@/components/avvisi/AvvisoDetailModal';
import { AvvisoFormModal } from '@/components/avvisi/AvvisoFormModal';
import { formatDate, getAttachmentLabel, toOpenableUrl } from '@/lib/avvisi';
import { useAvvisi } from '@/hooks/use-avvisi';

export default function AvvisiPage() {
  const {
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
  } = useAvvisi();

  return (
    <div className="p-8 max-w-6xl mx-auto relative">
      <div className="flex justify-between items-end mb-8 border-b pb-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Avvisi</h1>
          <p className="text-gray-500 mt-1">Istituto C. GRASSI - A.S. 2025/2026</p>
        </div>
      </div>

      {error && <AlertBanner title="Attenzione" message={error} />}
      {networkError && <AlertBanner title="NetworkError" message={networkError} />}

      <AvvisiFilters
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        filtroPriorita={filtroPriorita}
        onFiltroPrioritaChange={setFiltroPriorita}
        canManageAvvisi={canManageAvvisi}
        onCreateClick={() => setIsCreateModalOpen(true)}
      />

      {loading ? (
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-48 mb-4"></div>
          {[1, 2].map((n) => (
            <div key={n} className="h-28 bg-gray-100 rounded-lg w-full"></div>
          ))}
        </div>
      ) : (
        !error && (
          <div className="space-y-8">
            {avvisiFiltrati.length === 0 && (
              <div className="text-center py-12 bg-gray-50 rounded-xl border border-gray-200">
                <p className="text-gray-500 text-lg">Nessun avviso presente nel database.</p>
                <p className="text-gray-400 text-sm mt-2">
                  Usa il tasto &quot;+ Nuovo Avviso&quot; per crearne uno.
                </p>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {avvisiFiltrati.map((avviso) => (
                <AvvisoCard
                  key={avviso.id}
                  avviso={avviso}
                  canManageAvvisi={canManageAvvisi}
                  onOpen={openViewModal}
                  onEdit={openEditModal}
                  formatDate={formatDate}
                  toOpenableUrl={toOpenableUrl}
                  getAttachmentLabel={getAttachmentLabel}
                />
              ))}
            </div>
          </div>
        )
      )}

      <AvvisoDetailModal
        isOpen={isViewModalOpen}
        avviso={selectedViewAvviso}
        onClose={closeViewModal}
        formatDate={formatDate}
        toOpenableUrl={toOpenableUrl}
        getAttachmentLabel={getAttachmentLabel}
      />

      {canManageAvvisi && (
        <>
          <AvvisoFormModal
            isOpen={isCreateModalOpen}
            mode="create"
            formData={createFormData}
            onFormDataChange={setCreateFormData}
            onSubmit={handleCreateSubmit}
            onClose={closeCreateModal}
            isSubmitting={isSaving}
            attachmentFiles={newAttachmentFiles}
            onAttachmentFilesChange={setNewAttachmentFiles}
          />

          <AvvisoFormModal
            isOpen={isEditModalOpen && !!selectedAvviso}
            mode="edit"
            formData={editFormData}
            onFormDataChange={setEditFormData}
            onSubmit={handleEditSubmit}
            onClose={closeEditModal}
            isSubmitting={isUpdating}
            attachmentFiles={editAttachmentFiles}
            onAttachmentFilesChange={setEditAttachmentFiles}
            existingEmbeddedAttachments={editEmbeddedAttachments}
            onRemoveExistingAttachment={removeExistingAttachment}
            getAttachmentLabel={getAttachmentLabel}
            onDelete={handleDeleteSelected}
            isDeleting={isDeleting}
          />
        </>
      )}
    </div>
  );
}
