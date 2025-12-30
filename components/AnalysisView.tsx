
import React, { useEffect, useState, useMemo } from 'react';
import { Exercise, WeightLog } from '../types';
import { getDeepAnalysis } from '../services/geminiService';

interface AnalysisViewProps {
  exercises: Exercise[];
  timeframe: 'WEEK' | 'MONTH';
}

type AnalysisTimeframe = 'WEEK' | 'MONTH' | 'YEAR' | 'CUSTOM';
type SortKey = 'name' | 'category' | 'lastWeight' | 'pbWeight' | 'progress';
type SortDirection = 'asc' | 'desc';

interface SortConfig {
  key: SortKey;
  direction: SortDirection;
}

const parseExerciseDate = (dateStr: string): Date => {
  const months: { [key: string]: number } = {
    'jan': 0, 'fev': 1, 'mar': 2, 'abr': 3, 'mai': 4, 'jun': 5,
    'jul': 6, 'ago': 7, 'set': 8, 'out': 9, 'nov': 10, 'dez': 11
  };
  const parts = dateStr.toLowerCase().split(' ');
  const day = parseInt(parts[0]);
  const month = months[parts[1]] ?? 0;
  const currentYear = new Date().getFullYear();
  return new Date(currentYear, month, day);
};

const PerformanceSparkline: React.FC<{ exercise: Exercise }> = ({ exercise }) => {
  const [hoveredPoint, setHoveredPoint] = useState<number | null>(null);

  const history = useMemo(() => {
    const points = 8;
    const seed = exercise.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const data = [];
    for (let i = 0; i < points; i++) {
      const progressFactor = i / (points - 1);
      const fluctuation = Math.sin(seed + i) * 3;
      const simulatedWeight = exercise.lastWeight * (0.85 + (0.15 * progressFactor)) + fluctuation;
      const simulatedPB = i < points - 3 ? exercise.pbWeight * 0.95 : exercise.pbWeight;
      data.push({ weight: parseFloat(simulatedWeight.toFixed(1)), pb: parseFloat(simulatedPB.toFixed(1)), date: `${i + 1} Out` });
    }
    return data;
  }, [exercise]);

  const maxVal = Math.max(...history.map(d => Math.max(d.weight, d.pb))) * 1.1;
  const minVal = Math.min(...history.map(d => Math.min(d.weight, d.pb))) * 0.9;
  const range = maxVal - minVal;

  const getX = (i: number) => (i / (history.length - 1)) * 120;
  const getY = (v: number) => 40 - ((v - minVal) / range) * 35;

  return (
    <div className="flex items-center gap-4 group/spark">
      <div className="relative w-[120px] h-[40px]">
        <svg className="w-full h-full overflow-visible">
          <polyline fill="none" stroke="#ffffff" strokeWidth="1" strokeDasharray="2,2" opacity="0.3" points={history.map((d, i) => `${getX(i)},${getY(d.pb)}`).join(' ')} />
          <polyline fill="none" stroke="#00f0ff" strokeWidth="2" points={history.map((d, i) => `${getX(i)},${getY(d.weight)}`).join(' ')} className="drop-shadow-[0_0_3px_rgba(0,240,255,0.4)]" />
          {history.map((d, i) => (
            <rect key={i} x={getX(i) - 5} y={0} width={10} height={40} fill="transparent" onMouseEnter={() => setHoveredPoint(i)} onMouseLeave={() => setHoveredPoint(null)} className="cursor-crosshair print:hidden" />
          ))}
          {hoveredPoint !== null && (
            <g className="print:hidden">
              <line x1={getX(hoveredPoint)} y1={0} x2={getX(hoveredPoint)} y2={40} stroke="#00f0ff" strokeWidth="1" strokeDasharray="2,1" />
              <circle cx={getX(hoveredPoint)} cy={getY(history[hoveredPoint].weight)} r="3" fill="#00f0ff" className="shadow-glow" />
            </g>
          )}
        </svg>
        {hoveredPoint !== null && (
          <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-black border border-primary px-2 py-1 z-20 pointer-events-none shadow-glow print:hidden">
            <div className="flex flex-col gap-0.5 text-[8px] font-mono leading-none">
              <span className="text-text-muted uppercase">{history[hoveredPoint].date}</span>
              <span className="text-primary font-bold">{history[hoveredPoint].weight}KG</span>
            </div>
          </div>
        )}
      </div>
      <div className="flex flex-col">
        <span className="text-[10px] font-bold text-primary">{exercise.progress}%</span>
      </div>
    </div>
  );
};

const AnalysisView: React.FC<AnalysisViewProps> = ({ exercises, timeframe }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('TODOS');
  const [activeTimeframe, setActiveTimeframe] = useState<AnalysisTimeframe>(timeframe);
  const [customRange, setCustomRange] = useState({ start: '', end: '' });
  const [deepInsight, setDeepInsight] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: 'name', direction: 'asc' });
  const [expandedRowId, setExpandedRowId] = useState<string | null>(null);

  const categories = useMemo(() => {
    const cats = exercises.map(ex => ex.category.split(' / ')[0].toUpperCase());
    return ['TODOS', ...Array.from(new Set(cats))];
  }, [exercises]);

  const filteredExercises = useMemo(() => {
    let result = [...exercises];
    if (selectedCategory !== 'TODOS') {
      result = result.filter(ex => ex.category.toUpperCase().includes(selectedCategory));
    }

    const now = new Date();
    if (activeTimeframe === 'CUSTOM' && customRange.start && customRange.end) {
      const start = new Date(customRange.start);
      const end = new Date(customRange.end);
      end.setHours(23, 59, 59);
      result = result.filter(ex => {
        const d = parseExerciseDate(ex.lastDate);
        return d >= start && d <= end;
      });
    } else if (activeTimeframe !== 'CUSTOM') {
      const days = activeTimeframe === 'WEEK' ? 7 : activeTimeframe === 'MONTH' ? 30 : 365;
      const cutoff = new Date(now.getTime() - (days * 24 * 60 * 60 * 1000));
      result = result.filter(ex => parseExerciseDate(ex.lastDate) >= cutoff);
    }

    result.sort((a, b) => {
      const aVal = a[sortConfig.key];
      const bVal = b[sortConfig.key];
      if (typeof aVal === 'string' && typeof bVal === 'string') {
        return sortConfig.direction === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
      }
      return sortConfig.direction === 'asc' ? (aVal as number) - (bVal as number) : (bVal as number) - (aVal as number);
    });
    return result;
  }, [exercises, selectedCategory, activeTimeframe, customRange, sortConfig]);

  useEffect(() => {
    const fetchInsight = async () => {
      if (filteredExercises.length === 0) {
        setDeepInsight("Sem dados para análise no período selecionado.");
        setIsLoading(false);
        return;
      }
      setIsLoading(true);
      const insight = await getDeepAnalysis(filteredExercises);
      setDeepInsight(insight);
      setIsLoading(false);
    };
    fetchInsight();
  }, [filteredExercises]);

  const toggleRow = (id: string) => {
    setExpandedRowId(expandedRowId === id ? null : id);
  };

  const handleExportCSV = () => {
    if (filteredExercises.length === 0) return;

    const headers = ["Exercicio", "Categoria", "Carga Atual (kg)", "Recorde Pessoal (kg)", "Progresso (%)", "Ultima Atualizacao"];
    const rows = filteredExercises.map(ex => [
      `"${ex.name}"`,
      `"${ex.category}"`,
      ex.lastWeight,
      ex.pbWeight,
      ex.progress,
      `"${ex.lastDate}"`
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map(row => row.join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    const timestamp = new Date().toISOString().split('T')[0];
    link.setAttribute("href", url);
    link.setAttribute("download", `evolution_performance_${selectedCategory.toLowerCase()}_${timestamp}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const timeframeLabel = activeTimeframe === 'CUSTOM' ? 'Personalizado' : (activeTimeframe === 'WEEK' ? 'Semanal' : activeTimeframe === 'MONTH' ? 'Mensal' : 'Anual');

  return (
    <div className="flex flex-col gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col gap-6 border-b border-border-dark pb-8 print:hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex flex-col gap-3">
            <span className="text-[10px] font-mono text-text-muted uppercase tracking-widest font-bold">Categoria</span>
            <div className="flex flex-wrap gap-2">
              {categories.map(cat => (
                <button key={cat} onClick={() => setSelectedCategory(cat)} className={`px-4 py-1.5 font-mono text-[11px] uppercase border ${selectedCategory === cat ? 'bg-primary text-black border-primary font-bold' : 'text-text-muted border-border-dark hover:border-primary'}`}>
                  {cat}
                </button>
              ))}
            </div>
          </div>
          <div className="flex flex-col gap-3 md:items-end">
            <span className="text-[10px] font-mono text-text-muted uppercase tracking-widest font-bold">Janela de Tempo</span>
            <div className="flex items-center gap-1 bg-black/40 border border-border-dark p-1 rounded-sm">
              {(['WEEK', 'MONTH', 'YEAR', 'CUSTOM'] as AnalysisTimeframe[]).map((tf) => (
                <button key={tf} onClick={() => setActiveTimeframe(tf)} className={`px-4 py-2 text-[10px] font-mono uppercase transition-all ${activeTimeframe === tf ? 'bg-primary text-black font-bold' : 'text-text-muted hover:text-white'}`}>
                  {tf === 'WEEK' ? 'Semana' : tf === 'MONTH' ? 'Mês' : tf === 'YEAR' ? 'Ano' : 'Custom'}
                </button>
              ))}
            </div>
          </div>
        </div>

        {activeTimeframe === 'CUSTOM' && (
          <div className="flex flex-wrap items-end gap-4 animate-in slide-in-from-top-2 duration-300">
            <div>
              <label className="block text-[9px] font-mono text-text-muted uppercase mb-1">Data Início</label>
              <input type="date" value={customRange.start} onChange={e => setCustomRange({...customRange, start: e.target.value})} className="bg-surface-dark border border-border-dark text-white font-mono text-xs p-2 outline-none focus:border-primary" style={{ colorScheme: 'dark' }} />
            </div>
            <div>
              <label className="block text-[9px] font-mono text-text-muted uppercase mb-1">Data Fim</label>
              <input type="date" value={customRange.end} onChange={e => setCustomRange({...customRange, end: e.target.value})} className="bg-surface-dark border border-border-dark text-white font-mono text-xs p-2 outline-none focus:border-primary" style={{ colorScheme: 'dark' }} />
            </div>
            <button onClick={() => setCustomRange({ start: '', end: '' })} className="text-[10px] font-mono text-text-muted hover:text-red-500 uppercase pb-2">Limpar</button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-surface-dark border-l-4 border-primary p-6 shadow-brutal-sm">
          <span className="text-[10px] font-mono text-text-muted uppercase tracking-widest">Atividade {timeframeLabel}</span>
          <div className="text-3xl font-bold text-white mt-1 font-mono">{filteredExercises.length} Exercícios</div>
        </div>
        <div className="bg-surface-dark border-l-4 border-primary p-6 shadow-brutal-sm col-span-2">
          <h3 className="text-[10px] font-mono text-text-muted uppercase tracking-widest mb-2">IA: Perspectiva de Treino</h3>
          <div className="font-mono text-xs leading-relaxed text-text-light italic">
            {isLoading ? "Processando biométrica..." : deepInsight}
          </div>
        </div>
      </div>

      <section className="bg-surface-dark border border-border-dark overflow-hidden mb-12">
        <div className="p-6 border-b border-border-dark bg-black/10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h3 className="text-lg font-bold uppercase tracking-wider text-white">Relatório de Performance</h3>
          <div className="flex items-center gap-3 print:hidden">
            <button 
              onClick={handleExportCSV}
              className="flex items-center gap-2 px-4 py-2 bg-black/40 border border-border-dark text-text-muted hover:text-primary hover:border-primary font-mono text-[10px] uppercase transition-all"
            >
              <span className="material-symbols-outlined text-sm">download</span>
              Exportar CSV
            </button>
            <button 
              onClick={() => window.print()} 
              className="flex items-center gap-2 px-4 py-2 bg-primary/20 border border-primary text-primary hover:bg-primary hover:text-black font-mono text-[10px] uppercase transition-all shadow-glow"
            >
              <span className="material-symbols-outlined text-sm">picture_as_pdf</span>
              Gerar PDF
            </button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left font-mono text-sm border-collapse">
            <thead className="bg-black/40 text-text-muted uppercase text-[10px] tracking-widest border-b border-border-dark/30">
              <tr>
                <th className="px-6 py-4 w-10"></th>
                <th className="px-6 py-4 cursor-pointer" onClick={() => setSortConfig({ key: 'name', direction: sortConfig.direction === 'asc' ? 'desc' : 'asc' })}>Exercício</th>
                <th className="px-6 py-4 text-right">Carga</th>
                <th className="px-6 py-4 text-right">RP</th>
                <th className="px-6 py-4">Evolução</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-dark/30">
              {filteredExercises.length === 0 ? (
                <tr><td colSpan={5} className="px-6 py-20 text-center text-text-muted italic">Nenhum dado encontrado para este intervalo.</td></tr>
              ) : (
                filteredExercises.map(ex => (
                  <React.Fragment key={ex.id}>
                    <tr 
                      onClick={() => toggleRow(ex.id)}
                      className={`hover:bg-primary/5 transition-colors group cursor-pointer ${expandedRowId === ex.id ? 'bg-primary/10' : ''}`}
                    >
                      <td className="px-6 py-4 text-center">
                        <span className={`material-symbols-outlined text-sm transition-transform duration-300 ${expandedRowId === ex.id ? 'rotate-90 text-primary' : 'text-text-muted group-hover:text-primary'}`}>
                          chevron_right
                        </span>
                      </td>
                      <td className="px-6 py-4 font-bold text-white uppercase">{ex.name}</td>
                      <td className="px-6 py-4 text-right">{ex.lastWeight}kg</td>
                      <td className="px-6 py-4 text-primary font-bold text-right">{ex.pbWeight}kg</td>
                      <td className="px-6 py-4"><PerformanceSparkline exercise={ex} /></td>
                    </tr>
                    
                    {/* Linha de Detalhes Expandida */}
                    {expandedRowId === ex.id && (
                      <tr className="bg-black/40 animate-in slide-in-from-top-2 duration-300">
                        <td colSpan={5} className="px-6 py-6">
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pl-10 border-l-2 border-primary/30">
                            <div className="col-span-full mb-2">
                               <span className="text-[10px] font-mono text-primary uppercase font-bold tracking-[0.2em]">Log de Atividade Recente</span>
                            </div>
                            {ex.history && ex.history.length > 0 ? (
                              ex.history.map((log, idx) => (
                                <div key={idx} className="flex items-center justify-between p-3 bg-surface-dark border border-border-dark/50 group/log">
                                  <div className="flex items-center gap-3">
                                    <div className={`size-2 rounded-full ${log.type === 'PR' ? 'bg-primary shadow-glow' : 'bg-text-muted opacity-50'}`}></div>
                                    <div className="flex flex-col">
                                      <span className="text-xs text-white font-bold">{log.weight}kg</span>
                                      <span className="text-[9px] text-text-muted uppercase">{log.date}</span>
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <span className={`text-[8px] font-mono font-bold px-2 py-0.5 rounded-full ${log.type === 'PR' ? 'bg-primary text-black' : 'bg-border-dark text-text-muted uppercase'}`}>
                                      {log.type === 'PR' ? 'RECORD' : 'LOAD'}
                                    </span>
                                  </div>
                                </div>
                              ))
                            ) : (
                              <div className="col-span-full text-xs text-text-muted italic py-4">
                                Nenhum log detalhado disponível para este ciclo.
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};

export default AnalysisView;
