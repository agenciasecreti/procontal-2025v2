'use client';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Slider } from '@/components/ui/slider';
import { useCallback, useEffect, useMemo, useState } from 'react';
import type { Area, Point } from 'react-easy-crop';
import Cropper from 'react-easy-crop';

interface ImageCropDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  imageFile: File | null;
  finalWidth?: number;
  finalHeight?: number;
  ratio?: number;
  cropShape?: 'round' | 'rect'; // Define the shape of the crop area
  onCropComplete: (croppedFile: File) => void;
}

export function ImageCropDialog({
  open,
  onOpenChange,
  imageFile,
  finalWidth,
  finalHeight,
  ratio,
  cropShape = 'rect', // Default to rectangular crop shape
  onCropComplete,
}: ImageCropDialogProps) {
  const [crop, setCrop] = useState<Point>({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [imageSrc, setImageSrc] = useState<string>('');

  // Calcular o aspect ratio correto
  const aspectRatio = useMemo(() => {
    // Para avatares circulares, sempre usar 1:1
    if (cropShape === 'round') {
      return 1;
    }

    // Se ratio foi passado como prop, usar ele
    if (ratio) {
      return ratio;
    }

    // Se tem largura e altura definidas, calcular o ratio
    if (finalWidth && finalHeight) {
      return finalWidth / finalHeight;
    }

    // Padrão para formato quadrado
    return 1;
  }, [cropShape, ratio, finalWidth, finalHeight]);

  const filename = imageFile
    ? imageFile.name.split('.').slice(0, -1).join('.')
    : `image_${new Date().getTime()}`;

  useEffect(() => {
    if (imageFile) {
      const reader = new FileReader();
      reader.onload = () => setImageSrc(reader.result as string);
      reader.readAsDataURL(imageFile);
    }
  }, [imageFile]);

  const onCropCompleteHandler = useCallback((croppedArea: Area, croppedAreaPixels: Area) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const createCroppedImage = useCallback(async () => {
    if (!imageSrc || !croppedAreaPixels) return;

    try {
      // Criar canvas para o crop
      const image = new Image();
      image.src = imageSrc;

      await new Promise((resolve) => {
        image.onload = resolve;
      });

      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      if (!ctx) throw new Error('Canvas context not available');

      // Calcular dimensões finais baseadas no aspect ratio
      let outputWidth = finalWidth || 500;
      let outputHeight = finalHeight || 500;

      // Se não temos dimensões específicas, usar o aspect ratio para calcular
      if (!finalWidth && !finalHeight) {
        outputWidth = 500;
        outputHeight = 500;
      } else if (!finalHeight && finalWidth) {
        outputHeight = finalWidth / aspectRatio;
      } else if (!finalWidth && finalHeight) {
        outputWidth = finalHeight * aspectRatio;
      }

      canvas.width = outputWidth;
      canvas.height = outputHeight;

      // Desenhar a imagem cortada
      ctx.drawImage(
        image,
        croppedAreaPixels.x,
        croppedAreaPixels.y,
        croppedAreaPixels.width,
        croppedAreaPixels.height,
        0,
        0,
        outputWidth,
        outputHeight
      );

      // Converter para blob
      canvas.toBlob(
        (blob) => {
          if (blob) {
            const croppedFile = new File([blob], `${filename}_${Date.now()}.webp`, {
              type: 'image/webp',
            });
            onCropComplete(croppedFile);
            onOpenChange(false);
          }
        },
        'image/webp',
        0.9
      );
    } catch (error) {
      console.error('Erro ao criar imagem cortada:', error);
    }
  }, [
    imageSrc,
    croppedAreaPixels,
    onCropComplete,
    onOpenChange,
    filename,
    finalWidth,
    finalHeight,
    aspectRatio,
  ]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Ajustar Imagem</DialogTitle>
        </DialogHeader>

        <div className="relative h-80 w-full">
          {imageSrc && (
            <Cropper
              image={imageSrc}
              crop={crop}
              zoom={zoom}
              aspect={aspectRatio} // Usar o aspect ratio calculado
              onCropChange={setCrop}
              onZoomChange={setZoom}
              onCropComplete={onCropCompleteHandler}
              cropShape={cropShape}
              showGrid={false}
            />
          )}
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Zoom</label>
            <Slider
              value={[zoom]}
              onValueChange={(values) => setZoom(values[0])}
              min={1}
              max={3}
              step={0.1}
              className="w-full"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={createCroppedImage}>Confirmar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
