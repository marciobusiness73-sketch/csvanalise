import { GoogleGenAI, Type } from "@google/genai";
import type { ParsedCsv, Insight } from '../types';

if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const insightSchema = {
    type: Type.OBJECT,
    properties: {
        fileName: { type: Type.STRING },
        suggestions: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: "De 3 a 5 sugestões de análise acionáveis ou perguntas de negócio."
        },
        cleaningSteps: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: "Etapas potenciais de limpeza de dados (ex: tratar valores ausentes, corrigir formatos)."
        }
    },
    required: ["fileName", "suggestions", "cleaningSteps"]
};

export const generateInsights = async (parsedData: ParsedCsv[]): Promise<Insight[]> => {
    const fileSummaries = parsedData.map(file => ({
        fileName: file.fileName,
        headers: file.headers,
        sampleData: file.sampleRows.slice(0, 3) 
    }));

    const prompt = `
        Você é um especialista em análise de dados. Eu carreguei vários arquivos CSV do meu sistema de negócios.
        Para cada resumo de arquivo fornecido abaixo, por favor, gere insights acionáveis.

        Para cada arquivo:
        1. Forneça de 3 a 5 sugestões de análise específicas e perspicazes ou perguntas de negócio que podem ser respondidas usando os dados. Formule-as como se estivesse aconselhando um gerente de negócios.
        2. Sugira etapas potenciais de limpeza de dados que possam ser necessárias antes da análise.

        Aqui estão os resumos dos arquivos:
        ${JSON.stringify(fileSummaries, null, 2)}

        Retorne sua resposta como um array JSON, com um objeto para cada arquivo, aderindo ao schema fornecido.
    `;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-pro",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.ARRAY,
                    items: insightSchema,
                },
            },
        });

        const jsonText = response.text.trim();
        const insights: Insight[] = JSON.parse(jsonText);
        return insights;

    } catch (error) {
        console.error("Error calling Gemini API:", error);
        throw new Error("Falha ao gerar insights. O modelo de IA pode estar sobrecarregado ou o formato dos dados é inesperado.");
    }
};