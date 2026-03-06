'use client';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import imageCompression from 'browser-image-compression';
import { Loader2, Upload } from 'lucide-react';
import React, { useRef } from 'react';
import { uploadImage } from '../../lib/supabase';

import { toast } from 'react-hot-toast';

interface Props {
  imageUrl: string;
  onImageChange: (url: string) => void;
  folder: string;
  customFileName?: string;
  label?: string;
  classNameButton?: string;
  required?: boolean;
  disabled?: boolean;
  isUploading: boolean;
  setIsUploading: (isUploading: boolean) => void;
}

export const ImageUpload: React.FC<Props> = ({
  imageUrl,
  onImageChange,
  folder,
  customFileName,
  label = 'Изображение',
  classNameButton,
  required = false,
  disabled = false,
  isUploading,
  setIsUploading,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploading(true);

      // --- ШАГ 1: Настройка сжатия ---
      const options = {
        maxSizeMB: 1, // Максимальный размер 1МБ
        maxWidthOrHeight: 1920, // Уменьшаем, если фото гигантское
        useWebWorker: true,
        fileType: 'image/webp', // 👈 Конвертируем в WebP
      };

      // console.log(`[IMAGE_UPLOAD] Исходный размер: ${(file.size / 1024 / 1024).toFixed(2)} MB`);

      // --- ШАГ 2: Сжатие ---
      const compressedBlob = await imageCompression(file, options);

      // Превращаем Blob обратно в File, чтобы Supabase не ругался на отсутствие имени
      // Если есть customFileName, используем его, иначе оставляем старое имя, но с расширением .webp
      const finalFileName = customFileName
        ? `${customFileName}.webp`
        : file.name.replace(/\.[^.]+$/, '.webp');

      const processedFile = new File([compressedBlob], finalFileName, {
        type: 'image/webp',
      });

      // console.log(
      //   `[IMAGE_UPLOAD] Итоговый размер: ${(processedFile.size / 1024 / 1024).toFixed(2)} MB`,
      // );

      // --- ШАГ 3: Загрузка ---
      // Передаем в uploadImage уже готовый файл и customFileName
      const url = await uploadImage(processedFile, folder, 'gemma', customFileName);

      if (url) {
        // setPreviewUrl(url);
        onImageChange(url);
      } else {
        toast.error(`Errore durante il caricamento dell'immagine`);
      }
    } catch (error) {
      console.error('[IMAGE_UPLOAD] Ошибка:', error);
      toast.error("Errore durante l'elaborazione dell'immagine");
    } finally {
      setIsUploading(false);
      // Сбрасываем значение инпута, чтобы можно было выбрать тот же файл повторно
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">
        {label} {required && <span className="text-red-500">*</span>}
      </label>

      <input
        ref={fileInputRef}
        type="file"
        // Добавляем поддержку HEIC в accept

        accept="image/jpeg,image/jpg,image/png,image/webp,image/gif,image/heic,image/heif"
        onChange={handleFileSelect}
        className="hidden"
        disabled={disabled || isUploading}
      />

      {/* Upload Button */}
      <Button
        type="button"
        onClick={() => fileInputRef.current?.click()}
        variant="outline"
        className={cn('w-full', classNameButton)}
        disabled={disabled || isUploading}
      >
        {isUploading ? (
          <>
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            Processing & Uploading...
          </>
        ) : (
          <>
            <Upload className="h-4 w-4 mr-2" />

            {imageUrl ? 'Change image' : 'Upload image'}
          </>
        )}
      </Button>

      <p className="text-xs text-gray-500 italic">
        I file verranno ottimizzati automaticamente (WebP, max 1MB).
      </p>
    </div>
  );
};
