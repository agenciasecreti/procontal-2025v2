'use client';

import { AspectRatio } from '@/components/ui/aspect-ratio';
import { Dropzone, DropzoneContent, DropzoneEmptyState } from '@/components/ui/dropzone';
import Image from 'next/image';
import { useState } from 'react';
import { toast } from 'sonner';
import { ImageCropDialog } from './image-crop-dialog';

const uploadImage = async (formData: FormData) => {
  const response = await fetch(`/api/filesystem/upload`, {
    method: 'POST',
    body: formData,
  });

  const { data, success, error } = await response.json();
  if (!success) throw new Error(error.message || 'Erro ao fazer upload do avatar.');
  return data[0].key;
};

export const ToggleImage = ({
  imageUrl,
  alt = 'Image',
  avatar = false,
  folder = 'uploads',
  width = 500,
  height = 500,
  ratio = 1,
  setImage,
}: {
  imageUrl: string;
  alt: string;
  width?: number;
  height?: number;
  ratio?: number;
  avatar?: boolean;
  folder?: string;
  setImage: (key: string) => void;
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [cropDialogOpen, setCropDialogOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // Função para lidar com a seleção de arquivos
  const handleFileSelect = (files: File[]) => {
    if (files.length > 0) {
      setSelectedFile(files[0]);
      setCropDialogOpen(true);
    }
  };

  // Função para lidar com o crop finalizado
  const handleCropComplete = async (croppedFile: File) => {
    try {
      const formData = new FormData();
      formData.append('file', croppedFile);
      formData.append('folder', folder);

      const key = await uploadImage(formData);
      setImage(key);
      toast.success('Enviado com sucesso! Clique em salvar para atualizar.');
    } catch (error) {
      toast.error(`Erro ao enviar o arquivo: ${error instanceof Error ? error.message : error}`);
    }
  };

  return (
    <>
      <AspectRatio
        ratio={ratio}
        className={`bg-muted overflow-hidden ${avatar ? 'rounded-full' : 'rounded-lg'}`}
      >
        <div
          className={`group relative m-auto mb-4 h-full w-full cursor-pointer ${avatar ? 'rounded-full' : 'rounded-lg'}`}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          {imageUrl ? (
            <Image
              src={
                imageUrl.startsWith('http')
                  ? imageUrl
                  : `${process.env.NEXT_PUBLIC_CDN_URL}/${imageUrl}`
              }
              width={width}
              height={height}
              alt={alt}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center">
              <span className="text-muted-foreground text-center">Nenhuma imagem selecionada</span>
            </div>
          )}

          <div className="absolute inset-0">
            <Dropzone
              accept={{
                'image/jpeg': ['.jpg', '.jpeg'],
                'image/png': ['.png'],
                'image/webp': ['.webp'],
              }}
              maxFiles={1}
              className="flex h-full w-full items-center border-0 bg-transparent p-0"
              multiple={false}
              maxSize={10 * 1024 * 1024} // 10MB
              onError={(error) => {
                toast.error(`Erro: ${error.message}`);
              }}
              onDrop={handleFileSelect}
            >
              <div
                className={`bg-foreground/20 text-foreground absolute inset-0 flex items-center justify-center p-5 backdrop-blur-sm transition-opacity duration-200 ${isHovered ? 'opacity-100' : 'opacity-0'} `}
              >
                <div className="text-center">
                  <DropzoneEmptyState />
                </div>
              </div>
              <DropzoneContent />
            </Dropzone>
          </div>
        </div>
      </AspectRatio>

      <ImageCropDialog
        open={cropDialogOpen}
        onOpenChange={setCropDialogOpen}
        cropShape={avatar ? 'round' : 'rect'}
        imageFile={selectedFile}
        finalWidth={width}
        ratio={ratio}
        onCropComplete={handleCropComplete}
      />
    </>
  );
};
