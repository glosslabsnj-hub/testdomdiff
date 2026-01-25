import React, { Component, ErrorInfo, ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Home, RefreshCw } from "lucide-react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  private handleReload = () => {
    window.location.reload();
  };

  private handleGoHome = () => {
    window.location.href = "/";
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
          <div className="max-w-md w-full text-center">
            {/* Icon */}
            <div className="mb-8">
              <div className="w-20 h-20 mx-auto bg-crimson/20 rounded-full flex items-center justify-center border-2 border-crimson/50">
                <AlertTriangle className="w-10 h-10 text-crimson" />
              </div>
            </div>

            {/* Heading */}
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2 uppercase tracking-wider">
              System <span className="text-crimson">Lockdown</span>
            </h1>

            {/* Subtext */}
            <p className="text-muted-foreground mb-2">
              An unexpected error has occurred. The system has been secured.
            </p>
            <p className="text-sm text-muted-foreground/70 mb-8">
              Don't worry, your progress has been saved.
            </p>

            {/* Error details (dev only) */}
            {process.env.NODE_ENV === "development" && this.state.error && (
              <div className="mb-8 p-4 bg-charcoal rounded-lg border border-border text-left overflow-auto max-h-32">
                <p className="text-xs text-crimson font-mono">
                  {this.state.error.message}
                </p>
              </div>
            )}

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button
                onClick={this.handleReload}
                variant="gold"
                size="lg"
                className="gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                Try Again
              </Button>
              <Button
                onClick={this.handleGoHome}
                variant="outline"
                size="lg"
                className="gap-2"
              >
                <Home className="w-4 h-4" />
                Return Home
              </Button>
            </div>

            {/* Footer */}
            <p className="mt-8 text-xs text-muted-foreground/50">
              If this issue persists, contact support@domdifferent.com
            </p>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
