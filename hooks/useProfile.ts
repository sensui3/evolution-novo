
import { useState, useCallback } from 'react';
import { UserProfile } from '../types';
import { databaseService } from '../services/databaseService';

export const useProfile = (userId: string) => {
    const [userProfile, setUserProfile] = useState<UserProfile>({
        name: 'Atleta Evolution',
        weight: 85,
        level: 'Intermediário',
        photo: null
    });
    const [isProfileLoading, setIsProfileLoading] = useState(false);

    const loadProfile = useCallback(async (userName?: string, userImage?: string) => {
        if (!userId) return;
        setIsProfileLoading(true);
        try {
            const dbProfile = await databaseService.getUserProfile(userId);
            if (dbProfile) {
                setUserProfile(dbProfile);
            } else if (userName) {
                setUserProfile(prev => ({
                    ...prev,
                    name: userName,
                    photo: userImage || prev.photo
                }));
            }
        } catch (error) {
            console.error("Erro ao carregar perfil:", error);
        } finally {
            setIsProfileLoading(false);
        }
    }, [userId]);

    const updateProfile = async (profile: UserProfile) => {
        if (userId) {
            try {
                await databaseService.updateUserProfile(userId, profile);
            } catch (e) {
                console.error("Erro ao atualizar perfil:", e);
                throw e;
            }
        }
        setUserProfile(profile);
    };

    return {
        userProfile,
        isProfileLoading,
        loadProfile,
        updateProfile
    };
};
