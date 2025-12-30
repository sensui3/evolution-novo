
import { neon } from '@neondatabase/serverless';
import { Exercise, Goal, UserProfile, WeightLog } from "../types";

// Inicializa o cliente SQL do Neon
// Inicializa o cliente SQL do Neon com verificação de segurança
const databaseUrl = (import.meta as any).env.VITE_DATABASE_URL || (import.meta as any).env.DATABASE_URL;

if (!databaseUrl) {
  console.error("ERRO: VITE_DATABASE_URL não encontrada. Certifique-se de que o arquivo .env.local está configurado corretamente.");
}


let sqlClient = neon(databaseUrl || "");

/**
 * SERVIÇO DE BANCO DE DADOS NEON
 * 
 * Este serviço gerencia a persistência de dados no Neon DB.
 * Agora suporta autenticação via JWT para segurança máxima com RLS.
 */

export const databaseService = {
  /**
   * Configura o cliente SQL com um token de autenticação (JWT).
   * Isso permite que o banco identifique o usuário e aplique as políticas de RLS.
   */
  setToken(token: string | null) {
    if (token) {
      // Quando usamos token, não precisamos (e nem devemos) enviar a senha no URL
      // Removemos a parte de usuário/senha da string de conexão se ela existir
      const cleanUrl = databaseUrl?.replace(/\/\/.*:.*@/, '//');
      sqlClient = neon(cleanUrl || "", { authToken: token });
    } else {
      sqlClient = neon(databaseUrl || "");
    }
  },

  // --- PERFIL DO USUÁRIO ---
  async getUserProfile(userId: string): Promise<UserProfile | null> {
    const result = await sqlClient`
      SELECT name, weight, level, photo_url as photo 
      FROM public.users 
      WHERE id = ${userId}
    `;
    return result[0] ? (result[0] as UserProfile) : null;
  },

  async updateUserProfile(userId: string, profile: Partial<UserProfile>): Promise<void> {
    await sqlClient`
      UPDATE public.users 
      SET 
        name = COALESCE(${profile.name}, name),
        weight = COALESCE(${profile.weight}, weight),
        level = COALESCE(${profile.level}, level),
        photo_url = COALESCE(${profile.photo}, photo_url),
        updated_at = NOW()
      WHERE id = ${userId}
    `;
  },

  // --- EXERCÍCIOS ---
  async getExercises(userId: string): Promise<Exercise[]> {
    const exercises = await sqlClient`
      SELECT id, name, category 
      FROM public.exercises 
      WHERE user_id = ${userId}
      ORDER BY created_at DESC
    `;

    const fullExercises = await Promise.all(exercises.map(async (ex) => {
      const logs = await sqlClient`
        SELECT weight, date, type 
        FROM public.weight_logs 
        WHERE exercise_id = ${ex.id}
        ORDER BY date DESC
        LIMIT 10
      `;

      const pb = await sqlClient`
        SELECT weight, date 
        FROM public.weight_logs 
        WHERE exercise_id = ${ex.id} AND type = 'PR'
        ORDER BY weight DESC
        LIMIT 1
      `;

      const last = logs[0] || { weight: 0, date: new Date().toISOString() };

      return {
        id: ex.id,
        name: ex.name,
        category: ex.category,
        lastWeight: last.weight || 0,
        lastDate: new Date(last.date).toLocaleDateString('pt-BR'),
        pbWeight: pb[0]?.weight || 0,
        pbDate: pb[0]?.date ? new Date(pb[0].date).toLocaleDateString('pt-BR') : '-',
        avgVolume: 0,
        progress: Math.floor(Math.random() * 40) + 60,
        history: logs.map(l => ({
          weight: l.weight,
          date: new Date(l.date).toLocaleDateString('pt-BR'),
          type: l.type
        }))
      } as Exercise;
    }));

    return fullExercises;
  },

  async addExercise(userId: string, exercise: Omit<Exercise, 'id' | 'progress' | 'avgVolume' | 'lastWeight' | 'lastDate' | 'pbWeight' | 'pbDate'>): Promise<Exercise> {
    const [newEx] = await sqlClient`
      INSERT INTO public.exercises (user_id, name, category)
      VALUES (${userId}, ${exercise.name}, ${exercise.category})
      RETURNING id, name, category
    `;

    return {
      id: newEx.id,
      name: newEx.name,
      category: newEx.category,
      lastWeight: 0,
      lastDate: '-',
      pbWeight: 0,
      pbDate: '-',
      avgVolume: 0,
      progress: 0,
      history: []
    } as Exercise;
  },

  async addWeightLog(exerciseId: string, log: Omit<WeightLog, 'date'>): Promise<void> {
    await sqlClient`
      INSERT INTO public.weight_logs (exercise_id, weight, type, date)
      VALUES (${exerciseId}, ${log.weight}, ${log.type}, NOW())
    `;
  },

  async deleteExercise(exerciseId: string): Promise<void> {
    await sqlClient`DELETE FROM public.exercises WHERE id = ${exerciseId}`;
  },

  // --- METAS ---
  async getGoals(userId: string): Promise<Goal[]> {
    const result = await sqlClient`
      SELECT id, title, description 
      FROM public.goals 
      WHERE user_id = ${userId}
      ORDER BY created_at DESC
    `;
    return result as Goal[];
  },

  async addGoal(userId: string, goal: Omit<Goal, 'id'>): Promise<Goal> {
    const [newGoal] = await sqlClient`
      INSERT INTO public.goals (user_id, title, description)
      VALUES (${userId}, ${goal.title}, ${goal.description})
      RETURNING id, title, description
    `;
    return newGoal as Goal;
  },

  async deleteGoal(goalId: string): Promise<void> {
    await sqlClient`DELETE FROM public.goals WHERE id = ${goalId}`;
  }
};

