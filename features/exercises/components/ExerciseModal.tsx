
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
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <div className="bg-surface-dark border-2 border-primary w-full max-w-lg shadow-[8px_8px_0px_0px_#000] relative animate-in fade-in zoom-in duration-200">
                <button onClick={onClose} className="absolute top-4 right-4 text-text-muted hover:text-white z-10">
                    <span className="material-symbols-outlined">close</span>
                </button>
                <div className="p-8">
                    <h2 className="text-2xl font-bold uppercase text-white mb-6 tracking-tight">
                        {selectedExercise ? `Ajustar: ${selectedExercise.name}` : 'Novo Exercício'}
                    </h2>
                    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                        <div>
                            <label className="block text-xs font-mono text-text-muted uppercase mb-1">Nome</label>
                            <input
                                required
                                className="w-full bg-black/40 border border-border-dark p-3 text-white font-mono focus:border-primary outline-none"
                                placeholder="ex: Desenvolvimento Militar"
                                value={formData.name}
                                onChange={e => setFormData({ ...formData, name: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-mono text-text-muted uppercase mb-1">Categoria</label>
                            <input
                                required
                                className="w-full bg-black/40 border border-border-dark p-3 text-white font-mono focus:border-primary outline-none"
                                placeholder="ex: Ombros / Empurrar"
                                value={formData.category}
                                onChange={e => setFormData({ ...formData, category: e.target.value })}
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-mono text-text-muted uppercase mb-1">Carga (kg)</label>
                                <input
                                    type="number"
                                    required
                                    className="w-full bg-black/40 border border-border-dark p-3 text-white font-mono focus:border-primary outline-none"
                                    value={formData.weight || ''}
                                    onChange={e => setFormData({ ...formData, weight: parseFloat(e.target.value) })}
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-mono text-text-muted uppercase mb-1">RP (kg)</label>
                                <input
                                    type="number"
                                    required
                                    className="w-full bg-black/40 border border-border-dark p-3 text-white font-mono focus:border-primary outline-none"
                                    value={formData.pb || ''}
                                    onChange={e => setFormData({ ...formData, pb: parseFloat(e.target.value) })}
                                />
                            </div>
                        </div>
                        <button type="submit" className="mt-4 bg-primary text-black font-bold py-3 uppercase tracking-widest shadow-brutal-sm hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all">
                            {selectedExercise ? 'Atualizar Performance' : 'Sincronizar Dados'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default ExerciseModal;
