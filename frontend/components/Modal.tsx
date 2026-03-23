import { X } from 'lucide-react';
import { ReactNode } from 'react';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children: ReactNode; // È qui che avviene la magia della versatilità!
}

const Modal = ({ isOpen, onClose, title, children }: ModalProps)=> {
    // Se non è aperto, non renderizza assolutamente nulla
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200">

                {/* Intestazione del Modale */}
                <div className="flex justify-between items-center p-6 border-b border-gray-100">
                    <h2 className="text-xl font-bold text-gray-800">{title}</h2>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-1 rounded-lg transition-colors"
                    >
                        <X size={24} />
                    </button>
                </div>

                {/* Contenuto dinamico (Il tuo form o qualsiasi altra cosa) */}
                <div className="p-6">
                    {children}
                </div>

            </div>
        </div>
    );
}

export default Modal;