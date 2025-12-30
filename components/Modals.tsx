
import React, { useState, useRef, useEffect } from 'react';
import { ModalType, Exercise, Goal, UserProfile } from '../types';

interface ModalProps {
  type: ModalType;
  isOpen: boolean;
  onClose: () => void;
  onAddExercise: (ex: Omit<Exercise, 'id' | 'progress'>) => void;
  onUpdateExercise?: (ex: Omit<Exercise, 'id' | 'progress' | 'history'>) => void;
  onAddGoal: (goal: Omit<Goal, 'id'>) => void;
  coachTip?: string;
  isLoadingTip?: boolean;
  userProfile?: UserProfile;
  onUpdateProfile?: (profile: UserProfile) => void;
  selectedExercise?: Exercise | null;
}

const Modal: React.FC<ModalProps> = ({ 
  type, isOpen, onClose, onAddExercise, onUpdateExercise, onAddGoal, coachTip, isLoadingTip, userProfile, onUpdateProfile, selectedExercise 
}) => {
  if (!isOpen) return null;

  const [formData, setFormData] = useState({
    name: '',
    category: '',
    weight: 0,
    pb: 0,
    volume: 0,
    goalTitle: '',
    goalDesc: '',
    profileName: userProfile?.name || '',
    profileWeight: userProfile?.weight || 0,
    profileLevel: userProfile?.level || 'Iniciante'
  });

  useEffect(() => {
    if (type === 'EDIT_EXERCISE' && selectedExercise) {
      setFormData(prev => ({
        ...prev,
        name: selectedExercise.name,
        category: selectedExercise.category,
        weight: selectedExercise.lastWeight,
        pb: selectedExercise.pbWeight,
        volume: selectedExercise.avgVolume
      }));
    } else if (type === 'ADD_EXERCISE') {
      setFormData(prev => ({
        ...prev,
        name: '', category: '', weight: 0, pb: 0, volume: 0
      }));
    }
  }, [type, selectedExercise]);

  const [cameraActive, setCameraActive] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(userProfile?.photo || null);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (type === 'PROFILE' && cameraActive && videoRef.current) {
      navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } })
        .then(s => {
          setStream(s);
          if (videoRef.current) videoRef.current.srcObject = s;
        })
        .catch(err => console.error("Erro ao acessar câmera:", err));
    }
    return () => {
      if (stream) stream.getTracks().forEach(track => track.stop());
    };
  }, [cameraActive, type]);

  const handleCapture = () => {
    if (videoRef.current) {
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      const ctx = canvas.getContext('2d');
      ctx?.drawImage(videoRef.current, 0, 0);
      const photo = canvas.toDataURL('image/png');
      setCapturedPhoto(photo);
      setCameraActive(false);
      if (stream) stream.getTracks().forEach(track => track.stop());
    }
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (onUpdateProfile) {
      onUpdateProfile({
        name: formData.profileName,
        weight: formData.profileWeight,
        level: formData.profileLevel,
        photo: capturedPhoto
      });
    }
    onClose();
  };

  const handleExerciseSubmit = (e: React.FormEvent) => {
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

    if (type === 'EDIT_EXERCISE' && onUpdateExercise) {
      onUpdateExercise(data);
    } else {
      onAddExercise(data);
    }
    onClose();
  };

  const handleAddGoal = (e: React.FormEvent) => {
    e.preventDefault();
    onAddGoal({
      title: formData.goalTitle,
      description: formData.goalDesc,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-surface-dark border-2 border-primary w-full max-w-lg shadow-[8px_8px_0px_0px_#000] relative animate-in fade-in zoom-in duration-200">
        <button 
          onClick={() => {
            if (stream) stream.getTracks().forEach(track => track.stop());
            onClose();
          }}
          className="absolute top-4 right-4 text-text-muted hover:text-white z-10"
        >
          <span className="material-symbols-outlined">close</span>
        </button>

        <div className="p-8">
          {type === 'PROFILE' && (
            <>
              <div className="flex items-center gap-3 mb-6">
                <span className="material-symbols-outlined text-primary">person</span>
                <h2 className="text-2xl font-bold uppercase text-white tracking-tight">Scanner do Atleta</h2>
              </div>
              
              <div className="mb-8 flex flex-col items-center">
                <div className="relative size-48 border-2 border-dashed border-primary/40 bg-black/20 overflow-hidden flex items-center justify-center">
                  {cameraActive ? (
                    <video 
                      ref={videoRef} 
                      autoPlay 
                      playsInline 
                      className="w-full h-full object-cover grayscale brightness-125"
                    />
                  ) : capturedPhoto ? (
                    <img src={capturedPhoto} alt="Captured" className="w-full h-full object-cover" />
                  ) : (
                    <div className="text-center p-4">
                      <span className="material-symbols-outlined text-text-muted text-4xl mb-2">no_photography</span>
                      <p className="text-[10px] font-mono text-text-muted uppercase">Nenhuma biometria detectada</p>
                    </div>
                  )}
                  
                  {/* Overlay de Scanner */}
                  <div className="absolute inset-0 border border-primary/20 pointer-events-none">
                    <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-primary"></div>
                    <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-primary"></div>
                    <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-primary"></div>
                    <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-primary"></div>
                    {cameraActive && <div className="absolute top-0 left-0 w-full h-1 bg-primary/30 animate-bounce"></div>}
                  </div>
                </div>
                
                <div className="mt-4 flex gap-3">
                  {!cameraActive ? (
                    <button 
                      onClick={() => setCameraActive(true)}
                      className="text-[10px] font-mono uppercase bg-primary/10 border border-primary/40 text-primary px-4 py-1.5 hover:bg-primary hover:text-black transition-all"
                    >
                      {capturedPhoto ? 'Retrair Biometria' : 'Ativar Scanner'}
                    </button>
                  ) : (
                    <button 
                      onClick={handleCapture}
                      className="text-[10px] font-mono uppercase bg-primary text-black font-bold px-4 py-1.5 shadow-glow"
                    >
                      Capturar ID
                    </button>
                  )}
                </div>
              </div>

              <form onSubmit={handleSaveProfile} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[9px] font-mono text-text-muted uppercase mb-1 tracking-widest font-bold">Nome do Atleta</label>
                    <input 
                      required
                      className="w-full bg-black/40 border border-border-dark p-3 text-white font-mono text-sm focus:border-primary outline-none"
                      value={formData.profileName}
                      onChange={e => setFormData({...formData, profileName: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-[9px] font-mono text-text-muted uppercase mb-1 tracking-widest font-bold">Nível de Experiência</label>
                    <select 
                      className="w-full bg-black/40 border border-border-dark p-3 text-white font-mono text-sm focus:border-primary outline-none"
                      value={formData.profileLevel}
                      onChange={e => setFormData({...formData, profileLevel: e.target.value})}
                    >
                      <option value="Iniciante">Iniciante</option>
                      <option value="Intermediário">Intermediário</option>
                      <option value="Avançado">Avançado</option>
                      <option value="Elite">Elite</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-[9px] font-mono text-text-muted uppercase mb-1 tracking-widest font-bold">Peso Corporal (kg)</label>
                  <input 
                    type="number"
                    className="w-full bg-black/40 border border-border-dark p-3 text-white font-mono text-sm focus:border-primary outline-none"
                    value={formData.profileWeight}
                    onChange={e => setFormData({...formData, profileWeight: parseFloat(e.target.value)})}
                  />
                </div>
                <button 
                  type="submit" 
                  className="w-full mt-4 bg-primary text-black font-bold py-3 uppercase tracking-widest shadow-brutal-sm hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all"
                >
                  Atualizar Credenciais
                </button>
              </form>
            </>
          )}

          {(type === 'ADD_EXERCISE' || type === 'EDIT_EXERCISE') && (
            <>
              <h2 className="text-2xl font-bold uppercase text-white mb-6 tracking-tight">
                {type === 'EDIT_EXERCISE' ? `Ajustar: ${selectedExercise?.name}` : 'Novo Exercício'}
              </h2>
              <form onSubmit={handleExerciseSubmit} className="flex flex-col gap-4">
                <div>
                  <label className="block text-xs font-mono text-text-muted uppercase mb-1">Nome</label>
                  <input 
                    required
                    className="w-full bg-black/40 border border-border-dark p-3 text-white font-mono focus:border-primary outline-none"
                    placeholder="ex: Desenvolvimento Militar"
                    value={formData.name}
                    onChange={e => setFormData({...formData, name: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-xs font-mono text-text-muted uppercase mb-1">Categoria</label>
                  <input 
                    required
                    className="w-full bg-black/40 border border-border-dark p-3 text-white font-mono focus:border-primary outline-none"
                    placeholder="ex: Ombros / Empurrar"
                    value={formData.category}
                    onChange={e => setFormData({...formData, category: e.target.value})}
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
                      onChange={e => setFormData({...formData, weight: parseFloat(e.target.value)})}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-mono text-text-muted uppercase mb-1">RP (kg)</label>
                    <input 
                      type="number"
                      required
                      className="w-full bg-black/40 border border-border-dark p-3 text-white font-mono focus:border-primary outline-none"
                      value={formData.pb || ''}
                      onChange={e => setFormData({...formData, pb: parseFloat(e.target.value)})}
                    />
                  </div>
                </div>
                <button type="submit" className="mt-4 bg-primary text-black font-bold py-3 uppercase tracking-widest shadow-brutal-sm hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all">
                  {type === 'EDIT_EXERCISE' ? 'Atualizar Performance' : 'Sincronizar Dados'}
                </button>
              </form>
            </>
          )}

          {type === 'ADD_GOAL' && (
            <>
              <h2 className="text-2xl font-bold uppercase text-white mb-6 tracking-tight">Definir Novo Marco</h2>
              <form onSubmit={handleAddGoal} className="flex flex-col gap-4">
                <div>
                  <label className="block text-xs font-mono text-text-muted uppercase mb-1">Título da Meta</label>
                  <input 
                    required
                    className="w-full bg-black/40 border border-border-dark p-3 text-white font-mono focus:border-primary outline-none"
                    placeholder="ex: Alcançar 200kg no Terra"
                    value={formData.goalTitle}
                    onChange={e => setFormData({...formData, goalTitle: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-xs font-mono text-text-muted uppercase mb-1">Descrição</label>
                  <textarea 
                    required
                    rows={3}
                    className="w-full bg-black/40 border border-border-dark p-3 text-white font-mono focus:border-primary outline-none resize-none"
                    placeholder="Descreva seu compromisso..."
                    value={formData.goalDesc}
                    onChange={e => setFormData({...formData, goalDesc: e.target.value})}
                  />
                </div>
                <button type="submit" className="mt-4 bg-primary text-black font-bold py-3 uppercase tracking-widest shadow-brutal-sm hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all">
                  Comprometer-se com a Evolução
                </button>
              </form>
            </>
          )}

          {type === 'COACH_TIPS' && (
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
          )}
        </div>
      </div>
    </div>
  );
};

export default Modal;
