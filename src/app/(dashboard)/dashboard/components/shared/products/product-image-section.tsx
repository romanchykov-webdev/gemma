import { Button, Input } from '@/components/ui';
import { ImageIcon, X } from 'lucide-react';
import Image from 'next/image';

import { ImageUpload } from '../image-upload';

interface ProductImageSectionProps {
  name: string;
  onNameChange: (value: string) => void;
  nameDisabled?: boolean;
  imageUrl: string;
  onImageChange: (url: string) => void;
  uploadFolder: string;
  uploadFileName?: string;
  isUploading: boolean;
  onUploadingChange: (value: boolean) => void;
}

export const ProductImageSection = ({
  name,
  onNameChange,
  nameDisabled = false,
  imageUrl,
  onImageChange,
  uploadFolder,
  uploadFileName,
  isUploading,
  onUploadingChange,
}: ProductImageSectionProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="flex flex-col gap-3">
        <Input
          value={name}
          onChange={e => onNameChange(e.target.value)}
          placeholder="Nome prodotto..."
          disabled={nameDisabled}
        />
        <ImageUpload
          imageUrl={imageUrl}
          onImageChange={onImageChange}
          folder={uploadFolder}
          customFileName={uploadFileName}
          label="Immagine prodotto"
          required
          isUploading={isUploading}
          setIsUploading={onUploadingChange}
        />
      </div>

      <div className="flex items-center justify-center">
        {imageUrl ? (
          <div className="relative flex p-2 w-full items-center justify-center h-full min-h-[200px] border rounded-lg overflow-hidden bg-gray-50">
            <Image
              src={imageUrl}
              alt="Preview"
              width={300}
              height={300}
              className="max-h-48 w-auto object-contain drop-shadow-md"
            />
            <Button
              type="button"
              onClick={() => onImageChange('')}
              size="sm"
              variant="destructive"
              className="absolute top-2 right-2 opacity-80 hover:opacity-100 transition-opacity"
              disabled={isUploading || nameDisabled} // Блокируем кнопку X во время загрузки
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        ) : (
          <div className="border-2 border-dashed w-full h-full min-h-[200px] flex flex-col items-center justify-center rounded-lg p-8 text-center bg-gray-50/50 hover:bg-gray-50 transition-colors">
            <ImageIcon className="h-10 w-10 mx-auto text-gray-400 mb-3" />
            <p className="text-sm text-gray-500 font-medium">Anteprima immagine</p>
          </div>
        )}
      </div>
    </div>
  );
};
