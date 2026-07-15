import { Component, type ErrorInfo, type ReactNode } from "react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

class ColumnRenderErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Column render error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="not-prose p-6 rounded-xl border border-red-200 dark:border-red-900 bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-300">
          <p className="font-bold mb-2">この記事の表示中にエラーが発生しました</p>
          <p className="text-sm">
            お手数ですが、コラム一覧から他の記事をご覧いただくか、時間を置いて再度お試しください。
          </p>
        </div>
      );
    }
    return this.props.children;
  }
}

export default ColumnRenderErrorBoundary;
