// Minh Pham
export const uploadToCloudinary = async (file: File): Promise<string> => {
  const cloudinaryName = import.meta.env.VITE_CLOUDINARY_NAME;
  const cloudinaryUploadPreset = import.meta.env.VITE_CLOUDINARY_PRESET;

  // Prepare form data for upload
  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", cloudinaryUploadPreset);

  // Send POST request to Cloudinary API
  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${cloudinaryName}/image/upload`,
    {
      method: "POST",
      body: formData,
    }
  );

  // Parse and return uploaded image URL
  const data = await response.json();
  return data.secure_url;
};
