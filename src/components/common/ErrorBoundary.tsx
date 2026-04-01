import { Component, type ReactNode } from 'react';

interface Props { children: ReactNode; fallback?: ReactNode; }
interface State { hasError: boolean; error: Error | null; }

export default class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('[ErrorBoundary]', error, info.componentStack);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback ?? (
        <div className="flex-1 flex flex-col items-center justify-center p-8 text-[#2a2a2a] bg-[#f0f2f5]">
          <div className="text-4xl mb-4">!</div>
          <h2 className="text-lg font-bold mb-2">Algo salio mal</h2>
          <pre className="text-xs text-red-600 bg-red-50 p-4 rounded max-w-[600px] overflow-auto whitespace-pre-wrap">
            {this.state.error?.message}
            {'\n'}
            {this.state.error?.stack}
          </pre>
          <button
            className="mt-4 bg-brand text-white px-4 py-2 rounded font-bold cursor-pointer"
            onClick={() => this.setState({ hasError: false, error: null })}
          >
            Reintentar
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
