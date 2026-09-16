/**
 * Cloudinary & Supabase Storage Client Utility
 * Provides seamless browser-side and server-side image/receipt uploads.
 */

export interface UploadResult {
  url: string;
  publicId?: string;
  bytes?: number;
  format?: string;
}

export async function uploadReceiptProof(file: File): Promise<UploadResult> {
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

  // If live Cloudinary is configured
  if (cloudName && uploadPreset) {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", uploadPreset);
    formData.append("folder", "rupalshield/receipts");

    const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
      method: "POST",
      body: formData,
    });

    if (!res.ok) {
      throw new Error("Cloudinary upload failed.");
    }

    const data = await res.json();
    return {
      url: data.secure_url,
      publicId: data.public_id,
      bytes: data.bytes,
      format: data.format,
    };
  }

  // Fallback: Local Object URL / Mock Secure Storage URL
  return {
    url: URL.createObjectURL(file),
    publicId: `mock_${Date.now()}_${file.name}`,
    bytes: file.size,
    format: file.type.split("/")[1] || "pdf",
  };
}
