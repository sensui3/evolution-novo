
import React, { useState, useEffect, useCallback } from 'react';
import { Exercise, Goal, ModalType, UserProfile, WeightLog } from './types';
import { INITIAL_EXERCISES } from './constants';
import ExerciseCard from './components/ExerciseCard';
import AnalysisView from './components/AnalysisView';
import Modal from './components/Modals';
import { getCoachingTips } from './services/geminiService';

type ViewType = 'DASHBOARD' | 'ANALYSIS';
type TimeframeType = 'WEEK' | 'MONTH';

const App: React.FC = () => {
  const [exercises, setExercises] = useState<Exercise[]>(INITIAL_EXERCISES);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [activeModal, setActiveModal] = useState<ModalType>(null);
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);
  const [currentView, setCurrentView] = useState<ViewType>('DASHBOARD');
  const [timeframe, setTimeframe] = useState<TimeframeType>('WEEK');
  const [coachTip, setCoachTip] = useState<string>("");
  const [isLoadingTip, setIsLoadingTip] = useState(false);

  const [userProfile, setUserProfile] = useState<UserProfile>({
    name: 'Atleta Evolution',
    weight: 85,
    level: 'Intermediário',
    photo: null
  });
  const [showExportModal, setShowExportModal] = useState(false);

  const handleAddExercise = (newEx: Omit<Exercise, 'id' | 'progress'>) => {
    const ex: Exercise = {
      ...newEx,
      id: Math.random().toString(36).substr(2, 9),
      progress: Math.floor(Math.random() * 40) + 60,
      history: []
    };
    setExercises([...exercises, ex]);
  };

  const handleUpdateExercise = (updatedData: Omit<Exercise, 'id' | 'progress' | 'history'>) => {
    if (!selectedExercise) return;

    setExercises(prev => prev.map(ex => {
      if (ex.id === selectedExercise.id) {
        const newHistory: WeightLog[] = [...(ex.history || [])];

        // Verifica se a carga mudou para adicionar ao log
        if (updatedData.lastWeight !== ex.lastWeight) {
          newHistory.unshift({ weight: ex.lastWeight, date: ex.lastDate, type: 'LOAD' });
        }
        // Verifica se o RP mudou para adicionar ao log
        if (updatedData.pbWeight !== ex.pbWeight) {
          newHistory.unshift({ weight: ex.pbWeight, date: ex.pbDate, type: 'PR' });
        }

        return {
          ...ex,
          ...updatedData,
          history: newHistory.slice(0, 3) // Mantém apenas as últimas 3 modificações
        };
      }
      return ex;
    }));
    setSelectedExercise(null);
  };

  const handleDeleteExercise = (id: string) => {
    setExercises(exercises.filter(ex => ex.id !== id));
  };

  const handleEditRequest = (ex: Exercise) => {
    setSelectedExercise(ex);
    setActiveModal('EDIT_EXERCISE');
  };

  const handleAddGoal = (newGoal: Omit<Goal, 'id'>) => {
    const goal: Goal = {
      ...newGoal,
      id: Math.random().toString(36).substr(2, 9),
    };
    setGoals([...goals, goal]);
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

    // Informações do Perfil
    csvContent += 'PERFIL DO ATLETA\n';
    csvContent += `Nome,${userProfile.name}\n`;
    csvContent += `Peso,${userProfile.weight} kg\n`;
    csvContent += `Nível,${userProfile.level}\n`;
    csvContent += `Período,${timeframe === 'WEEK' ? 'Semanal' : 'Mensal'}\n\n`;

    // Exercícios
    csvContent += 'EXERCÍCIOS\n';
    csvContent += 'Nome,Última Carga,Data Última Carga,Recorde Pessoal,Data RP,Volume Médio,Progresso\n';
    exercises.forEach(ex => {
      csvContent += `${ex.name},${ex.lastWeight} kg,${ex.lastDate},${ex.pbWeight} kg,${ex.pbDate},${ex.avgVolume} kg,${ex.progress}%\n`;
    });

    // Metas
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

    // Criar conteúdo HTML para o PDF
    let htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Relatório Evolution</title>
        <style>
          body {
            font-family: 'Courier New', monospace;
            background: #0a0a0a;
            color: #e0e0e0;
            padding: 40px;
            margin: 0;
          }
          .header {
            text-align: center;
            border-bottom: 3px solid #00f0ff;
            padding-bottom: 20px;
            margin-bottom: 30px;
          }
          .header h1 {
            color: #00f0ff;
            font-size: 32px;
            margin: 0;
            letter-spacing: 4px;
          }
          .header p {
            color: #888;
            font-size: 12px;
            margin: 5px 0 0 0;
          }
          .section {
            margin-bottom: 30px;
          }
          .section-title {
            color: #00f0ff;
            font-size: 18px;
            border-bottom: 2px solid #333;
            padding-bottom: 10px;
            margin-bottom: 15px;
            text-transform: uppercase;
            letter-spacing: 2px;
          }
          .profile-info {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 10px;
            background: #1a1a1a;
            padding: 20px;
            border: 1px solid #333;
          }
          .profile-item {
            display: flex;
            justify-content: space-between;
          }
          .profile-item label {
            color: #888;
            font-size: 12px;
          }
          .profile-item value {
            color: #00f0ff;
            font-weight: bold;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            background: #1a1a1a;
            border: 1px solid #333;
          }
          th {
            background: #00f0ff;
            color: #000;
            padding: 12px;
            text-align: left;
            font-size: 11px;
            text-transform: uppercase;
            letter-spacing: 1px;
          }
          td {
            padding: 10px 12px;
            border-bottom: 1px solid #333;
            font-size: 12px;
          }
          tr:last-child td {
            border-bottom: none;
          }
          .goal-card {
            background: #1a1a1a;
            border: 1px solid #333;
            padding: 15px;
            margin-bottom: 10px;
          }
          .goal-card h4 {
            color: #00f0ff;
            margin: 0 0 10px 0;
            font-size: 14px;
          }
          .goal-card p {
            color: #888;
            margin: 0;
            font-size: 12px;
          }
          .footer {
            text-align: center;
            margin-top: 40px;
            padding-top: 20px;
            border-top: 2px solid #333;
            color: #555;
            font-size: 10px;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>⚡ EVOLUTION</h1>
          <p>Dashboard de Performance - Relatório Gerado em ${new Date().toLocaleDateString('pt-BR')}</p>
        </div>
        
        <div class="section">
          <div class="section-title">Perfil do Atleta</div>
          <div class="profile-info">
            <div class="profile-item">
              <label>Nome:</label>
              <value>${userProfile.name}</value>
            </div>
            <div class="profile-item">
              <label>Peso:</label>
              <value>${userProfile.weight} kg</value>
            </div>
            <div class="profile-item">
              <label>Nível:</label>
              <value>${userProfile.level}</value>
            </div>
            <div class="profile-item">
              <label>Período:</label>
              <value>${timeframe === 'WEEK' ? 'Semanal' : 'Mensal'}</value>
            </div>
          </div>
        </div>
        
        <div class="section">
          <div class="section-title">Exercícios</div>
          <table>
            <thead>
              <tr>
                <th>Exercício</th>
                <th>Última Carga</th>
                <th>Data</th>
                <th>Recorde Pessoal</th>
                <th>Data RP</th>
                <th>Volume Médio</th>
                <th>Progresso</th>
              </tr>
            </thead>
            <tbody>
              ${exercises.map(ex => `
                <tr>
                  <td>${ex.name}</td>
                  <td>${ex.lastWeight} kg</td>
                  <td>${ex.lastDate}</td>
                  <td>${ex.pbWeight} kg</td>
                  <td>${ex.pbDate}</td>
                  <td>${ex.avgVolume} kg</td>
                  <td>${ex.progress}%</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
        
        ${goals.length > 0 ? `
          <div class="section">
            <div class="section-title">Metas e Objetivos</div>
            ${goals.map(goal => `
              <div class="goal-card">
                <h4>${goal.title}</h4>
                <p>${goal.description}</p>
              </div>
            `).join('')}
          </div>
        ` : ''}
        
        <div class="footer">
          <p>Relatório gerado automaticamente pelo sistema EVOLUTION</p>
          <p>© ${new Date().getFullYear()} - Dashboard de Performance para Atletas</p>
        </div>
      </body>
      </html>
    `;

    // Criar um iframe oculto para imprimir
    const iframe = document.createElement('iframe');
    iframe.style.display = 'none';
    document.body.appendChild(iframe);

    const iframeDoc = iframe.contentWindow?.document;
    if (iframeDoc) {
      iframeDoc.open();
      iframeDoc.write(htmlContent);
      iframeDoc.close();

      // Aguardar o carregamento e então imprimir
      iframe.onload = () => {
        setTimeout(() => {
          iframe.contentWindow?.print();
          setTimeout(() => {
            document.body.removeChild(iframe);
          }, 100);
        }, 250);
      };
    }

    setShowExportModal(false);
  };

  const toggleTimeframe = () => {
    setTimeframe(prev => prev === 'WEEK' ? 'MONTH' : 'WEEK');
  };

  const displayExercises = exercises.map(ex => ({
    ...ex,
    avgVolume: timeframe === 'WEEK' ? ex.avgVolume : parseFloat((ex.avgVolume * 4.3).toFixed(1))
  }));

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-background-dark/95 backdrop-blur-sm border-b border-border-dark px-6 py-4 flex items-center justify-between shadow-lg print:hidden">
        <div className="flex items-center gap-4">
          <div className="size-10 bg-primary flex items-center justify-center border-2 border-transparent shadow-[0_0_10px_rgba(0,240,255,0.4)]">
            <span className="material-symbols-outlined text-black font-black" style={{ fontSize: '24px' }}>fitness_center</span>
          </div>
          <div className="flex flex-col">
            <h1 className="text-white text-xl font-bold tracking-widest uppercase leading-none">EVOLUTION</h1>
            <span className="text-[10px] text-primary font-mono tracking-widest uppercase">Dashboard de Performance</span>
          </div>
        </div>

        {/* Nav Desktop */}
        <div className="hidden md:flex items-center gap-6 text-xs font-mono text-text-muted">
          <button
            onClick={() => setCurrentView('DASHBOARD')}
            className={`transition-colors uppercase ${currentView === 'DASHBOARD' ? 'text-primary' : 'hover:text-primary'}`}
          >
            Início
          </button>
          <button onClick={handleOpenCoach} className="hover:text-primary transition-colors uppercase flex items-center gap-1">
            <span className="material-symbols-outlined text-sm">auto_awesome</span>
            Coach IA
          </button>
          <button
            onClick={() => setCurrentView('ANALYSIS')}
            className={`transition-colors uppercase ${currentView === 'ANALYSIS' ? 'text-primary' : 'hover:text-primary'}`}
          >
            Análise
          </button>
        </div>

        <div className="flex items-center gap-4">
          <div
            onClick={() => setActiveModal('PROFILE')}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="hidden sm:flex flex-col items-end">
              <span className="text-white font-bold text-xs uppercase font-mono group-hover:text-primary transition-colors">{userProfile.name}</span>
              <span className="text-[9px] text-text-muted font-mono uppercase tracking-tighter">{userProfile.level}</span>
            </div>
            <div className="size-9 bg-surface-dark border border-border-dark flex items-center justify-center text-xs font-mono font-bold text-primary overflow-hidden hover:border-primary transition-all relative">
              {userProfile.photo ? (
                <img src={userProfile.photo} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                getInitials(userProfile.name)
              )}
              <div className="absolute inset-0 bg-primary/20 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                <span className="material-symbols-outlined text-sm text-black font-bold">edit</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow pt-32 pb-32 md:pb-32 px-4 md:px-8 flex justify-center print:pt-4">
        <div className="w-full max-w-7xl flex flex-col gap-10">

          {/* Dashboard Hero */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-border-dark pb-6">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold uppercase text-white mb-2 tracking-tight">
                {currentView === 'DASHBOARD' ? 'Visão Geral de Desempenho' : 'Análise Técnica de Tendências'}
              </h2>
              <p className="text-text-muted font-mono text-sm max-w-2xl leading-relaxed">
                {currentView === 'DASHBOARD'
                  ? `Métricas ${timeframe === 'WEEK' ? 'semanais' : 'mensais'} de força e análise de volume para atletas. Acompanhe sua progressão contra baselines.`
                  : `Análise profunda de dados biométricos no período de ${timeframe === 'WEEK' ? '30 dias' : '6 meses'}. Entenda seus pontos fortes.`}
              </p>
            </div>
            <div className="flex gap-3 shrink-0 print:hidden">
              <button
                onClick={toggleTimeframe}
                className="px-4 py-2 border border-primary text-primary hover:bg-primary hover:text-black font-mono text-xs uppercase transition-all shadow-glow"
              >
                {currentView === 'DASHBOARD'
                  ? (timeframe === 'WEEK' ? 'Ver Mês' : 'Ver Semana')
                  : (timeframe === 'WEEK' ? 'Ver Histórico' : 'Ver 30 Dias')}
              </button>
              <button
                onClick={() => setShowExportModal(true)}
                className="px-4 py-2 bg-primary text-black font-bold font-mono text-xs uppercase shadow-brutal-sm hover:translate-y-[1px] hover:translate-x-[1px] hover:shadow-none transition-all border border-primary"
              >
                Exportar
              </button>
            </div>
          </div>

          {currentView === 'DASHBOARD' ? (
            <>
              <section className="flex flex-col gap-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-primary">grid_view</span>
                    <h3 className="text-xl font-bold uppercase tracking-wider text-white">Exercícios Chave</h3>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {displayExercises.map(ex => (
                    <ExerciseCard
                      key={ex.id}
                      exercise={ex}
                      onDelete={handleDeleteExercise}
                      onEdit={() => handleEditRequest(ex)}
                    />
                  ))}

                  <button
                    onClick={() => setActiveModal('ADD_EXERCISE')}
                    className="bg-surface-dark/30 border-2 border-dashed border-border-dark hover:border-primary group transition-all p-6 flex flex-col items-center justify-center gap-4 text-text-muted hover:text-primary print:hidden"
                  >
                    <span className="material-symbols-outlined text-4xl group-hover:scale-110 transition-transform">add_circle</span>
                    <span className="font-mono text-xs uppercase tracking-widest">Novo Exercício</span>
                  </button>
                </div>
              </section>

              <section className="mt-8">
                <div className="flex items-center gap-4 mb-6">
                  <div className="h-px bg-border-dark flex-1"></div>
                  <span className="text-xs font-mono text-text-muted uppercase tracking-widest">Alvos & Objetivos</span>
                  <div className="h-px bg-border-dark flex-1"></div>
                </div>

                {goals.length === 0 ? (
                  <div className="relative overflow-hidden group border border-dashed border-border-dark bg-surface-dark/50 p-12 flex flex-col items-center justify-center text-center hover:bg-surface-dark/80 transition-colors duration-300 print:hidden">
                    <div className="bg-surface-dark border border-primary p-4 mb-6 shadow-[4px_4px_0_0_#00f0ff] rotate-3 group-hover:rotate-0 transition-transform duration-300">
                      <span className="material-symbols-outlined text-primary text-5xl">insights</span>
                    </div>
                    <h3 className="text-2xl font-bold uppercase text-white tracking-tight mb-2">Sem Metas Ativas</h3>
                    <button
                      onClick={() => setActiveModal('ADD_GOAL')}
                      className="flex items-center gap-2 bg-transparent hover:bg-primary text-primary hover:text-black border-2 border-primary px-8 py-3 text-sm font-bold uppercase tracking-wider transition-all duration-300 shadow-none hover:shadow-[0_0_15px_rgba(0,240,255,0.4)]"
                    >
                      <span className="material-symbols-outlined text-lg">add_circle</span>
                      <span>Nova Meta</span>
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {goals.map(goal => (
                      <div key={goal.id} className="bg-surface-dark border border-border-dark p-6 relative group">
                        <h4 className="text-white text-lg font-bold uppercase mb-2">{goal.title}</h4>
                        <p className="text-text-muted font-mono text-sm">{goal.description}</p>
                        <button
                          onClick={() => setGoals(goals.filter(g => g.id !== goal.id))}
                          className="absolute top-4 right-4 text-text-muted opacity-0 group-hover:opacity-100 transition-opacity hover:text-red-500 print:hidden"
                        >
                          <span className="material-symbols-outlined">delete</span>
                        </button>
                      </div>
                    ))}
                    <button
                      onClick={() => setActiveModal('ADD_GOAL')}
                      className="border-2 border-dashed border-border-dark hover:border-primary flex items-center justify-center p-6 text-text-muted hover:text-primary transition-all group print:hidden"
                    >
                      <span className="material-symbols-outlined text-2xl group-hover:scale-125 transition-transform">add</span>
                    </button>
                  </div>
                )}
              </section>
            </>
          ) : (
            <AnalysisView exercises={exercises} timeframe={timeframe} />
          )}
        </div>
      </main>

      {/* Mobile Nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-background-dark/95 backdrop-blur-md border-t border-border-dark px-2 py-3 flex items-center justify-around shadow-[0_-10px_20px_rgba(0,0,0,0.5)] print:hidden">
        <button
          onClick={() => setCurrentView('DASHBOARD')}
          className={`flex flex-col items-center gap-1 transition-all duration-300 w-full ${currentView === 'DASHBOARD' ? 'text-primary' : 'text-text-muted'}`}
        >
          <span className="material-symbols-outlined text-2xl">dashboard</span>
          <span className="text-[10px] font-mono uppercase tracking-widest font-bold">Início</span>
        </button>

        <button
          onClick={handleOpenCoach}
          className="flex flex-col items-center gap-1 text-text-muted hover:text-primary transition-all duration-300 w-full"
        >
          <div className="bg-primary/10 rounded-full p-2 -mt-6 border border-primary/20 shadow-[0_0_15px_rgba(0,240,255,0.2)]">
            <span className="material-symbols-outlined text-primary text-2xl">auto_awesome</span>
          </div>
          <span className="text-[10px] font-mono uppercase tracking-widest font-bold">Coach IA</span>
        </button>

        <button
          onClick={() => setCurrentView('ANALYSIS')}
          className={`flex flex-col items-center gap-1 transition-all duration-300 w-full ${currentView === 'ANALYSIS' ? 'text-primary' : 'text-text-muted'}`}
        >
          <span className="material-symbols-outlined text-2xl">analytics</span>
          <span className="text-[10px] font-mono uppercase tracking-widest font-bold">Análise</span>
        </button>
      </nav>

      {/* FAB */}
      <button
        onClick={() => setActiveModal('ADD_EXERCISE')}
        className="fixed bottom-24 right-6 md:bottom-8 md:right-8 z-40 size-14 md:size-16 bg-primary text-black flex items-center justify-center shadow-glow hover:scale-110 active:scale-95 transition-all duration-200 border-2 border-transparent print:hidden"
        title="Adicionar Exercício"
      >
        <span className="material-symbols-outlined font-bold text-2xl md:text-3xl">add</span>
      </button>

      {/* Modals */}
      <Modal
        type={activeModal}
        isOpen={!!activeModal}
        onClose={() => setActiveModal(null)}
        onAddExercise={handleAddExercise}
        onUpdateExercise={handleUpdateExercise}
        onAddGoal={handleAddGoal}
        coachTip={coachTip}
        isLoadingTip={isLoadingTip}
        userProfile={userProfile}
        onUpdateProfile={setUserProfile}
        selectedExercise={selectedExercise}
      />

      {/* Export Format Modal */}
      {showExportModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-background-dark border-2 border-primary shadow-[0_0_30px_rgba(0,240,255,0.3)] w-full max-w-md animate-slideUp">
            {/* Header */}
            <div className="bg-primary px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-black text-2xl">download</span>
                <h3 className="text-black font-bold text-lg uppercase tracking-wider">Exportar Relatório</h3>
              </div>
              <button
                onClick={() => setShowExportModal(false)}
                className="text-black hover:bg-black/10 p-1 transition-colors"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            {/* Content */}
            <div className="p-6">
              <p className="text-text-muted font-mono text-sm mb-6">
                Escolha o formato do arquivo para exportação dos seus dados de treino:
              </p>

              <div className="flex flex-col gap-3">
                {/* CSV Option */}
                <button
                  onClick={exportToCSV}
                  className="group bg-surface-dark border border-border-dark hover:border-primary p-4 flex items-center gap-4 transition-all hover:bg-surface-dark/80"
                >
                  <div className="size-12 bg-primary/10 border border-primary/30 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                    <span className="material-symbols-outlined text-primary text-2xl">table_chart</span>
                  </div>
                  <div className="flex-1 text-left">
                    <h4 className="text-white font-bold text-sm uppercase tracking-wide mb-1">Exportar CSV</h4>
                    <p className="text-text-muted font-mono text-xs">
                      Formato de planilha compatível com Excel e Google Sheets
                    </p>
                  </div>
                  <span className="material-symbols-outlined text-text-muted group-hover:text-primary transition-colors">
                    arrow_forward
                  </span>
                </button>

                {/* PDF Option */}
                <button
                  onClick={exportToPDF}
                  className="group bg-surface-dark border border-border-dark hover:border-primary p-4 flex items-center gap-4 transition-all hover:bg-surface-dark/80"
                >
                  <div className="size-12 bg-primary/10 border border-primary/30 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                    <span className="material-symbols-outlined text-primary text-2xl">picture_as_pdf</span>
                  </div>
                  <div className="flex-1 text-left">
                    <h4 className="text-white font-bold text-sm uppercase tracking-wide mb-1">Exportar PDF</h4>
                    <p className="text-text-muted font-mono text-xs">
                      Documento formatado pronto para impressão
                    </p>
                  </div>
                  <span className="material-symbols-outlined text-text-muted group-hover:text-primary transition-colors">
                    arrow_forward
                  </span>
                </button>
              </div>

              {/* Cancel Button */}
              <button
                onClick={() => setShowExportModal(false)}
                className="w-full mt-6 px-4 py-3 border border-border-dark text-text-muted hover:border-primary hover:text-primary font-mono text-xs uppercase transition-all"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
