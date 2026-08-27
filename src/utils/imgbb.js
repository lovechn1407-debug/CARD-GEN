// ImgBB Upload Service for E-Cell Member Photo Hosting
const IMGBB_API_KEY = '83e3f88941efd1059a89f016ff302d9e';

/**
 * Uploads a file or base64 image string to ImgBB.
 * Returns the direct hosted image URL.
 * @param {File | Blob | string} fileOrBase64 
 * @returns {Promise<string>} Hosted Image URL
 */
export async function uploadToImgBB(fileOrBase64) {
  try {
    const formData = new FormData();

    if (typeof fileOrBase64 === 'string') {
      // Base64 string: remove data URL prefix if present
      const cleanBase64 = fileOrBase64.replace(/^data:image\/\w+;base64,/, '');
      formData.append('image', cleanBase64);
    } else if (fileOrBase64 instanceof File || fileOrBase64 instanceof Blob) {
      formData.append('image', fileOrBase64);
    } else {
      throw new Error('Invalid image payload');
    }

    const response = await fetch(`https://api.imgbb.com/1/upload?key=${IMGBB_API_KEY}`, {
      method: 'POST',
      body: formData,
    });

    const data = await response.json();

    if (data.success && data.data && data.data.url) {
      return data.data.url; // Direct hosted URL
    } else {
      console.warn('ImgBB Upload Response Error:', data);
      // Fallback: If payload was a base64 string, return it directly so user experience isn't broken
      if (typeof fileOrBase64 === 'string') return fileOrBase64;
      throw new Error(data.error?.message || 'ImgBB upload failed');
    }
  } catch (error) {
    console.error('ImgBB Upload Error:', error);
    // If it's base64, fallback to local data URL gracefully
    if (typeof fileOrBase64 === 'string') {
      return fileOrBase64;
    }
    throw error;
  }
}
