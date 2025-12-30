
import React, { useState } from 'react';
import { Exercise } from '../../../types';

interface ExerciseCardProps {
  exercise: Exercise;
  onDelete: (id: string) => void;
  onEdit?: () => void;
}

const ExerciseCard: React.FC<ExerciseCardProps> = ({ exercise, onDelete, onEdit }) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const [showHistory, setShowHistory] = useState(false);

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsDeleting(true);
    setTimeout(() => {
      onDelete(exercise.id);
    }, 300);
  };

  const toggleHistory = () => {
    setShowHistory(!showHistory);
  };

  return (
    <article
      className={`group relative bg-surface border border-border hover:border-primary transition-all duration-300 hover:shadow-glow overflow-hidden cursor-pointer ${isDeleting
        ? 'opacity-0 scale-95 translate-y-4 pointer-events-none'
        : 'opacity-100 scale-100'
        }`}
      onClick={toggleHistory}
    >
      {/* Indicador lateral de progresso */}
      <div
        className="absolute left-0 top-0 bottom-0 w-1 bg-primary/20 group-hover:bg-primary transition-colors"
        style={{ height: '100%' }}
      ></div>

      <div className="p-6 pl-7 flex flex-col h-full">
        <div className="flex items-start justify-between mb-5">
          <div>
            <h4 className="text-xl font-bold uppercase text-text-main group-hover:text-primary transition-colors tracking-tight leading-tight">
              {exercise.name}
            </h4>
            <span className="text-[10px] font-mono text-text-muted uppercase tracking-wider">{exercise.category}</span>
          </div>
          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-all duration-200">
            <button
              onClick={(e) => { e.stopPropagation(); onEdit?.(); }}
              className="text-text-muted hover:text-primary p-1 hover:scale-110 active:scale-90"
              title="Editar"
            >
              <span className="material-symbols-outlined text-lg">edit</span>
            </button>
            <button
              onClick={handleDelete}
              className="text-text-muted hover:text-red-500 p-1 hover:scale-110 active:scale-90"
              title="Excluir"
            >
              <span className="material-symbols-outlined text-lg">delete</span>
            </button>
          </div>
        </div>

        {/* Stats Grid - Alinhamento Horizontal Otimizado */}
        <div className="flex flex-row items-center border-y border-border/20 py-5 bg-black/[0.03] -mx-6 px-6 mb-6">
          <div className="flex-1 flex flex-col items-center border-r border-border/20">
            <span className="text-[10px] uppercase font-mono text-text-muted tracking-[0.2em] mb-2 font-black">Anterior</span>
            <div className="flex items-baseline">
              <span className="text-2xl font-mono font-black text-text-main tracking-tighter leading-none">
                {exercise.lastWeight}
              </span>
              <span className="text-[10px] font-mono text-text-muted uppercase ml-1 font-bold">kg</span>
            </div>
            <span className="text-[9px] text-text-muted font-mono mt-2 opacity-50 uppercase tracking-widest">{exercise.lastDate}</span>
          </div>

          <div className="flex-1 flex flex-col items-center border-r border-border/20 px-2">
            <span className="text-[10px] uppercase font-mono text-primary tracking-[0.2em] mb-2 font-black">Recorde</span>
            <div className="flex items-baseline">
              <span className="text-2xl font-mono font-black text-primary tracking-tighter leading-none drop-shadow-[0_0_15px_rgba(0,240,255,0.4)]">
                {exercise.pbWeight}
              </span>
              <span className="text-[10px] font-mono text-primary uppercase ml-1 font-black">kg</span>
            </div>
            <span className="text-[9px] text-primary/40 font-mono mt-2 uppercase tracking-widest">{exercise.pbDate}</span>
          </div>

          <div className="flex-1 flex flex-col items-center">
            <span className="text-[10px] uppercase font-mono text-text-muted tracking-[0.2em] mb-2 font-black">Vol. Méd.</span>
            <div className="flex items-baseline">
              <span className="text-2xl font-mono font-black text-text-main tracking-tighter leading-none">
                {exercise.avgVolume}
              </span>
              <span className="text-[10px] font-mono text-text-muted uppercase ml-1 font-bold">k</span>
            </div>
            <span className="text-[9px] text-text-muted font-mono mt-2 opacity-50 uppercase tracking-widest">Global</span>
          </div>
        </div>

        {/* Histórico Detalhado (Log de Performance) com Animação Melhorada */}
        <div
          className={`transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] overflow-hidden transform ${showHistory
            ? 'max-h-[300px] opacity-100 mb-6 translate-y-0'
            : 'max-h-0 opacity-0 -translate-y-4'
            }`}
        >
          <div className="border-t border-border/30 pt-4 flex flex-col gap-2">
            <div className="flex items-center gap-2 mb-1">
              <span className="material-symbols-outlined text-[14px] text-primary">history</span>
              <span className="text-[10px] font-mono text-primary uppercase font-bold tracking-widest">Log de Performance</span>
            </div>
            {exercise.history && exercise.history.length > 0 ? (
              exercise.history.map((log, idx) => (
                <div key={idx} className="flex items-center justify-between bg-black/20 p-2 border border-border/20">
                  <div className="flex items-center gap-3">
                    <span className={`material-symbols-outlined text-[12px] ${log.type === 'PR' ? 'text-primary' : 'text-text-muted'}`}>
                      {log.type === 'PR' ? 'star' : 'radio_button_checked'}
                    </span>
                    <span className="text-[10px] font-mono text-text-main">{log.weight}kg</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[8px] font-mono text-text-muted uppercase">{log.type === 'PR' ? 'Novo Recorde' : 'Log de Carga'}</span>
                    <span className="text-[8px] font-mono text-primary opacity-60">[{log.date}]</span>
                  </div>
                </div>
              ))
            ) : (
              <span className="text-[9px] font-mono text-text-muted italic">Nenhum histórico disponível para este ciclo.</span>
            )}
          </div>
        </div>

        {/* Barra de Progresso e Ação */}
        <div className="mt-auto flex items-center gap-4">
          <div className="flex-grow">
            <div className="flex justify-between items-center mb-1.5">
              <span className="text-[9px] font-mono text-text-muted uppercase tracking-widest">Eficiência de Treino</span>
              <span className="text-[10px] font-mono text-primary font-bold">{exercise.progress}%</span>
            </div>
            <div className="h-1 bg-border overflow-hidden rounded-full relative">
              <div
                className="absolute inset-y-0 left-0 bg-primary shadow-[0_0_10px_rgba(0,240,255,0.5)] transition-all duration-1000 ease-out"
                style={{ width: `${exercise.progress}%` }}
              ></div>
            </div>
          </div>
          <button
            className={`bg-surface border border-border size-8 flex items-center justify-center hover:bg-primary hover:text-black hover:border-primary transition-all duration-500 group/btn ${showHistory ? 'rotate-90 bg-primary text-black border-primary' : ''}`}
          >
            <span className="material-symbols-outlined text-sm transition-transform">arrow_forward</span>
          </button>
        </div>
      </div>
    </article>
  );
};

export default ExerciseCard;
