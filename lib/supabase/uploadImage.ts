import { createClient } from './server';

export async function uploadImage(file: File): Promise<{ url: string; path: string }> {
  const supabase = await createClient();
  const fileExt = file.name.split('.').pop();
  const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`;
  const filePath = `products/${fileName}`;

  const { error } = await supabase.storage
    .from('product-images')
    .upload(filePath, file, {
      contentType: file.type,
      cacheControl: '3600',
      upsert: false,
    });

  if (error) {
    throw error;
  }

  const { data: { publicUrl } } = supabase.storage
    .from('product-images')
    .getPublicUrl(filePath);

  return {
    url: publicUrl,
    path: filePath,
  };
}

export async function deleteImage(path: string): Promise<boolean> {
  const supabase = await createClient();
  const { error } = await supabase.storage
    .from('product-images')
    .remove([path]);

  if (error) {
    console.error('Failed to delete image from Supabase Storage:', error);
    return false;
  }

  return true;
}
