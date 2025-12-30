
import React, { useState, useEffect } from 'react';
import { Exercise, Goal, ModalType, UserProfile } from './types';
import ExerciseCard from './features/exercises/components/ExerciseCard';
import AnalysisView from './features/exercises/components/AnalysisView';
import { getCoachingTips } from './services/geminiService';

// Features & Hooks
import { useExercises } from './hooks/useExercises';
import { useProfile } from './hooks/useProfile';
import ExerciseModal from './features/exercises/components/ExerciseModal';
import GoalModal from './features/exercises/components/GoalModal';
import ProfileModal from './features/profile/components/ProfileModal';
import CoachModal from './features/coach/components/CoachModal';

type ViewType = 'DASHBOARD' | 'ANALYSIS';
type TimeframeType = 'WEEK' | 'MONTH';


const App: React.FC = () => {
  // Usuário padrão hardcoded para funcionamento sem Auth
  const user = {
    id: "370a7584-f440-4ae6-8b67-ee6bc52dc527",
    name: "Achadoz Agência",
    image: "https://lh3.googleusercontent.com/a/ACg8ocLjq_rYcvuJ8VUPQ38yTvO7pcPHVwzicPAHv6eSTbeG3yeLVXU=s96-c"
  };

  const [isLightMode, setIsLightMode] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('evolution-theme') === 'light';
    }
    return false;
  });

  const {
    exercises,
    goals,
    isDataLoading,
    dataError,
    loadUserData,
    addExercise,
    updateExercise,
    deleteExercise,
    addGoal,
    deleteGoal
  } = useExercises(user.id);

  const {
    userProfile,
    loadProfile,
    updateProfile
  } = useProfile(user.id);

  const [activeModal, setActiveModal] = useState<ModalType>(null);
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);
  const [currentView, setCurrentView] = useState<ViewType>('DASHBOARD');
  const [timeframe, setTimeframe] = useState<TimeframeType>('WEEK');
  const [coachTip, setCoachTip] = useState<string>("");
  const [isLoadingTip, setIsLoadingTip] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);

  // Gerenciamento de Tema
  useEffect(() => {
    if (isLightMode) {
      document.documentElement.classList.add('light');
      localStorage.setItem('evolution-theme', 'light');
    } else {
      document.documentElement.classList.remove('light');
      localStorage.setItem('evolution-theme', 'dark');
    }
  }, [isLightMode]);

  const toggleTheme = () => setIsLightMode(!isLightMode);

  // Carregar dados iniciais
  useEffect(() => {
    loadUserData();
    loadProfile(user.name, user.image);
  }, [loadUserData, loadProfile]);

  const handleEditRequest = (ex: Exercise) => {
    setSelectedExercise(ex);
    setActiveModal('EDIT_EXERCISE');
  };

  const handleOpenCoach = async () => {
    setActiveModal('COACH_TIPS');
    setIsLoadingTip(true);
    const tip = await getCoachingTips(exercises);
    setCoachTip(tip);
    setIsLoadingTip(false);
  };

  const exportToCSV = () => {
    const date = new Date().toISOString().split('T')[0];
    let csvContent = 'RELATÓRIO EVOLUTION - DASHBOARD DE PERFORMANCE\n\n';

    csvContent += 'PERFIL DO ATLETA\n';
    csvContent += `Nome,${userProfile.name}\n`;
    csvContent += `Peso,${userProfile.weight} kg\n`;
    csvContent += `Nível,${userProfile.level}\n`;
    csvContent += `Período,${timeframe === 'WEEK' ? 'Semanal' : 'Mensal'}\n\n`;

    csvContent += 'EXERCÍCIOS\n';
    csvContent += 'Nome,Última Carga,Data Última Carga,Recorde Pessoal,Data RP,Volume Médio,Progresso\n';
    exercises.forEach(ex => {
      csvContent += `${ex.name},${ex.lastWeight} kg,${ex.lastDate},${ex.pbWeight} kg,${ex.pbDate},${ex.avgVolume} kg,${ex.progress}%\n`;
    });

    if (goals.length > 0) {
      csvContent += '\nMETAS\n';
      csvContent += 'Título,Descrição\n';
      goals.forEach(goal => {
        csvContent += `${goal.title},"${goal.description}"\n`;
      });
    }

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `relatorio_evolution_${date}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    setShowExportModal(false);
  };

  const exportToPDF = () => {
    const date = new Date().toISOString().split('T')[0];
    let htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Relatório Evolution</title>
        <style>
          body { font-family: 'Courier New', monospace; background: #0a0a0a; color: #e0e0e0; padding: 40px; margin: 0; }
          .header { text-align: center; border-bottom: 3px solid #00f0ff; padding-bottom: 20px; margin-bottom: 30px; }
          .header h1 { color: #00f0ff; font-size: 32px; margin: 0; letter-spacing: 4px; }
          .header p { color: #888; font-size: 12px; margin: 5px 0 0 0; }
          .section { margin-bottom: 30px; }
          .section-title { color: #00f0ff; font-size: 18px; border-bottom: 2px solid #333; padding-bottom: 10px; margin-bottom: 15px; text-transform: uppercase; letter-spacing: 2px; }
          .profile-info { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; background: #1a1a1a; padding: 20px; border: 1px solid #333; }
          .profile-item { display: flex; justify-content: space-between; }
          .profile-item label { color: #888; font-size: 12px; }
          .profile-item value { color: #00f0ff; font-weight: bold; }
          table { width: 100%; border-collapse: collapse; background: #1a1a1a; border: 1px solid #333; }
          th { background: #00f0ff; color: #000; padding: 12px; text-align: left; font-size: 11px; text-transform: uppercase; letter-spacing: 1px; }
          td { padding: 10px 12px; border-bottom: 1px solid #333; font-size: 12px; }
          tr:last-child td { border-bottom: none; }
          .goal-card { background: #1a1a1a; border: 1px solid #333; padding: 15px; margin-bottom: 10px; }
          .goal-card h4 { color: #00f0ff; margin: 0 0 10px 0; font-size: 14px; }
          .goal-card p { color: #888; margin: 0; font-size: 12px; }
          .footer { text-align: center; margin-top: 40px; padding-top: 20px; border-top: 2px solid #333; color: #555; font-size: 10px; }
        </style>
      </head>
      <body>
        <div class="header"><h1>⚡ EVOLUTION</h1><p>Dashboard de Performance - Relatório Gerado em ${new Date().toLocaleDateString('pt-BR')}</p></div>
        <div class="section"><div class="section-title">Perfil do Atleta</div><div class="profile-info"><div class="profile-item"><label>Nome:</label><value>${userProfile.name}</value></div><div class="profile-item"><label>Peso:</label><value>${userProfile.weight} kg</value></div><div class="profile-item"><label>Nível:</label><value>${userProfile.level}</value></div><div class="profile-item"><label>Período:</label><value>${timeframe === 'WEEK' ? 'Semanal' : 'Mensal'}</value></div></div></div>
        <div class="section"><div class="section-title">Exercícios</div><table><thead><tr><th>Exercício</th><th>Última Carga</th><th>Data</th><th>Recorde Pessoal</th><th>Data RP</th><th>Volume Médio</th><th>Progresso</th></tr></thead><tbody>
        ${exercises.map(ex => `<tr><td>${ex.name}</td><td>${ex.lastWeight} kg</td><td>${ex.lastDate}</td><td>${ex.pbWeight} kg</td><td>${ex.pbDate}</td><td>${ex.avgVolume} kg</td><td>${ex.progress}%</td></tr>`).join('')}
        </tbody></table></div>
        ${goals.length > 0 ? `<div class="section"><div class="section-title">Metas e Objetivos</div>${goals.map(goal => `<div class="goal-card"><h4>${goal.title}</h4><p>${goal.description}</p></div>`).join('')}</div>` : ''}
        <div class="footer"><p>Relatório gerado automaticamente pelo sistema EVOLUTION</p><p>© ${new Date().getFullYear()} - Dashboard de Performance para Atletas</p></div>
      </body></html>
    `;

    const iframe = document.createElement('iframe');
    iframe.style.display = 'none';
    document.body.appendChild(iframe);
    const iframeDoc = iframe.contentWindow?.document;
    if (iframeDoc) {
      iframeDoc.open(); iframeDoc.write(htmlContent); iframeDoc.close();
      iframe.onload = () => { setTimeout(() => { iframe.contentWindow?.print(); setTimeout(() => { document.body.removeChild(iframe); }, 100); }, 250); };
    }
    setShowExportModal(false);
  };

  const toggleTimeframe = () => setTimeframe(prev => prev === 'WEEK' ? 'MONTH' : 'WEEK');

  const displayExercises = exercises.map(ex => ({
    ...ex,
    avgVolume: timeframe === 'WEEK' ? ex.avgVolume : parseFloat((ex.avgVolume * 4.3).toFixed(1))
  }));

  const getInitials = (name: string) => name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);

  return (
    <div className="min-h-screen flex flex-col bg-background text-text-main transition-colors duration-300">
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border px-6 py-4 flex items-center justify-between shadow-lg print:hidden">
        <div className="flex items-center gap-4">
          <div className="size-10 bg-primary flex items-center justify-center border-2 border-transparent shadow-[0_0_10px_rgba(0,240,255,0.4)]">
            <span className="material-symbols-outlined text-black font-black" style={{ fontSize: '24px' }}>fitness_center</span>
          </div>
          <div className="flex flex-col">
            <h1 className="text-text-main text-xl font-bold tracking-widest uppercase leading-none">EVOLUTION</h1>
            <span className="text-[10px] text-primary font-mono tracking-widest uppercase">Dashboard de Performance</span>
          </div>
        </div>

        <div className="hidden md:flex items-center gap-6 text-xs font-mono text-text-muted">
          <button onClick={() => setCurrentView('DASHBOARD')} className={`transition-colors uppercase ${currentView === 'DASHBOARD' ? 'text-primary' : 'hover:text-primary'}`}>Início</button>
          <button onClick={handleOpenCoach} className="hover:text-primary transition-colors uppercase flex items-center gap-1">
            <span className="material-symbols-outlined text-sm">auto_awesome</span>Coach IA
          </button>
          <button onClick={() => setCurrentView('ANALYSIS')} className={`transition-colors uppercase ${currentView === 'ANALYSIS' ? 'text-primary' : 'hover:text-primary'}`}>Análise</button>
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={toggleTheme}
            className="size-9 bg-surface border border-border flex items-center justify-center text-text-muted hover:text-primary hover:border-primary transition-all"
            title={isLightMode ? "Ativar Modo Noturno" : "Ativar Modo Claro"}
          >
            <span className="material-symbols-outlined text-lg">
              {isLightMode ? 'dark_mode' : 'light_mode'}
            </span>
          </button>

          <div onClick={() => setActiveModal('PROFILE')} className="flex items-center gap-3 cursor-pointer group">
            <div className="hidden sm:flex flex-col items-end">
              <span className="text-text-main font-bold text-xs uppercase font-mono group-hover:text-primary transition-colors">{userProfile.name}</span>
              <span className="text-[9px] text-text-muted font-mono uppercase tracking-tighter">{userProfile.level}</span>
            </div>
            <div className="size-9 bg-surface border border-border flex items-center justify-center text-xs font-mono font-bold text-primary overflow-hidden hover:border-primary transition-all relative">
              {userProfile.photo ? <img src={userProfile.photo} alt="Profile" className="w-full h-full object-cover" /> : getInitials(userProfile.name)}
              <div className="absolute inset-0 bg-primary/20 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                <span className="material-symbols-outlined text-sm text-black font-bold">edit</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-grow pt-32 pb-32 md:pb-32 px-4 md:px-8 flex justify-center print:pt-4">
        <div className="w-full max-w-7xl flex flex-col gap-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-border pb-6">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold uppercase text-text-main mb-2 tracking-tight">
                {currentView === 'DASHBOARD' ? 'Visão Geral de Desempenho' : 'Análise Técnica de Tendências'}
              </h2>
              <p className="text-text-muted font-mono text-sm max-w-2xl leading-relaxed">
                {currentView === 'DASHBOARD'
                  ? `Métricas ${timeframe === 'WEEK' ? 'semanais' : 'mensais'} de força e análise de volume para atletas.`
                  : `Análise profunda de dados biométricos no período de ${timeframe === 'WEEK' ? '30 dias' : '6 meses'}.`}
              </p>
            </div>
            <div className="flex gap-3 shrink-0 print:hidden">
              <button onClick={toggleTimeframe} className="px-4 py-2 border border-primary text-primary hover:bg-primary hover:text-black font-mono text-xs uppercase transition-all shadow-glow">
                {timeframe === 'WEEK' ? 'Ver Mês' : 'Ver Semana'}
              </button>
              <button onClick={() => setShowExportModal(true)} className="px-4 py-2 bg-primary text-black font-bold font-mono text-xs uppercase shadow-brutal-sm hover:translate-y-[1px] hover:translate-x-[1px] hover:shadow-none transition-all border border-primary">Exportar</button>
            </div>
          </div>

          {currentView === 'DASHBOARD' ? (
            <section className="flex flex-col gap-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {displayExercises.map(ex => (
                  <ExerciseCard key={ex.id} exercise={ex} onDelete={deleteExercise} onEdit={() => handleEditRequest(ex)} />
                ))}
                <button onClick={() => setActiveModal('ADD_EXERCISE')} className="bg-surface/30 border-2 border-dashed border-border hover:border-primary group transition-all p-6 flex flex-col items-center justify-center gap-4 text-text-muted hover:text-primary print:hidden">
                  <span className="material-symbols-outlined text-4xl group-hover:scale-110 transition-transform">add_circle</span>
                  <span className="font-mono text-xs uppercase tracking-widest">Novo Exercício</span>
                </button>
              </div>

              <section className="mt-8">
                <div className="flex items-center gap-4 mb-6"><div className="h-px bg-border flex-1"></div><span className="text-xs font-mono text-text-muted uppercase tracking-widest">Alvos & Objetivos</span><div className="h-px bg-border flex-1"></div></div>
                {goals.length === 0 ? (
                  <div className="relative overflow-hidden group border border-dashed border-border bg-surface/50 p-12 flex flex-col items-center justify-center text-center hover:bg-surface/80 transition-colors duration-300 print:hidden">
                    <div className="bg-surface border border-primary p-4 mb-6 shadow-[4px_4px_0_0_#00f0ff] rotate-3 group-hover:rotate-0 transition-transform duration-300"><span className="material-symbols-outlined text-primary text-5xl">insights</span></div>
                    <h3 className="text-2xl font-bold uppercase text-text-main tracking-tight mb-2">Sem Metas Ativas</h3>
                    <button onClick={() => setActiveModal('ADD_GOAL')} className="flex items-center gap-2 bg-transparent hover:bg-primary text-primary hover:text-black border-2 border-primary px-8 py-3 text-sm font-bold uppercase tracking-wider transition-all duration-300">Nova Meta</button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {goals.map(goal => (
                      <div key={goal.id} className="bg-surface border border-border p-6 relative group">
                        <h4 className="text-text-main text-lg font-bold uppercase mb-2">{goal.title}</h4>
                        <p className="text-text-muted font-mono text-sm">{goal.description}</p>
                        <button onClick={() => deleteGoal(goal.id)} className="absolute top-4 right-4 text-text-muted opacity-0 group-hover:opacity-100 transition-opacity hover:text-red-500 print:hidden"><span className="material-symbols-outlined">delete</span></button>
                      </div>
                    ))}
                    <button onClick={() => setActiveModal('ADD_GOAL')} className="border-2 border-dashed border-border hover:border-primary flex items-center justify-center p-6 text-text-muted hover:text-primary transition-all group print:hidden"><span className="material-symbols-outlined text-2xl group-hover:scale-125 transition-transform">add</span></button>
                  </div>
                )}
              </section>
            </section>
          ) : (
            <AnalysisView exercises={exercises} timeframe={timeframe} />
          )}
        </div>
      </main>

      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-md border-t border-border px-2 py-3 flex items-center justify-around shadow-[0_-10px_20px_rgba(0,0,0,0.5)] print:hidden">
        <button onClick={() => setCurrentView('DASHBOARD')} className={`flex flex-col items-center gap-1 w-full ${currentView === 'DASHBOARD' ? 'text-primary' : 'text-text-muted'}`}><span className="material-symbols-outlined text-2xl">dashboard</span><span className="text-[10px] font-mono uppercase tracking-widest font-bold">Início</span></button>
        <button onClick={handleOpenCoach} className="flex flex-col items-center gap-1 text-text-muted w-full"><div className="bg-primary/10 rounded-full p-2 -mt-6 border border-primary/20 shadow-[0_0_15px_rgba(0,240,255,0.2)]"><span className="material-symbols-outlined text-primary text-2xl">auto_awesome</span></div><span className="text-[10px] font-mono uppercase tracking-widest font-bold">Coach IA</span></button>
        <button onClick={() => setCurrentView('ANALYSIS')} className={`flex flex-col items-center gap-1 w-full ${currentView === 'ANALYSIS' ? 'text-primary' : 'text-text-muted'}`}><span className="material-symbols-outlined text-2xl">analytics</span><span className="text-[10px] font-mono uppercase tracking-widest font-bold">Análise</span></button>
      </nav>

      <button onClick={() => setActiveModal('ADD_EXERCISE')} className="fixed bottom-24 right-6 md:bottom-8 md:right-8 z-40 size-14 md:size-16 bg-primary text-black flex items-center justify-center shadow-glow hover:scale-110 transition-all print:hidden"><span className="material-symbols-outlined font-bold text-2xl md:text-3xl">add</span></button>

      <ExerciseModal
        isOpen={activeModal === 'ADD_EXERCISE' || activeModal === 'EDIT_EXERCISE'}
        onClose={() => setActiveModal(null)}
        onAddExercise={addExercise}
        onUpdateExercise={(data) => selectedExercise && updateExercise(selectedExercise.id, selectedExercise, data)}
        selectedExercise={selectedExercise}
      />

      <GoalModal
        isOpen={activeModal === 'ADD_GOAL'}
        onClose={() => setActiveModal(null)}
        onAddGoal={addGoal}
      />

      <ProfileModal
        isOpen={activeModal === 'PROFILE'}
        onClose={() => setActiveModal(null)}
        userProfile={userProfile}
        onUpdateProfile={updateProfile}
      />

      <CoachModal
        isOpen={activeModal === 'COACH_TIPS'}
        onClose={() => setActiveModal(null)}
        coachTip={coachTip}
        isLoadingTip={isLoadingTip}
      />

      {showExportModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-background/80 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-surface border border-border shadow-2xl w-full max-w-md animate-in slide-in-from-bottom-4 duration-300 overflow-hidden">
            <div className="bg-primary px-6 py-6 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-black text-2xl">download</span>
                <div>
                  <h3 className="text-black font-black text-lg uppercase tracking-tighter leading-none">Exportar Dados</h3>
                  <p className="text-black/60 font-mono text-[9px] uppercase tracking-widest mt-1">Extração de relatórios</p>
                </div>
              </div>
              <button
                onClick={() => setShowExportModal(false)}
                className="text-black hover:bg-black/10 size-8 flex items-center justify-center rounded-full transition-all"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="p-8">
              <p className="text-text-muted font-mono text-[10px] uppercase tracking-widest mb-6 font-bold">Selecione o protocolo de saída:</p>

              <div className="flex flex-col gap-4">
                <button
                  onClick={exportToCSV}
                  className="group bg-black/5 border border-border hover:border-primary p-5 flex items-center gap-5 transition-all text-left relative overflow-hidden"
                >
                  <div className="absolute inset-0 bg-primary/0 group-hover:bg-primary/[0.02] transition-colors"></div>
                  <div className="size-12 bg-primary/10 border border-primary/30 flex items-center justify-center group-hover:bg-primary group-hover:border-primary transition-all">
                    <span className="material-symbols-outlined text-primary text-2xl group-hover:text-black transition-colors">table_chart</span>
                  </div>
                  <div className="flex-1">
                    <h4 className="text-text-main font-black text-sm uppercase tracking-tight mb-0.5">Relatório CSV</h4>
                    <p className="text-text-muted font-mono text-[10px] uppercase">Excel / Google Sheets</p>
                  </div>
                </button>

                <button
                  onClick={exportToPDF}
                  className="group bg-black/5 border border-border hover:border-primary p-5 flex items-center gap-5 transition-all text-left relative overflow-hidden"
                >
                  <div className="absolute inset-0 bg-primary/0 group-hover:bg-primary/[0.02] transition-colors"></div>
                  <div className="size-12 bg-primary/10 border border-primary/30 flex items-center justify-center group-hover:bg-primary group-hover:border-primary transition-all">
                    <span className="material-symbols-outlined text-primary text-2xl group-hover:text-black transition-colors">picture_as_pdf</span>
                  </div>
                  <div className="flex-1">
                    <h4 className="text-text-main font-black text-sm uppercase tracking-tight mb-0.5">Arquivo PDF</h4>
                    <p className="text-text-muted font-mono text-[10px] uppercase">Pronto para Impressão</p>
                  </div>
                </button>
              </div>

              <button
                onClick={() => setShowExportModal(false)}
                className="w-full mt-8 py-4 border border-border text-text-muted hover:text-text-main font-mono text-xs uppercase font-bold tracking-[0.2em] transition-all hover:bg-black/5"
              >
                Abortar Exportação
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};


export default App;
