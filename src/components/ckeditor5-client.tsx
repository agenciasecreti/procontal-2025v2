'use client';

/**
 * Componente CKEditor5 que roda apenas no cliente
 * Baseado no Custom Build do CKEditor5 com todos os plugins
 */
import { CKEditor } from '@ckeditor/ckeditor5-react';
import {
  Alignment,
  Autoformat,
  AutoImage,
  Autosave,
  BlockQuote,
  BlockToolbar,
  Bold,
  ClassicEditor,
  Code,
  Emoji,
  Essentials,
  FileLoader,
  FontBackgroundColor,
  FontColor,
  FontFamily,
  FontSize,
  GeneralHtmlSupport,
  Heading,
  Highlight,
  ImageBlock,
  ImageCaption,
  ImageInline,
  ImageInsert,
  ImageInsertViaUrl,
  ImageResize,
  ImageStyle,
  ImageTextAlternative,
  ImageToolbar,
  ImageUpload,
  Indent,
  IndentBlock,
  Italic,
  Link,
  LinkImage,
  List,
  ListProperties,
  MediaEmbed,
  Mention,
  Paragraph,
  PasteFromOffice,
  PlainTableOutput,
  RemoveFormat,
  ShowBlocks,
  SimpleUploadAdapter,
  SourceEditing,
  Strikethrough,
  Subscript,
  Superscript,
  Table,
  TableCaption,
  TableCellProperties,
  TableColumnResize,
  TableLayout,
  TableProperties,
  TableToolbar,
  TextTransformation,
  TodoList,
  Underline,
  WordCount,
  type EditorConfig,
} from 'ckeditor5';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import translations from 'ckeditor5/translations/pt-br.js';

import 'ckeditor5/ckeditor5.css';

const LICENSE_KEY = 'GPL';

interface CKEditor5ClientProps {
  initialContent?: string;
  onChange: (content: string) => void;
  placeholder?: string;
  folder?: string;
}

export default function CKEditor5Client({
  initialContent,
  onChange,
  placeholder = 'Digite ou cole seu conteúdo aqui...',
  folder = 'uploads',
}: CKEditor5ClientProps) {
  const editorContainerRef = useRef<HTMLDivElement | null>(null);
  const editorRef = useRef<HTMLDivElement | null>(null);
  const editorWordCountRef = useRef<HTMLDivElement | null>(null);
  const [isLayoutReady, setIsLayoutReady] = useState(false);
  const [editorContent, setEditorContent] = useState(initialContent || '');
  const lastContentRef = useRef(initialContent || '');
  const isInitialLoad = useRef(true);

  useEffect(() => {
    setIsLayoutReady(true);
    return () => setIsLayoutReady(false);
  }, []);

  // Atualizar conteúdo apenas quando initialContent mudar e não for o carregamento inicial
  useEffect(() => {
    if (!isInitialLoad.current && initialContent !== undefined) {
      setEditorContent(initialContent);
    }
    isInitialLoad.current = false;
  }, [initialContent]);

  // Callback estável para onChange
  const stableOnChange = useCallback(
    (content: string) => {
      if (lastContentRef.current !== content) {
        lastContentRef.current = content;
        onChange(content);
      }
    },
    [onChange]
  );

  const { editorConfig } = useMemo(() => {
    if (!isLayoutReady) {
      return {};
    }

    return {
      editorConfig: {
        toolbar: {
          items: [
            'undo',
            'redo',
            '|',
            'heading',
            '|',
            'alignment',
            '|',
            'bulletedList',
            'numberedList',
            'todoList',
            'outdent',
            'indent',
            'blockQuote',
            '|',
            'fontColor',
            'bold',
            'italic',
            'underline',
            'subscript',
            'superscript',
            'removeFormat',
            '|',
            'link',
            'insertImage',
            'mediaEmbed',
            'insertTable',
            '|',
            'emoji',
            '|',
            'fontSize',
            'fontFamily',
            'fontBackgroundColor',
            'highlight',
            'strikethrough',
            'code',
            '|',
            'sourceEditing',
            'showBlocks',
          ],
          shouldNotGroupWhenFull: false,
        },
        plugins: [
          Alignment,
          Autoformat,
          AutoImage,
          Autosave,
          BlockQuote,
          BlockToolbar,
          Bold,
          Code,
          Emoji,
          Essentials,
          FontBackgroundColor,
          FontColor,
          FontFamily,
          FontSize,
          GeneralHtmlSupport,
          Heading,
          Highlight,
          ImageBlock,
          ImageCaption,
          ImageInline,
          ImageInsert,
          ImageInsertViaUrl,
          ImageResize,
          ImageStyle,
          ImageTextAlternative,
          ImageToolbar,
          ImageUpload,
          Indent,
          IndentBlock,
          Italic,
          Link,
          LinkImage,
          List,
          ListProperties,
          MediaEmbed,
          Mention,
          Paragraph,
          PasteFromOffice,
          PlainTableOutput,
          RemoveFormat,
          ShowBlocks,
          SimpleUploadAdapter,
          SourceEditing,
          Strikethrough,
          Subscript,
          Superscript,
          Table,
          TableCaption,
          TableCellProperties,
          TableColumnResize,
          TableLayout,
          TableProperties,
          TableToolbar,
          TextTransformation,
          TodoList,
          Underline,
          WordCount,
        ],
        blockToolbar: [
          'fontSize',
          'fontColor',
          'fontBackgroundColor',
          '|',
          'bold',
          'italic',
          '|',
          'link',
          'insertImage',
          'insertTable',
          '|',
          'bulletedList',
          'numberedList',
          'outdent',
          'indent',
        ],
        fontFamily: {
          supportAllValues: true,
        },
        fontSize: {
          options: [10, 12, 14, 'default', 18, 20, 22],
          supportAllValues: true,
        },
        heading: {
          options: [
            {
              model: 'paragraph' as const,
              title: 'Parágrafo',
              class: 'ck-heading_paragraph',
            },
            {
              model: 'heading1' as const,
              view: 'h1' as const,
              title: 'Título 1',
              class: 'ck-heading_heading1',
            },
            {
              model: 'heading2' as const,
              view: 'h2' as const,
              title: 'Título 2',
              class: 'ck-heading_heading2',
            },
            {
              model: 'heading3' as const,
              view: 'h3' as const,
              title: 'Título 3',
              class: 'ck-heading_heading3',
            },
            {
              model: 'heading4' as const,
              view: 'h4' as const,
              title: 'Título 4',
              class: 'ck-heading_heading4',
            },
            {
              model: 'heading5' as const,
              view: 'h5' as const,
              title: 'Título 5',
              class: 'ck-heading_heading5',
            },
            {
              model: 'heading6' as const,
              view: 'h6' as const,
              title: 'Título 6',
              class: 'ck-heading_heading6',
            },
          ],
        },
        htmlSupport: {
          allow: [
            {
              name: /^.*$/,
              styles: /^.*$/,
              attributes: /^.*$/,
            },
          ],
        } satisfies EditorConfig['htmlSupport'],
        image: {
          toolbar: [
            'toggleImageCaption',
            'imageTextAlternative',
            '|',
            'imageStyle:inline',
            'imageStyle:wrapText',
            'imageStyle:breakText',
            '|',
            'resizeImage',
          ],
        },
        language: 'pt-br',
        licenseKey: LICENSE_KEY,
        link: {
          addTargetToExternalLinks: true,
          defaultProtocol: 'https://',
          decorators: {
            toggleDownloadable: {
              mode: 'manual' as const,
              label: 'Downloadable',
              attributes: {
                download: 'file',
              },
            },
          },
        },
        list: {
          properties: {
            styles: true,
            startIndex: true,
            reversed: true,
          },
        },
        mention: {
          feeds: [
            {
              marker: '@',
              feed: [
                /* Configurar feeds de menção se necessário */
              ],
            },
          ],
        },
        placeholder,
        table: {
          contentToolbar: [
            'tableColumn',
            'tableRow',
            'mergeTableCells',
            'tableProperties',
            'tableCellProperties',
          ],
        },
        translations: [translations],
      } satisfies EditorConfig,
    };
  }, [isLayoutReady, placeholder]);

  return (
    <div className="main-container m-0 w-full">
      <div
        className="editor-container editor-container_classic-editor editor-container_include-block-toolbar editor-container_include-word-count !m-0 w-full"
        ref={editorContainerRef}
      >
        <div className="editor-container__editor">
          <div ref={editorRef}>
            {editorConfig && (
              <CKEditor
                editor={ClassicEditor}
                config={editorConfig}
                data={editorContent}
                onChange={(event, editor) => {
                  const data = editor.getData();
                  setEditorContent(data);
                  stableOnChange(data);
                }}
                onReady={(editor) => {
                  // Configurar upload adapter customizado
                  const fileRepository = editor.plugins.get('FileRepository');
                  fileRepository.createUploadAdapter = (loader: FileLoader) => {
                    return {
                      upload: () => {
                        return new Promise((resolve, reject) => {
                          loader.file.then((file: File | null) => {
                            if (!file) {
                              reject('Nenhum arquivo selecionado');
                              return;
                            }

                            const formData = new FormData();
                            formData.append('file', file);
                            formData.append('folder', folder);

                            fetch('/api/filesystem/upload', {
                              method: 'POST',
                              body: formData,
                            })
                              .then((response) => response.json())
                              .then((result) => {
                                if (result.success && result.data && result.data.length > 0) {
                                  resolve({
                                    default: result.data[0].url,
                                  });
                                } else {
                                  reject(result.message || 'Erro no upload da imagem');
                                }
                              })
                              .catch((error) => {
                                console.error('Erro no upload:', error);
                                reject('Erro no upload da imagem');
                              });
                          });
                        });
                      },
                    };
                  };

                  // Configurar WordCount
                  const wordCount = editor.plugins.get('WordCount') as WordCount;
                  if (editorWordCountRef.current) {
                    editorWordCountRef.current.appendChild(
                      wordCount.wordCountContainer || document.createElement('div')
                    );
                  }
                }}
                onAfterDestroy={() => {
                  if (editorWordCountRef.current?.children) {
                    Array.from(editorWordCountRef.current.children).forEach((child) =>
                      child.remove()
                    );
                  }
                }}
              />
            )}
          </div>
        </div>
        <div className="editor-container__word-count" ref={editorWordCountRef}></div>
      </div>
    </div>
  );
}
