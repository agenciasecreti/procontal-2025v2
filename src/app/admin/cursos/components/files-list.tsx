import { Button } from '@/components/ui/button';
import { Dropzone, DropzoneContent, DropzoneEmptyState } from '@/components/ui/dropzone';
import { Separator } from '@/components/ui/separator';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Trash2 } from 'lucide-react';
import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';

type FileType = {
  url: string;
  key: string;
  size: number;
  lastModified: string;
  type: number;
  name: string;
};

// Função para buscar arquivos do curso
const fetchFiles = async (folder: string) => {
  const params = new URLSearchParams({
    folder: folder,
  });

  try {
    const response = await fetch(`/api/filesystem?${params.toString()}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include', // ESSENCIAL para enviar cookies de autenticação
      cache: 'no-store',
    });

    const { data, success, error } = await response.json();
    if (!success) toast.error(error.message || `Erro HTTP`);
    return { data, success };
  } catch (error) {
    // Log detalhado do erro para debug
    console.error('Erro detalhado na requisição:', {
      error: error,
      message: error instanceof Error ? error.message : 'Erro desconhecido',
      folder: folder,
      url: `/api/filesystem/?${params.toString()}`,
    });
    throw error;
  }
};

// Função para remover arquivos do curso
const removeFiles = async (key: string) => {
  if (!key) {
    toast.error('Chave do arquivo não fornecida.');
    return;
  }

  const res = await fetch(`/api/filesystem/delete`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include', // ESSENCIAL para enviar cookies de autenticação
    body: JSON.stringify({ key: key }),
  });

  if (!res.ok) toast.error((await res.json()).error.message || 'Erro ao remover arquivo do curso.');
  else {
    toast.success(`Arquivo removido do curso com sucesso.`);
    return res.json();
  }
};

// Função para adicionar arquivos ao curso
const uploadFiles = async (formData: FormData) => {
  const res = await fetch(`/api/filesystem/upload`, {
    method: 'POST',
    credentials: 'include', // ESSENCIAL para enviar cookies de autenticação
    body: formData,
  });
  const { data, success, error } = await res.json();
  if (!success) toast.error(error.message || 'Erro ao adicionar arquivos ao curso.');
  else {
    toast.success(`Arquivos adicionados ao curso com sucesso.`);
    return data;
  }
};

export function FilesList({ course_id }: { course_id: number }) {
  const [files, setFiles] = useState<FileType[]>([]);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Função para buscar arquivos
  const handleGetFiles = useCallback(async () => {
    if (isLoading || isSubmitting) {
      return;
    }

    setIsLoading(true);
    setIsSubmitting(true);

    try {
      const { data, success } = await fetchFiles(`courses/${course_id}/files`);
      if (!success) throw new Error('Erro ao buscar arquivos.');
      if (data.files) setFiles(data.files);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Erro ao buscar arquivos.');
      setFiles([]);
    } finally {
      setIsLoading(false);
      setIsSubmitting(false);
    }
  }, [course_id, isLoading, isSubmitting]);

  useEffect(() => {
    handleGetFiles();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleRemoveFile = async (file: FileType) => {
    try {
      await removeFiles(file.key);
    } finally {
      handleGetFiles();
    }
  };

  const handleDrop = (files: File[]) => {
    setSelectedFiles(files);
  };

  const removeDropFile = (file: File) => {
    setSelectedFiles((prevFiles) => prevFiles.filter((f) => f.name !== file.name));
  };

  const handleUploadFiles = async () => {
    try {
      if (selectedFiles.length === 0) {
        toast.error('Nenhum arquivo selecionado para upload.');
        return;
      }

      const formData = new FormData();
      const folder = `courses/${course_id}/files`;
      formData.append('folder', folder);

      selectedFiles.forEach((file) => {
        formData.append('file', file);
      });

      await uploadFiles(formData);
      const filesInput = document.querySelector('input[name="files"]') as HTMLInputElement;
      if (filesInput) {
        filesInput.value = ''; // Limpar o input de arquivos
      }
      setSelectedFiles([]); // Limpar arquivos selecionados após upload
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Erro ao fazer upload dos arquivos.');
    } finally {
      handleGetFiles();
    }
  };

  return (
    <>
      <div className="flex flex-col gap-4">
        {isLoading ? (
          <div className="flex h-32 items-center justify-center">
            <p className="text-gray-500">Carregando arquivos...</p>
          </div>
        ) : files.length > 0 ? (
          <div>
            <Table className="table-striped table-auto">
              <TableHeader>
                <TableRow>
                  <TableHead className="text-left">Arquivo</TableHead>
                  <TableHead className="text-left">Tamanho</TableHead>
                  <TableHead className="text-left">Modificação</TableHead>
                  <TableHead className="text-left">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {files.map((file) => (
                  <TableRow key={file.key}>
                    <TableCell>
                      <Link
                        href={file.url}
                        target="_blank"
                        className="text-secondary hover:underline"
                      >
                        {file.name}
                      </Link>
                    </TableCell>
                    <TableCell>{(file.size / (1024 * 1024)).toFixed(2)} MB</TableCell>
                    <TableCell>{new Date(file.lastModified).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleRemoveFile(file)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <Separator />
          </div>
        ) : (
          <div className="flex h-full items-center justify-center"></div>
        )}

        <div className="m-auto my-4 w-full space-y-4 lg:w-1/3">
          <p className="text-center text-xl font-bold">Enviar Arquivos</p>
          <Dropzone
            maxSize={1024 * 1024 * 100}
            minSize={1024}
            maxFiles={10}
            onDrop={handleDrop}
            onError={console.error}
            src={selectedFiles}
          >
            <DropzoneEmptyState />
            <DropzoneContent />
          </Dropzone>
          {selectedFiles.length > 0 && (
            <div className="flex flex-col text-sm text-gray-500">
              {selectedFiles.length &&
                selectedFiles.map((file) => (
                  <div key={file.name} className="flex justify-between">
                    <span key={file.name}>
                      <span className="font-bold">{file.name}</span>
                      <span className="ml-1 text-xs">
                        - {(file.size / (1024 * 1024)).toFixed(2)} MB
                      </span>
                    </span>
                    <span>
                      <Button variant="ghost" size="sm" onClick={() => removeDropFile(file)}>
                        <Trash2 className="text-destructive h-4 w-4" />
                      </Button>
                    </span>
                  </div>
                ))}
              <Button
                variant="secondary"
                className="mt-4"
                onClick={handleUploadFiles}
                disabled={selectedFiles.length === 0}
              >
                Enviar
              </Button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
