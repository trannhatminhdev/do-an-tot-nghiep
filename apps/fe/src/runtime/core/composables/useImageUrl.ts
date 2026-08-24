/**
 * Trả về đường dẫn ảnh từ Backend (đã có đầy đủ URL được BE xử lý)
 * @param path URL hoặc đường dẫn ảnh
 */
export const useImageUrl = (path: string | undefined | null): string => {
  return path || '';
};
