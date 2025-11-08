import React, { useState, useCallback, useEffect } from 'react';
import { Header } from './components/Header';
import { FileUpload } from './components/FileUpload';
import { ActionButton } from './components/ActionButton';
import { InsightPanel } from './components/InsightPanel';
import type { AppState } from './types';
import { parseCsvFiles, exportData } from './utils/fileUtils';
import { generateInsights } from './services/geminiService';

const App: React.FC = () => {
  const [state, setState] = useState<AppState>({
    status: 'idle',
    files: [],
    parsedData: [],
    insights: [],
    error: null,
  });

  const [scriptsLoaded, setScriptsLoaded] = useState(false);

  useEffect(() => {
    const loadScript = (src: string): Promise<void> => {
      return new Promise((resolve, reject) => {
        // Determine the global variable name the script will expose
        const globalVar = src.includes('papaparse') ? 'Papa' : 'XLSX';
        // Check if the script is already available
        if (window[globalVar as keyof Window]) {
          return resolve();
        }
        
        const scriptElement = document.createElement('script');
        scriptElement.src = src;
        scriptElement.async = true;
        scriptElement.onload = () => resolve();
        scriptElement.onerror = () => reject(new Error(`Failed to load script: ${src}`));
        document.body.appendChild(scriptElement);
      });
    };

    const scriptsToLoad = [
      'https://cdn.jsdelivr.net/npm/papaparse@5.4.1/papaparse.min.js',
      'https://cdn.jsdelivr.net/npm/xlsx@0.18.5/dist/xlsx.full.min.js'
    ];

    Promise.all(scriptsToLoad.map(loadScript))
      .then(() => {
        setScriptsLoaded(true);
      })
      .catch(error => {
        console.error(error);
        setState(prev => ({ 
          ...prev, 
          status: 'error', 
          error: 'Falha ao carregar bibliotecas essenciais. Por favor, verifique sua conexão com a internet e recarregue a página.' 
        }));
      });

  }, []); // Empty dependency array ensures this runs only once on mount

  const handleFileChange = (selectedFiles: FileList | null) => {
    if (selectedFiles) {
      setState({
        status: 'files_selected',
        files: Array.from(selectedFiles),
        parsedData: [],
        insights: [],
        error: null,
      });
    }
  };

  const handleAnalyze = useCallback(async () => {
    if (state.files.length === 0 || !scriptsLoaded) return;

    setState(prev => ({ ...prev, status: 'loading', error: null }));

    try {
      const parsedCsvData = await parseCsvFiles(state.files);
      setState(prev => ({ ...prev, status: 'parsing_complete', parsedData: parsedCsvData }));
      
      const analysisInsights = await generateInsights(parsedCsvData);
      setState(prev => ({ ...prev, status: 'analysis_complete', insights: analysisInsights }));

    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Ocorreu um erro desconhecido durante a análise.';
      console.error(err);
      setState(prev => ({ ...prev, status: 'error', error: errorMessage }));
    }
  }, [state.files, scriptsLoaded]);

  const handleClear = () => {
    setState({
      status: 'idle',
      files: [],
      parsedData: [],
      insights: [],
      error: null,
    });
  };

  const handleExport = (format: 'json' | 'xlsx') => {
    if (!scriptsLoaded) return;
    exportData(state.parsedData, format);
  };

  const isLoading = state.status === 'loading' || state.status === 'parsing_complete';

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />
      <main className="flex-grow container mx-auto p-4 md:p-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          <div className="lg:col-span-4 xl:col-span-3">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 sticky top-8">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Painel de Controle</h2>
              <FileUpload onFileChange={handleFileChange} files={state.files} status={state.status} />
              
              <div className="mt-6 space-y-3">
                <ActionButton 
                  onClick={handleAnalyze} 
                  disabled={state.files.length === 0 || isLoading || !scriptsLoaded || state.status === 'error'}
                  isLoading={isLoading}
                  text={!scriptsLoaded ? "Carregando bibliotecas..." : "Analisar"}
                  loadingText="Analisando..."
                  variant="primary"
                />
                <div className="flex space-x-3">
                  <ActionButton 
                    onClick={handleClear} 
                    disabled={isLoading}
                    text="Limpar"
                    variant="secondary"
                    fullWidth={true}
                  />
                   <ActionButton 
                    onClick={() => handleExport('json')}
                    disabled={state.parsedData.length === 0 || isLoading || !scriptsLoaded}
                    text="Exportar JSON"
                    variant="secondary"
                    fullWidth={true}
                  />
                   <ActionButton 
                    onClick={() => handleExport('xlsx')}
                    disabled={state.parsedData.length === 0 || isLoading || !scriptsLoaded}
                    text="Exportar XLSX"
                    variant="secondary"
                    fullWidth={true}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-8 xl:col-span-9">
            <InsightPanel status={state.status} insights={state.insights} error={state.error} />
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;