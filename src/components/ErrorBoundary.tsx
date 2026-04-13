import React, { useState, useEffect } from 'react';

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

export function ErrorBoundary({ children }: ErrorBoundaryProps) {
  const [hasError, setHasError] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const errorHandler = (e: ErrorEvent) => {
      // Ignore MetaMask and other extension errors
      if (e.message?.includes('MetaMask') || e.filename?.includes('extension')) return;
      setHasError(true);
      setError(e.error);
    };

    const rejectionHandler = (e: PromiseRejectionEvent) => {
      const reason = e.reason instanceof Error ? e.reason.message : String(e.reason);
      // Ignore MetaMask and other extension errors
      if (reason?.includes('MetaMask') || reason?.includes('ethereum')) return;
      
      setHasError(true);
      setError(e.reason instanceof Error ? e.reason : new Error(String(e.reason)));
    };

    window.addEventListener('error', errorHandler);
    window.addEventListener('unhandledrejection', rejectionHandler);

    return () => {
      window.removeEventListener('error', errorHandler);
      window.removeEventListener('unhandledrejection', rejectionHandler);
    };
  }, []);

  if (hasError) {
    let errorMessage = "Ocorreu um erro inesperado.";
    
    try {
      // Check if it's a Firestore JSON error
      const firestoreError = JSON.parse(error?.message || "");
      if (firestoreError.error && firestoreError.error.includes("insufficient permissions")) {
        errorMessage = "Você não tem permissão para realizar esta ação ou acessar estes dados.";
      }
    } catch (e) {
      // Not a JSON error or different format
    }

    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
        <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-lg border border-red-100 text-center">
          <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
          </div>
          <h2 className="text-xl font-bold text-slate-900 mb-2">Ops! Algo deu errado</h2>
          <p className="text-slate-600 mb-6">{errorMessage}</p>
          <button 
            onClick={() => window.location.reload()}
            className="w-full py-3 bg-primary text-white font-bold rounded-xl hover:bg-primary/90 transition-colors"
          >
            Recarregar Página
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
