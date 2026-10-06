const { GoogleGenAI } = require('@google/genai');

async function analisarConfortoTermico(temperatura, umidade) {
  console.log('[IA] Iniciando chamada para o Gemini...');

  if (!process.env.GEMINI_API_KEY) {
    console.error('[IA ERRO] GEMINI_API_KEY não encontrada no .env');
    return 'Análise de IA indisponível: Chave de API não configurada.';
  }

  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

  const prompt = `
  Você é um especialista em climatização e ambientes inteligentes.
  Analise os dados climáticos atuais do nosso ambiente:
  - Temperatura: ${temperatura}°C
  - Umidade: ${umidade}%

  Baseado na norma de conforto térmico (NR 17), retorne um breve relatório em texto simples com:
  1. Avaliação do conforto térmico atual.
  2. Possíveis riscos (ex: mofo se umidade alta, ressecamento se baixa).
  3. Recomendação de automação (Ligar Ar condicionado ou Umidificador).
  Não use formatação Markdown.
  `;

  const totalTentativas = 3;

  for (let tentativa = 1; tentativa <= totalTentativas; tentativa++) {
    try {
      console.log(`[IA] Tentativa ${tentativa} de ${totalTentativas} com o modelo gemini-2.5-flash...`);
      
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
      });

      console.log('[IA] Resposta recebida do Gemini com sucesso!');
      return response.text;

    } catch (error) {
      console.error(`[IA ERRO na tentativa ${tentativa}]:`, error.message || error);

      if (tentativa < totalTentativas) {
        console.log('[IA] Aguardando 2 segundos para tentar novamente...');
        await new Promise((resolve) => setTimeout(resolve, 2000));
      }
    }
  }

  // Contingência caso a API do Google permaneça instável em todas as tentativas
  return `Laudo Climatológico (Modo de Contingência)\n\n` +
         `Dados medidos no ambiente:\n` +
         `- Temperatura: ${temperatura}°C\n` +
         `- Umidade: ${umidade}%\n\n` +
         `Nota: A análise detalhada da IA esteve temporariamente indisponível devido a instabilidade momentânea na API do Google.`;
}

module.exports = { analisarConfortoTermico };