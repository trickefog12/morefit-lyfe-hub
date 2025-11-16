import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { useState } from 'react';
import { toast } from '@/hooks/use-toast';

export const useCamera = () => {
  const [photo, setPhoto] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const takePicture = async () => {
    try {
      setIsLoading(true);
      const image = await Camera.getPhoto({
        quality: 90,
        allowEditing: true,
        resultType: CameraResultType.Uri,
        source: CameraSource.Camera,
      });

      setPhoto(image.webPath || null);
      toast({
        title: "Photo captured",
        description: "Your photo has been captured successfully",
      });
      
      return image.webPath;
    } catch (error) {
      console.error('Error taking photo:', error);
      toast({
        title: "Camera error",
        description: "Failed to capture photo",
        variant: "destructive",
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const pickFromGallery = async () => {
    try {
      setIsLoading(true);
      const image = await Camera.getPhoto({
        quality: 90,
        allowEditing: true,
        resultType: CameraResultType.Uri,
        source: CameraSource.Photos,
      });

      setPhoto(image.webPath || null);
      toast({
        title: "Photo selected",
        description: "Your photo has been selected successfully",
      });
      
      return image.webPath;
    } catch (error) {
      console.error('Error picking photo:', error);
      toast({
        title: "Gallery error",
        description: "Failed to select photo",
        variant: "destructive",
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    photo,
    isLoading,
    takePicture,
    pickFromGallery,
  };
};
