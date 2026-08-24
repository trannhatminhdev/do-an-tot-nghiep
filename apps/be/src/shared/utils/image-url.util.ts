/**
 * Chuyển đổi đường dẫn ảnh thành URL đầy đủ của backend
 * @param path Đường dẫn ảnh (ví dụ: "/static/uploads/products/abc.jpg" hoặc "https://...")
 * @param baseUrl Base URL của backend (mặc định lấy từ APP_URL hoặc http://localhost:PORT)
 */
export function formatImageUrl(
  path: string | undefined | null,
  baseUrl?: string,
): string {
  if (!path) return '';

  // Nếu là URL tuyệt đối (http://, https://, data:) thì giữ nguyên
  if (
    path.startsWith('http://') ||
    path.startsWith('https://') ||
    path.startsWith('data:')
  ) {
    return path;
  }

  const base =
    baseUrl ||
    process.env.APP_URL ||
    `http://localhost:${process.env.BE_PORT || 3000}`;

  const cleanBase = base.endsWith('/') ? base.slice(0, -1) : base;
  const cleanPath = path.startsWith('/') ? path : `/${path}`;

  return `${cleanBase}${cleanPath}`;
}

/**
 * Format toàn bộ ảnh trong một mảng ProductImage hoặc đối tượng chứa ProductImage
 */
export function formatProductImages<T extends { imageUrl: string }>(
  images?: T[] | null,
  baseUrl?: string,
): T[] | undefined | null {
  if (!images || !Array.isArray(images)) return images;
  return images.map((img) => ({
    ...img,
    imageUrl: formatImageUrl(img.imageUrl, baseUrl),
  }));
}
