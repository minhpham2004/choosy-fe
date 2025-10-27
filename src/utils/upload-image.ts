// Minh Pham
export const uploadToCloudinary = async (file: File): Promise<string> => {
  const cloudinaryName = import.meta.env.VITE_CLOUDINARY_NAME;
  const cloudinaryUploadPreset = import.meta.env.VITE_CLOUDINARY_PRESET;

  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", cloudinaryUploadPreset);

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${cloudinaryName}/image/upload`,
    {
      method: "POST",
      body: formData,
    }
  );
  const data = await response.json();
  
  return data.secure_url;
};
