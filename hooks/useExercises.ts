
import { useState, useCallback } from 'react';
import { Exercise, Goal, WeightLog } from '../types';
import { databaseService } from '../services/databaseService';
import { INITIAL_EXERCISES } from '../constants';

export const useExercises = (userId?: string) => {
    const [exercises, setExercises] = useState<Exercise[]>(INITIAL_EXERCISES);
    const [goals, setGoals] = useState<Goal[]>([]);
    const [isDataLoading, setIsDataLoading] = useState(false);
    const [dataError, setDataError] = useState<string | null>(null);

    const loadUserData = useCallback(async () => {
        if (!userId) return;
        setIsDataLoading(true);
        setDataError(null);
        try {
            const dbExercises = await databaseService.getExercises(userId);
            setExercises(dbExercises);

            const dbGoals = await databaseService.getGoals(userId);
            setGoals(dbGoals);
        } catch (error: any) {
            console.error("Erro ao carregar dados do Neon:", error);
            setDataError("Falha na conexão com o banco de dados.");
        } finally {
            setIsDataLoading(false);
        }
    }, [userId]);

    const addExercise = async (newEx: Omit<Exercise, 'id' | 'progress'>) => {
        if (!userId) {
            const ex: Exercise = {
                ...newEx,
                id: Math.random().toString(36).substr(2, 9),
                progress: 60,
                history: [],
                avgVolume: 0,
                lastWeight: 0,
                lastDate: '-',
                pbWeight: 0,
                pbDate: '-'
            };
            setExercises(prev => [...prev, ex]);
            return;
        }

        try {
            const ex = await databaseService.addExercise(userId, newEx as any);
            setExercises(prev => [ex, ...prev]);
        } catch (e: any) {
            console.error("Erro ao adicionar exercício:", e);
            throw e;
        }
    };

    const updateExercise = async (exerciseId: string, currentExercise: Exercise, updatedData: Omit<Exercise, 'id' | 'progress' | 'history'>) => {
        if (userId) {
            try {
                if (updatedData.lastWeight !== currentExercise.lastWeight) {
                    await databaseService.addWeightLog(exerciseId, {
                        weight: updatedData.lastWeight,
                        type: 'LOAD'
                    });
                }
                if (updatedData.pbWeight !== currentExercise.pbWeight) {
                    await databaseService.addWeightLog(exerciseId, {
                        weight: updatedData.pbWeight,
                        type: 'PR'
                    });
                }
                await loadUserData();
            } catch (e) {
                console.error(e);
                throw e;
            }
        } else {
            setExercises(prev => prev.map(ex => {
                if (ex.id === exerciseId) {
                    const newHistory: WeightLog[] = [...(ex.history || [])];
                    if (updatedData.lastWeight !== ex.lastWeight) {
                        newHistory.unshift({ weight: ex.lastWeight, date: ex.lastDate, type: 'LOAD' });
                    }
                    if (updatedData.pbWeight !== ex.pbWeight) {
                        newHistory.unshift({ weight: ex.pbWeight, date: ex.pbDate, type: 'PR' });
                    }
                    return { ...ex, ...updatedData, history: newHistory.slice(0, 3) };
                }
                return ex;
            }));
        }
    };

    const deleteExercise = async (id: string) => {
        if (userId) {
            try {
                await databaseService.deleteExercise(id);
                setExercises(prev => prev.filter(ex => ex.id !== id));
            } catch (e) {
                console.error(e);
                throw e;
            }
        } else {
            setExercises(prev => prev.filter(ex => ex.id !== id));
        }
    };

    const addGoal = async (newGoal: Omit<Goal, 'id'>) => {
        if (userId) {
            try {
                const goal = await databaseService.addGoal(userId, newGoal);
                setGoals(prev => [goal, ...prev]);
            } catch (e) {
                console.error(e);
                throw e;
            }
        } else {
            const goal: Goal = {
                ...newGoal,
                id: Math.random().toString(36).substr(2, 9),
            };
            setGoals(prev => [...prev, goal]);
        }
    };

    const deleteGoal = async (id: string) => {
        if (userId) {
            try {
                await databaseService.deleteGoal(id);
                setGoals(prev => prev.filter(g => g.id !== id));
            } catch (e) {
                console.error(e);
                throw e;
            }
        } else {
            setGoals(prev => prev.filter(g => g.id !== id));
        }
    };

    return {
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
    };
};
