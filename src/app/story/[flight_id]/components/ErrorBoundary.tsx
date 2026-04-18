"use client";

import { Component, type ReactNode } from "react";

interface ErrorBoundaryProps {
  flightId: string;
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-zinc-950 text-zinc-300 p-8">
          <div className="max-w-md space-y-4">
            <h1 className="text-xl font-semibold text-white">
              Pipeline output not found
            </h1>
            <p className="text-sm">
              Expected:{" "}
              <code className="text-xs bg-zinc-800 px-1.5 py-0.5 rounded font-mono">
                /data/{this.props.flightId}.json
              </code>
            </p>
            {this.state.error && (
              <p className="text-xs text-zinc-500 font-mono">
                {this.state.error.message}
              </p>
            )}
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
