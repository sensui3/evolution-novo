
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
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <div className="bg-surface-dark border-2 border-primary w-full max-w-lg shadow-[8px_8px_0px_0px_#000] relative animate-in fade-in zoom-in duration-200">
                <button onClick={handleClose} className="absolute top-4 right-4 text-text-muted hover:text-white z-10">
                    <span className="material-symbols-outlined">close</span>
                </button>
                <div className="p-8">
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
                                    onClick={startCamera}
                                    className="text-[10px] font-mono uppercase bg-primary/10 border border-primary/40 text-primary px-4 py-1.5 hover:bg-primary hover:text-black transition-all"
                                >
                                    {capturedPhoto ? 'Retrair Biometria' : 'Ativar Scanner'}
                                </button>
                            ) : (
                                <button
                                    onClick={capturePhoto}
                                    className="text-[10px] font-mono uppercase bg-primary text-black font-bold px-4 py-1.5 shadow-glow"
                                >
                                    Capturar ID
                                </button>
                            )}
                        </div>
                    </div>

                    <form onSubmit={handleSave} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-[9px] font-mono text-text-muted uppercase mb-1 tracking-widest font-bold">Nome do Atleta</label>
                                <input
                                    required
                                    className="w-full bg-black/40 border border-border-dark p-3 text-white font-mono text-sm focus:border-primary outline-none"
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-[9px] font-mono text-text-muted uppercase mb-1 tracking-widest font-bold">Nível de Experiência</label>
                                <select
                                    className="w-full bg-black/40 border border-border-dark p-3 text-white font-mono text-sm focus:border-primary outline-none"
                                    value={formData.level}
                                    onChange={e => setFormData({ ...formData, level: e.target.value })}
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
                                value={formData.weight}
                                onChange={e => setFormData({ ...formData, weight: parseFloat(e.target.value) })}
                            />
                        </div>
                        <button
                            type="submit"
                            className="w-full mt-4 bg-primary text-black font-bold py-3 uppercase tracking-widest shadow-brutal-sm hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all"
                        >
                            Atualizar Credenciais
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default ProfileModal;
