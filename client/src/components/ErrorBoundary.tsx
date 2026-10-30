import { AlertTriangle, RotateCcw } from "lucide-react";
import { Component, type ReactNode } from "react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return (
        <section className="page-shell">
          <div className="container narrow">
            <p className="eyebrow">Something broke</p>
            <h1>This page couldn’t be displayed.</h1>
            <p className="lede">
              A part of the page failed to load. Reloading usually fixes it.
            </p>
            {import.meta.env.DEV && this.state.error && (
              <pre className="error-trace">{this.state.error.stack}</pre>
            )}
            <div className="hero-actions">
              <button
                type="button"
                className="button primary"
                onClick={() => window.location.reload()}
              >
                <RotateCcw size={16} /> Reload the page
              </button>
            </div>
            <p className="status-line">
              <AlertTriangle size={14} /> If it keeps happening, the site may be
              mid-deploy.
            </p>
          </div>
        </section>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
