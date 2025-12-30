
import React, { useState, useEffect } from 'react';
import { Exercise } from '../../../types';

interface ExerciseModalProps {
    isOpen: boolean;
    onClose: () => void;
    onAddExercise: (ex: Omit<Exercise, 'id' | 'progress'>) => void;
    onUpdateExercise?: (ex: Omit<Exercise, 'id' | 'progress' | 'history'>) => void;
    selectedExercise?: Exercise | null;
}

const ExerciseModal: React.FC<ExerciseModalProps> = ({
    isOpen, onClose, onAddExercise, onUpdateExercise, selectedExercise
}) => {
    const [formData, setFormData] = useState({
        name: '',
        category: '',
        weight: 0,
        pb: 0,
        volume: 0
    });

    useEffect(() => {
        if (selectedExercise) {
            setFormData({
                name: selectedExercise.name,
                category: selectedExercise.category,
                weight: selectedExercise.lastWeight,
                pb: selectedExercise.pbWeight,
                volume: selectedExercise.avgVolume
            });
        } else {
            setFormData({
                name: '', category: '', weight: 0, pb: 0, volume: 0
            });
        }
    }, [selectedExercise, isOpen]);

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const data = {
            name: formData.name,
            category: formData.category,
            lastWeight: formData.weight,
            lastDate: new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' }).replace('.', ''),
            pbWeight: formData.pb,
            pbDate: new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' }).replace('.', ''),
            avgVolume: formData.volume,
        };

        if (selectedExercise && onUpdateExercise) {
            onUpdateExercise(data);
        } else {
            onAddExercise(data);
        }
        onClose();
    };

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-background/80 backdrop-blur-md p-4">
            <div className="bg-surface border border-border w-full max-w-xl shadow-2xl relative animate-in fade-in zoom-in duration-300">
                <div className="p-6 md:p-8 border-b border-border bg-black/5 flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-black uppercase text-text-main tracking-tighter">
                            {selectedExercise ? 'Ajustar Performance' : 'Novo Exercício'}
                        </h2>
                        <p className="text-[10px] font-mono text-text-muted uppercase tracking-[0.2em] mt-1">Sincronização de biometria de carga</p>
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
                            <label className="text-[10px] font-mono text-text-muted uppercase tracking-[0.2em] font-bold">Identificação do Exercício</label>
                            <input
                                required
                                className="w-full bg-black/10 border border-border p-4 text-text-main font-mono text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all placeholder:opacity-30"
                                placeholder="EX: SUPINO RETO COM BARRA"
                                value={formData.name}
                                onChange={e => setFormData({ ...formData, name: e.target.value.toUpperCase() })}
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-mono text-text-muted uppercase tracking-[0.2em] font-bold">Grupamento Muscular</label>
                            <input
                                required
                                className="w-full bg-black/10 border border-border p-4 text-text-main font-mono text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all placeholder:opacity-30"
                                placeholder="EX: PEITO / EMPURRAR"
                                value={formData.category}
                                onChange={e => setFormData({ ...formData, category: e.target.value.toUpperCase() })}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-mono text-text-muted uppercase tracking-[0.2em] font-bold">Carga Atual (kg)</label>
                                <div className="relative">
                                    <input
                                        type="number"
                                        required
                                        className="w-full bg-black/10 border border-border p-4 text-text-main font-mono text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                                        value={formData.weight || ''}
                                        onChange={e => setFormData({ ...formData, weight: parseFloat(e.target.value) })}
                                    />
                                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-mono text-text-muted uppercase">KG</span>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-mono text-text-muted uppercase tracking-[0.2em] font-bold">Recorde Pessoal (kg)</label>
                                <div className="relative">
                                    <input
                                        type="number"
                                        required
                                        className="w-full bg-black/10 border border-border p-4 text-text-main font-mono text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                                        value={formData.pb || ''}
                                        onChange={e => setFormData({ ...formData, pb: parseFloat(e.target.value) })}
                                    />
                                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-mono text-primary uppercase font-bold">RP</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex gap-4 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 py-4 border border-border text-text-muted font-bold font-mono text-xs uppercase hover:bg-black/5 hover:text-text-main transition-all"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            className="flex-[2] py-4 bg-primary text-black font-black font-mono text-xs uppercase tracking-[0.2em] shadow-glow hover:bg-cyan-400 hover:scale-[1.02] active:scale-[0.98] transition-all"
                        >
                            {selectedExercise ? 'Atualizar Performance' : 'Confirmar Registro'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ExerciseModal;
