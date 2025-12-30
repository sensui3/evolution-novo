
import React from 'react';

interface CoachModalProps {
    isOpen: boolean;
    onClose: () => void;
    coachTip: string;
    isLoadingTip: boolean;
}

const CoachModal: React.FC<CoachModalProps> = ({
    isOpen, onClose, coachTip, isLoadingTip
}) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <div className="bg-surface-dark border-2 border-primary w-full max-w-lg shadow-[8px_8px_0px_0px_#000] relative animate-in fade-in zoom-in duration-200">
                <button onClick={onClose} className="absolute top-4 right-4 text-text-muted hover:text-white z-10">
                    <span className="material-symbols-outlined">close</span>
                </button>
                <div className="p-8">
                    <div className="flex flex-col items-center text-center">
                        <div className="size-16 bg-primary/20 border-2 border-primary rounded-full flex items-center justify-center mb-6">
                            <span className="material-symbols-outlined text-primary text-4xl">psychology</span>
                        </div>
                        <h2 className="text-2xl font-bold uppercase text-white mb-2 tracking-tight">Conselho do Coach IA</h2>
                        <div className="min-h-[100px] flex items-center justify-center">
                            {isLoadingTip ? (
                                <div className="flex flex-col items-center gap-2">
                                    <div className="w-12 h-1 bg-border-dark overflow-hidden">
                                        <div className="w-full h-full bg-primary animate-ping"></div>
                                    </div>
                                    <span className="text-xs font-mono text-text-muted uppercase">Analisando Performance...</span>
                                </div>
                            ) : (
                                <p className="text-text-light font-mono leading-relaxed italic">
                                    "{coachTip}"
                                </p>
                            )}
                        </div>
                        <button
                            onClick={onClose}
                            className="mt-8 w-full border-2 border-primary text-primary font-bold py-3 uppercase tracking-widest hover:bg-primary hover:text-black transition-all"
                        >
                            Entendido
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CoachModal;
