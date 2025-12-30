
import React, { useState } from 'react';
import { Goal } from '../../../types';

interface GoalModalProps {
    isOpen: boolean;
    onClose: () => void;
    onAddGoal: (goal: Omit<Goal, 'id'>) => void;
}

const GoalModal: React.FC<GoalModalProps> = ({ isOpen, onClose, onAddGoal }) => {
    const [formData, setFormData] = useState({
        title: '',
        description: ''
    });

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onAddGoal({
            title: formData.title,
            description: formData.description,
        });
        setFormData({ title: '', description: '' });
        onClose();
    };

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-background/80 backdrop-blur-md p-4">
            <div className="bg-surface border border-border w-full max-w-xl shadow-2xl relative animate-in fade-in zoom-in duration-300">
                <div className="p-6 md:p-8 border-b border-border bg-black/5 flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-black uppercase text-text-main tracking-tighter">
                            Definir Novo Marco
                        </h2>
                        <p className="text-[10px] font-mono text-text-muted uppercase tracking-[0.2em] mt-1">Estabelecer objetivos de performance</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="size-10 flex items-center justify-center text-text-muted hover:text-red-500 hover:bg-red-500/10 transition-all rounded-full"
                    >
                        <span className="material-symbols-outlined">close</span>
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 md:p-10 flex flex-col gap-8">
                    <div className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-mono text-text-muted uppercase tracking-[0.2em] font-bold">Título do Objetivo</label>
                            <input
                                required
                                className="w-full bg-black/10 border border-border p-4 text-text-main font-mono text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all placeholder:opacity-30"
                                placeholder="EX: ALCANÇAR 200KG NO TERRA"
                                value={formData.title}
                                onChange={e => setFormData({ ...formData, title: e.target.value.toUpperCase() })}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-mono text-text-muted uppercase tracking-[0.2em] font-bold">Descrição do Compromisso</label>
                            <textarea
                                required
                                rows={3}
                                className="w-full bg-black/10 border border-border p-4 text-text-main font-mono text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none resize-none transition-all placeholder:opacity-30"
                                placeholder="DESCREVA SEU PLANO DE EVOLUÇÃO..."
                                value={formData.description}
                                onChange={e => setFormData({ ...formData, description: e.target.value.toUpperCase() })}
                            />
                        </div>
                    </div>

                    <div className="flex gap-4 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 py-4 border border-border text-text-muted font-bold font-mono text-xs uppercase hover:bg-black/5 hover:text-text-main transition-all"
                        >
                            Abortar
                        </button>
                        <button
                            type="submit"
                            className="flex-[2] py-4 bg-primary text-black font-black font-mono text-xs uppercase tracking-[0.2em] shadow-glow hover:bg-cyan-400 hover:scale-[1.02] active:scale-[0.98] transition-all"
                        >
                            Selar Compromisso
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default GoalModal;
