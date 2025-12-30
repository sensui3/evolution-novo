
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
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-background/80 backdrop-blur-md p-4">
            <div className="bg-surface border border-border w-full max-w-xl shadow-2xl relative animate-in fade-in zoom-in duration-300">
                <div className="p-6 md:p-8 border-b border-border bg-black/5 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="size-10 bg-primary/20 border border-primary/40 rounded-full flex items-center justify-center shadow-glow">
                            <span className="material-symbols-outlined text-primary text-2xl">psychology</span>
                        </div>
                        <div>
                            <h2 className="text-2xl font-black uppercase text-text-main tracking-tighter">
                                Coach de Performance
                            </h2>
                            <p className="text-[10px] font-mono text-text-muted uppercase tracking-[0.2em] mt-1">Inteligência Artificial Evolutiva</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="size-10 flex items-center justify-center text-text-muted hover:text-red-500 hover:bg-red-500/10 transition-all rounded-full"
                    >
                        <span className="material-symbols-outlined">close</span>
                    </button>
                </div>

                <div className="p-6 md:p-10 flex flex-col items-center">
                    <div className="w-full min-h-[180px] bg-black/10 border border-border p-8 flex items-center justify-center relative overflow-hidden group">
                        {/* Efeito de scanner de fundo */}
                        <div className="absolute inset-0 bg-primary/[0.02] animate-pulse"></div>
                        <div className="absolute top-0 left-0 w-full h-[1px] bg-primary/10 animate-[scan_4s_linear_infinite]"></div>

                        {isLoadingTip ? (
                            <div className="flex flex-col items-center gap-4 z-10">
                                <div className="flex gap-1.5">
                                    <div className="size-2 bg-primary animate-bounce [animation-delay:-0.3s]"></div>
                                    <div className="size-2 bg-primary animate-bounce [animation-delay:-0.15s]"></div>
                                    <div className="size-2 bg-primary animate-bounce"></div>
                                </div>
                                <span className="text-[10px] font-mono text-text-muted uppercase tracking-[0.3em] font-bold">Processando Datasets...</span>
                            </div>
                        ) : (
                            <div className="z-10 text-center">
                                <span className="material-symbols-outlined text-primary/30 text-3xl mb-4 block">format_quote</span>
                                <p className="text-text-main font-mono text-sm md:text-base leading-relaxed italic px-4">
                                    {coachTip}
                                </p>
                            </div>
                        )}
                    </div>

                    <div className="w-full mt-8 flex flex-col gap-4">
                        <div className="flex items-center gap-4 px-2">
                            <div className="h-[1px] flex-1 bg-border"></div>
                            <span className="text-[9px] font-mono text-text-muted uppercase tracking-widest">Protocolo de Análise Concluído</span>
                            <div className="h-[1px] flex-1 bg-border"></div>
                        </div>

                        <button
                            onClick={onClose}
                            className="w-full py-4 bg-primary text-black font-black font-mono text-xs uppercase tracking-[0.2em] shadow-glow hover:bg-cyan-400 hover:scale-[1.02] active:scale-[0.98] transition-all"
                        >
                            Retornar ao Painel
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CoachModal;
