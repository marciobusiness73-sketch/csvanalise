import React from 'react';
import type { Insight, AppStatus } from '../types';

interface InsightPanelProps {
  status: AppStatus;
  insights: Insight[];
  error: string | null;
}

const WelcomeState: React.FC = () => (
  <div className="text-center p-8">
    <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-blue-100">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
    </div>
    <h3 className="mt-4 text-lg font-medium text-gray-900">Pronto para os Insights?</h3>
    <p className="mt-1 text-sm text-gray-500">
      Envie seus arquivos CSV e clique em "Analisar" para começar.
    </p>
  </div>
);

const LoadingState: React.FC = () => (
  <div className="space-y-6">
    {[...Array(2)].map((_, i) => (
      <div key={i} className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 animate-pulse">
        <div className="h-5 bg-gray-200 rounded w-1/3 mb-6"></div>
        <div className="space-y-4">
          <div className="h-4 bg-gray-200 rounded w-full"></div>
          <div className="h-4 bg-gray-200 rounded w-5/6"></div>
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
        </div>
      </div>
    ))}
  </div>
);


const ErrorState: React.FC<{ error: string }> = ({ error }) => (
    <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-md">
        <div className="flex">
            <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
            </div>
            <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Análise Falhou</h3>
                <div className="mt-2 text-sm text-red-700">
                    <p>{error}</p>
                </div>
            </div>
        </div>
    </div>
);


const InsightCard: React.FC<{ insight: Insight }> = ({ insight }) => (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 transform hover:scale-[1.02] hover:shadow-lg transition-all duration-300">
        <h3 className="text-lg font-semibold text-gray-900 truncate mb-4">{insight.fileName}</h3>

        <div>
            <h4 className="text-sm font-semibold text-blue-600 mb-2">Sugestões de Análise</h4>
            <ul className="list-disc list-inside space-y-2 text-sm text-gray-600">
                {insight.suggestions.map((suggestion, i) => <li key={i}>{suggestion}</li>)}
            </ul>
        </div>

        <div className="mt-6">
            <h4 className="text-sm font-semibold text-amber-600 mb-2">Etapas de Limpeza de Dados</h4>
            <ul className="list-disc list-inside space-y-2 text-sm text-gray-600">
                {insight.cleaningSteps.map((step, i) => <li key={i}>{step}</li>)}
            </ul>
        </div>
    </div>
);


export const InsightPanel: React.FC<InsightPanelProps> = ({ status, insights, error }) => {
  const renderContent = () => {
    switch (status) {
      case 'idle':
      case 'files_selected':
        return <WelcomeState />;
      case 'loading':
      case 'parsing_complete':
        return <LoadingState />;
      case 'analysis_complete':
        if (insights.length === 0) {
            return <div className="text-center p-8"><p className="text-gray-500">Nenhum insight foi gerado. Tente arquivos diferentes.</p></div>;
        }
        return (
            <div className="space-y-6">
                <h2 className="text-2xl font-bold text-gray-800">Insights da Análise</h2>
                {insights.map((insight, index) => <InsightCard key={index} insight={insight} />)}
            </div>
        );
      case 'error':
        return <ErrorState error={error || "Ocorreu um erro desconhecido."} />;
      default:
        return <WelcomeState />;
    }
  };

  return <div className="bg-gray-100 p-6 rounded-2xl min-h-[300px]">{renderContent()}</div>;
};