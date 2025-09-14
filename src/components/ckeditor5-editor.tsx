'use client';

import { useEffect, useState } from 'react';

interface CKEditor5FormProps {
  initialContent?: string;
  onChange: (content: string) => void;
  placeholder?: string;
  folder?: string;
}

export default function Ckeditor5Form(props: CKEditor5FormProps) {
  const [CKEditorClient, setCKEditorClient] =
    useState<React.ComponentType<CKEditor5FormProps> | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Carregamento dinâmico apenas no cliente
    const loadEditor = async () => {
      try {
        const { default: EditorComponent } = await import('./ckeditor5-client');
        setCKEditorClient(() => EditorComponent);
      } catch (error) {
        console.error('Erro ao carregar o editor:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadEditor();
  }, []);

  if (isLoading || !CKEditorClient) {
    return (
      <div className="ck-editor__loading" style={{ padding: '20px', textAlign: 'center' }}>
        <div>Carregando editor...</div>
      </div>
    );
  }

  return <CKEditorClient {...props} />;
}
