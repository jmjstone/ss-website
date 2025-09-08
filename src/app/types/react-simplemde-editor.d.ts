declare module 'react-simplemde-editor' {
  import type { ComponentType } from 'react';
  const SimpleMDE: ComponentType<{
    value: string;
    onChange: (value: string) => void;
    options?: unknown;
  }>;
  export default SimpleMDE;
}
