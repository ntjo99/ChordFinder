import { Component, type ErrorInfo, type ReactNode } from "react";

interface AppErrorBoundaryProps {
  children: ReactNode;
}

interface AppErrorBoundaryState {
  hasError: boolean;
}

export class AppErrorBoundary extends Component<
  AppErrorBoundaryProps,
  AppErrorBoundaryState
> {
  state: AppErrorBoundaryState = {
    hasError: false,
  };

  static getDerivedStateFromError(): AppErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error("Chord Finder crashed", error, errorInfo);
  }

  render() {
    if (!this.state.hasError) {
      return this.props.children;
    }

    return (
      <main className="fatal-error-shell" role="alert">
        <section className="fatal-error-card">
          <p className="fatal-error-label">Unexpected Error</p>
          <h1>Chord Finder hit a runtime issue.</h1>
          <p>
            Reload to recover. Your last saved local session remains available.
          </p>
          <div className="fatal-error-actions">
            <button type="button" onClick={() => window.location.reload()}>
              Reload App
            </button>
          </div>
        </section>
      </main>
    );
  }
}

