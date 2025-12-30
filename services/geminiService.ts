
import { Exercise } from "../types";

/**
 * Serviço de coaching local - substitui a necessidade de API externa (Gemini).
 * Fornece diretrizes baseadas em heurísticas simples dos dados do atleta.
 */

export const getCoachingTips = async (exercises: Exercise[]): Promise<string> => {
  // Simula um pequeno delay para manter a experiência premium de "processamento"
  await new Promise(resolve => setTimeout(resolve, 800));

  if (exercises.length === 0) {
    return "Inicie seus registros para que eu possa analisar sua performance biomecânica.";
  }

  // Heurística simples: Pega o exercício com menor progresso
  const sortedByProgress = [...exercises].sort((a, b) => a.progress - b.progress);
  const focusEx = sortedByProgress[0];

  if (focusEx.progress < 60) {
    return `Foco total no ${focusEx.name}. Sua eficiência de ${focusEx.progress}% indica que precisamos ajustar a cadência antes de subir a carga.`;
  }

  // Se todos estão bem, foca no recorde mais pesado
  const strongest = [...exercises].sort((a, b) => b.pbWeight - a.pbWeight)[0];
  return `Performance sólida no ${strongest.name}. Continue explorando a sobrecarga progressiva nos microciclos de força.`;
};

export const getDeepAnalysis = async (exercises: Exercise[]): Promise<string> => {
  // Simula um delay para análise profunda
  await new Promise(resolve => setTimeout(resolve, 1200));

  if (exercises.length === 0) {
    return "Sem dados suficientes para gerar um relatório técnico de tendências.";
  }

  const avgProgress = exercises.reduce((acc, ex) => acc + ex.progress, 0) / exercises.length;
  const totalVolume = exercises.reduce((acc, ex) => acc + ex.avgVolume, 0);
  
  let analysis = `Baseado em ${exercises.length} exercícios chave, sua eficiência média está em ${avgProgress.toFixed(1)}%. `;

  if (avgProgress > 85) {
    analysis += "Identificamos uma fase de pico de performance. Momento ideal para testar novos RPs em exercícios compostos.";
  } else if (avgProgress > 70) {
    analysis += "Sua progressão está linear e saudável. O volume total de " + totalVolume.toFixed(1) + "k indica boa capacidade de recuperação.";
  } else {
    analysis += "Os dados mostram um possível platô. Considere reduzir o volume e focar na qualidade técnica para reestabelecer a progressão.";
  }

  return analysis;
};
