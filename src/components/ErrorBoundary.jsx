import React from 'react';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null, errorInfo: null };
    }

    static getDerivedStateFromError(error) {
        // Update state so the next render will show the fallback UI.
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        // You can also log the error to an error reporting service
        console.error("Uncaught error:", error, errorInfo);
        this.setState({ errorInfo });
    }

    render() {
        if (this.state.hasError) {
            // You can render any custom fallback UI
            return (
                <div className="min-h-screen flex items-center justify-center bg-red-50 p-4">
                    <div className="bg-white p-8 rounded-2xl shadow-xl border border-red-200 max-w-2xl w-full">
                        <div className="flex items-center space-x-4 mb-6">
                            <div className="p-3 bg-red-100 rounded-full text-red-600">
                                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                </svg>
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900">Algo salió mal</h1>
                                <p className="text-gray-500">Se ha producido un error inesperado en la aplicación.</p>
                            </div>
                        </div>

                        <div className="bg-gray-900 rounded-xl p-4 overflow-auto max-h-64 mb-6">
                            <p className="text-red-400 font-mono text-sm font-bold mb-2">
                                {this.state.error && this.state.error.toString()}
                            </p>
                            <pre className="text-gray-400 font-mono text-xs whitespace-pre-wrap">
                                {this.state.errorInfo && this.state.errorInfo.componentStack}
                            </pre>
                        </div>

                        <div className="flex justify-end space-x-4">
                            <button
                                onClick={() => window.location.reload()}
                                className="px-6 py-3 bg-red-600 text-white font-bold rounded-xl hover:bg-red-700 transition-colors shadow-lg shadow-red-600/30"
                            >
                                Recargar Aplicación
                            </button>
                        </div>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
