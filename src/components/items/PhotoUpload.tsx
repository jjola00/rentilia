'use client';

import { useState, useRef } from 'react';
import { useAuth } from '@/lib/auth/AuthProvider';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Upload, X, Loader2, Image as ImageIcon } from 'lucide-react';

interface PhotoUploadProps {
  photoUrls: string[];
  onPhotosChange: (urls: string[]) => void;
  maxPhotos?: number;
}

export function PhotoUpload({ photoUrls, onPhotosChange, maxPhotos = 10 }: PhotoUploadProps) {
  const { user } = useAuth();
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const supabase = createClient();

  const uploadPhoto = async (file: File): Promise<string | null> => {
    try {
      if (!user) throw new Error('User not authenticated');
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;
      const filePath = `${user.id}/${fileName}`; // use user.id as folder


      const { error: uploadError } = await supabase.storage
        .from('item-photos')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false,
        });

      if (uploadError) throw uploadError;


      const { data: { publicUrl } } = supabase.storage
        .from('item-photos')
        .getPublicUrl(filePath);

      return publicUrl;
    } catch (error) {
      console.error('Error uploading photo:', error);
      return null;
    }
  };

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    if (photoUrls.length + files.length > maxPhotos) {
      toast({
        variant: 'destructive',
        title: 'Too many photos',
        description: `You can only upload up to ${maxPhotos} photos`,
      });
      return;
    }

    setUploading(true);

    const uploadPromises = Array.from(files).map((file) => {
      if (!file.type.startsWith('image/')) {
        toast({
          variant: 'destructive',
          title: 'Invalid file type',
          description: 'Please upload only image files',
        });
        return Promise.resolve(null);
      }

      if (file.size > 5 * 1024 * 1024) {
        toast({
          variant: 'destructive',
          title: 'File too large',
          description: 'Images must be less than 5MB',
        });
        return Promise.resolve(null);
      }

      return uploadPhoto(file);
    });

    const results = await Promise.all(uploadPromises);
    const successfulUploads = results.filter((url): url is string => url !== null);

    if (successfulUploads.length > 0) {
      onPhotosChange([...photoUrls, ...successfulUploads]);
      toast({
        title: 'Success',
        description: `${successfulUploads.length} photo(s) uploaded`,
      });
    }

    setUploading(false);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    handleFiles(e.dataTransfer.files);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFiles(e.target.files);
  };

  const getObjectPathFromUrl = (url: string) => {
    try {
      const parsed = new URL(url);
      const publicPrefix = '/storage/v1/object/public/item-photos/';
      const signedPrefix = '/storage/v1/object/sign/item-photos/';

      if (parsed.pathname.startsWith(publicPrefix)) {
        return parsed.pathname.slice(publicPrefix.length);
      }

      if (parsed.pathname.startsWith(signedPrefix)) {
        return parsed.pathname.slice(signedPrefix.length);
      }
    } catch {
      // Ignore parse errors and fall back to string splitting.
    }

    const parts = url.split('/item-photos/');
    if (parts.length > 1) {
      return parts[1].split('?')[0];
    }

    return null;
  };

  const removePhoto = async (url: string) => {
    try {
      const objectPath = getObjectPathFromUrl(url);
      if (!objectPath) {
        throw new Error('Unable to determine file path');
      }

      await supabase.storage.from('item-photos').remove([objectPath]);

      onPhotosChange(photoUrls.filter((u) => u !== url));

      toast({
        title: 'Photo removed',
        description: 'Photo has been deleted',
      });
    } catch (error) {
      console.error('Error removing photo:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to remove photo',
      });
    }
  };

  return (
    <div className="space-y-4">
      <div
        className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
          dragActive ? 'border-primary bg-primary/5' : 'border-border'
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*"
          onChange={handleChange}
          className="hidden"
        />

        {uploading ? (
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">Uploading photos...</p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2">
            <Upload className="h-8 w-8 text-muted-foreground" />
            <div>
              <Button
                type="button"
                variant="link"
                onClick={() => fileInputRef.current?.click()}
                className="text-primary"
              >
                Click to upload
              </Button>
              <span className="text-sm text-muted-foreground"> or drag and drop</span>
            </div>
            <p className="text-xs text-muted-foreground">
              PNG, JPG, GIF up to 5MB (max {maxPhotos} photos)
            </p>
          </div>
        )}
      </div>

      {photoUrls.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {photoUrls.map((url, index) => (
            <Card key={url} className="relative group overflow-hidden">
              <div className="aspect-square relative">
                <img
                  src={url}
                  alt={`Upload ${index + 1}`}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    onClick={() => removePhoto(url)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                {index === 0 && (
                  <div className="absolute top-2 left-2 bg-primary text-primary-foreground text-xs px-2 py-1 rounded">
                    Cover
                  </div>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}

      {photoUrls.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          <ImageIcon className="h-12 w-12 mx-auto mb-2 opacity-50" />
          <p className="text-sm">No photos uploaded yet</p>
        </div>
      )}
    </div>
  );
}
