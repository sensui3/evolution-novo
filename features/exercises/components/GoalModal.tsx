
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
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <div className="bg-surface-dark border-2 border-primary w-full max-w-lg shadow-[8px_8px_0px_0px_#000] relative animate-in fade-in zoom-in duration-200">
                <button onClick={onClose} className="absolute top-4 right-4 text-text-muted hover:text-white z-10">
                    <span className="material-symbols-outlined">close</span>
                </button>
                <div className="p-8">
                    <h2 className="text-2xl font-bold uppercase text-white mb-6 tracking-tight">Definir Novo Marco</h2>
                    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                        <div>
                            <label className="block text-xs font-mono text-text-muted uppercase mb-1">Título da Meta</label>
                            <input
                                required
                                className="w-full bg-black/40 border border-border-dark p-3 text-white font-mono focus:border-primary outline-none"
                                placeholder="ex: Alcançar 200kg no Terra"
                                value={formData.title}
                                onChange={e => setFormData({ ...formData, title: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-mono text-text-muted uppercase mb-1">Descrição</label>
                            <textarea
                                required
                                rows={3}
                                className="w-full bg-black/40 border border-border-dark p-3 text-white font-mono focus:border-primary outline-none resize-none"
                                placeholder="Descreva seu compromisso..."
                                value={formData.description}
                                onChange={e => setFormData({ ...formData, description: e.target.value })}
                            />
                        </div>
                        <button type="submit" className="mt-4 bg-primary text-black font-bold py-3 uppercase tracking-widest shadow-brutal-sm hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all">
                            Comprometer-se com a Evolução
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default GoalModal;
