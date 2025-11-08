
export interface ParsedCsv {
  fileName: string;
  headers: string[];
  rows: Record<string, string>[];
  sampleRows: Record<string, string>[];
}

export interface Insight {
  fileName: string;
  suggestions: string[];
  cleaningSteps: string[];
}

export type AppStatus = 'idle' | 'files_selected' | 'loading' | 'parsing_complete' | 'analysis_complete' | 'error';

export interface AppState {
  status: AppStatus;
  files: File[];
  parsedData: ParsedCsv[];
  insights: Insight[];
  error: string | null;
}
