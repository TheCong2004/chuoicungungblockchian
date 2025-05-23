import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

export const uploadImage = async (file, token) => {
  try {
    if (!file) throw new Error("No file provided");
    const formData = new FormData();
    formData.append("file", file);
    const response = await api.post("/ipfs/upload", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (err) {
    console.error("Upload image error:", err);
    throw new Error(err.response?.data?.error || "Failed to upload image");
  }
};

export const getImageByTokenId = async (tokenId) => {
  const response = await api.get(`/ipfs/image/${tokenId}`);
  return response.data;
};

export default api;