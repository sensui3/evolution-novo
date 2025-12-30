
import React, { useState, useEffect } from 'react';
import { UserProfile } from '../../../types';
import { useCamera } from '../../../hooks/useCamera';

interface ProfileModalProps {
    isOpen: boolean;
    onClose: () => void;
    userProfile: UserProfile;
    onUpdateProfile: (profile: UserProfile) => void;
}

const ProfileModal: React.FC<ProfileModalProps> = ({
    isOpen, onClose, userProfile, onUpdateProfile
}) => {
    const {
        cameraActive,
        videoRef,
        capturedPhoto,
        setCapturedPhoto,
        startCamera,
        stopCamera,
        capturePhoto
    } = useCamera();

    const [formData, setFormData] = useState({
        name: userProfile.name,
        weight: userProfile.weight,
        level: userProfile.level
    });

    useEffect(() => {
        if (isOpen) {
            setFormData({
                name: userProfile.name,
                weight: userProfile.weight,
                level: userProfile.level
            });
            setCapturedPhoto(userProfile.photo);
        }
    }, [isOpen, userProfile, setCapturedPhoto]);

    if (!isOpen) return null;

    const handleSave = (e: React.FormEvent) => {
        e.preventDefault();
        onUpdateProfile({
            ...formData,
            photo: capturedPhoto
        });
        onClose();
    };

    const handleClose = () => {
        stopCamera();
        onClose();
    };

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-background/80 backdrop-blur-md p-4">
            <div className="bg-surface border border-border w-full max-w-xl shadow-2xl relative animate-in fade-in zoom-in duration-300">
                <div className="p-6 md:p-8 border-b border-border bg-black/5 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="size-10 bg-primary/20 rounded-full flex items-center justify-center">
                            <span className="material-symbols-outlined text-primary">person</span>
                        </div>
                        <div>
                            <h2 className="text-2xl font-black uppercase text-text-main tracking-tighter">
                                Perfil do Atleta
                            </h2>
                            <p className="text-[10px] font-mono text-text-muted uppercase tracking-[0.2em] mt-1">Sincronização de biometria facial</p>
                        </div>
                    </div>
                    <button
                        onClick={handleClose}
                        className="size-10 flex items-center justify-center text-text-muted hover:text-red-500 hover:bg-red-500/10 transition-all rounded-full"
                    >
                        <span className="material-symbols-outlined">close</span>
                    </button>
                </div>

                <div className="p-6 md:p-10">
                    <div className="mb-10 flex flex-col items-center">
                        <div className="relative size-48 md:size-56 border-2 border-dashed border-primary/20 bg-black/10 overflow-hidden flex items-center justify-center shadow-inner group transition-all">
                            {cameraActive ? (
                                <video
                                    ref={videoRef}
                                    autoPlay
                                    playsInline
                                    className="w-full h-full object-cover grayscale brightness-110 contrast-125 transition-all"
                                />
                            ) : capturedPhoto ? (
                                <img src={capturedPhoto} alt="Captured" className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-500" />
                            ) : (
                                <div className="text-center p-6">
                                    <span className="material-symbols-outlined text-text-muted text-5xl mb-3 opacity-20">no_photography</span>
                                    <p className="text-[9px] font-mono text-text-muted uppercase tracking-widest leading-relaxed">Biometria Pendente<br />Ative o dispositivo</p>
                                </div>
                            )}

                            <div className="absolute inset-4 pointer-events-none">
                                <div className="absolute top-0 left-0 w-6 h-6 border-t-2 border-l-2 border-primary/60"></div>
                                <div className="absolute top-0 right-0 w-6 h-6 border-t-2 border-r-2 border-primary/60"></div>
                                <div className="absolute bottom-0 left-0 w-6 h-6 border-b-2 border-l-2 border-primary/60"></div>
                                <div className="absolute bottom-0 right-0 w-6 h-6 border-b-2 border-r-2 border-primary/60"></div>
                            </div>

                            {cameraActive && (
                                <div className="absolute inset-0 bg-primary/5 flex items-center justify-center">
                                    <div className="w-full h-[1px] bg-primary/40 animate-[scan_2s_linear_infinite] shadow-[0_0_15px_rgba(0,240,255,0.5)]"></div>
                                </div>
                            )}
                        </div>

                        <div className="mt-6">
                            {!cameraActive ? (
                                <button
                                    onClick={startCamera}
                                    className="flex items-center gap-2 text-[10px] font-black font-mono uppercase bg-primary text-black px-6 py-2 shadow-glow hover:scale-105 active:scale-95 transition-all"
                                >
                                    <span className="material-symbols-outlined text-sm">videocam</span>
                                    {capturedPhoto ? 'Recapturar Biometria' : 'Ativar Dispositivo'}
                                </button>
                            ) : (
                                <button
                                    onClick={capturePhoto}
                                    className="flex items-center gap-2 text-[10px] font-black font-mono uppercase bg-red-600 text-white px-8 py-2 shadow-[0_0_20px_rgba(220,38,38,0.4)] animate-pulse hover:scale-105 active:scale-95 transition-all"
                                >
                                    <span className="material-symbols-outlined text-sm">sensors</span>
                                    Interceptar Quadro
                                </button>
                            )}
                        </div>
                    </div>

                    <form onSubmit={handleSave} className="space-y-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-mono text-text-muted uppercase tracking-[0.2em] font-bold">Identificação Civil</label>
                                <input
                                    required
                                    className="w-full bg-black/10 border border-border p-4 text-text-main font-mono text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value.toUpperCase() })}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-mono text-text-muted uppercase tracking-[0.2em] font-bold">Protocolo de Treino</label>
                                <select
                                    className="w-full bg-black/10 border border-border p-4 text-text-main font-mono text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all appearance-none cursor-pointer"
                                    value={formData.level}
                                    onChange={e => setFormData({ ...formData, level: e.target.value })}
                                >
                                    <option value="Iniciante">RECRUTA (INICIANTE)</option>
                                    <option value="Intermediário">OPERACIONAL (INTERMEDIÁRIO)</option>
                                    <option value="Avançado">VETERANO (AVANÇADO)</option>
                                    <option value="Elite">ELITE (NÍVEL ESPECIAL)</option>
                                </select>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-mono text-text-muted uppercase tracking-[0.2em] font-bold">Massa Corporal (kg)</label>
                            <div className="relative">
                                <input
                                    type="number"
                                    className="w-full bg-black/10 border border-border p-4 text-text-main font-mono text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                                    value={formData.weight}
                                    onChange={e => setFormData({ ...formData, weight: parseFloat(e.target.value) })}
                                />
                                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-mono text-text-muted uppercase">KG</span>
                            </div>
                        </div>

                        <div className="flex gap-4 pt-4">
                            <button
                                type="button"
                                onClick={handleClose}
                                className="flex-1 py-4 border border-border text-text-muted font-bold font-mono text-xs uppercase hover:bg-black/5 hover:text-text-main transition-all"
                            >
                                Cancelar
                            </button>
                            <button
                                type="submit"
                                className="flex-[2] py-4 bg-primary text-black font-black font-mono text-xs uppercase tracking-[0.2em] shadow-glow hover:bg-cyan-400 hover:scale-[1.02] active:scale-[0.98] transition-all"
                            >
                                Atualizar Credenciais
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default ProfileModal;
