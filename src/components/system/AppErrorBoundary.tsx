import { Component, type ErrorInfo, type ReactNode } from "react";
import { ErrorState } from "@/components/design-system/States";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

/**
 * Catches render-time failures inside a workspace subtree.
 *
 * Without this, a single unexpected error blanks the entire application. The
 * raw exception is deliberately not shown to the user — it is logged for a
 * developer while the officer or citizen sees a recoverable message.
 */
export default class AppErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    // Diagnostics for a developer. A real deployment would forward this to an
    // error reporting service rather than the console. The user never sees it.
    console.error("Workspace error boundary caught:", error, info.componentStack);
  }

  private reset = (): void => {
    this.setState({ hasError: false });
  };

  render(): ReactNode {
    if (this.state.hasError) {
      return (
        <ErrorState
          title="This screen could not be displayed"
          message="An unexpected problem interrupted this page. Your saved records are unaffected."
          onRetry={this.reset}
        />
      );
    }
    return this.props.children;
  }
}
