import {
  formatImageUrl,
  formatProductImages,
} from '../../src/shared/utils/image-url.util';

describe('image-url.util', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...originalEnv };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  describe('formatImageUrl', () => {
    it('should return empty string for falsy input', () => {
      expect(formatImageUrl('')).toBe('');
      expect(formatImageUrl(null)).toBe('');
      expect(formatImageUrl(undefined)).toBe('');
    });

    it('should return absolute URLs unchanged', () => {
      expect(formatImageUrl('http://example.com/img.jpg')).toBe(
        'http://example.com/img.jpg',
      );
      expect(formatImageUrl('https://example.com/img.png')).toBe(
        'https://example.com/img.png',
      );
      expect(formatImageUrl('data:image/png;base64,123')).toBe(
        'data:image/png;base64,123',
      );
    });

    it('should format relative paths with custom baseUrl', () => {
      expect(
        formatImageUrl('/uploads/products/item.jpg', 'http://api.mysite.com'),
      ).toBe('http://api.mysite.com/uploads/products/item.jpg');
      expect(
        formatImageUrl('uploads/products/item.jpg', 'http://api.mysite.com/'),
      ).toBe('http://api.mysite.com/uploads/products/item.jpg');
    });

    it('should format relative paths using APP_URL env variable', () => {
      process.env.APP_URL = 'http://backend.test:8080';
      expect(formatImageUrl('/uploads/products/item.jpg')).toBe(
        'http://backend.test:8080/uploads/products/item.jpg',
      );
    });

    it('should fallback to BE_PORT or default port 3000', () => {
      delete process.env.APP_URL;
      process.env.BE_PORT = '4000';
      expect(formatImageUrl('/uploads/products/item.jpg')).toBe(
        'http://localhost:4000/uploads/products/item.jpg',
      );

      delete process.env.BE_PORT;
      expect(formatImageUrl('/uploads/products/item.jpg')).toBe(
        'http://localhost:3000/uploads/products/item.jpg',
      );
    });
  });

  describe('formatProductImages', () => {
    it('should format an array of product images', () => {
      const images = [
        {
          id: 1,
          imageUrl: '/uploads/products/img1.jpg',
          isThumbnail: true,
        },
        { id: 2, imageUrl: 'https://example.com/img2.jpg', isThumbnail: false },
      ];

      const result = formatProductImages(images, 'http://test.local');
      expect(result).toEqual([
        {
          id: 1,
          imageUrl: 'http://test.local/uploads/products/img1.jpg',
          isThumbnail: true,
        },
        {
          id: 2,
          imageUrl: 'https://example.com/img2.jpg',
          isThumbnail: false,
        },
      ]);
    });

    it('should handle non-array gracefully', () => {
      expect(formatProductImages(null)).toBeNull();
      expect(formatProductImages(undefined)).toBeUndefined();
    });
  });
});
