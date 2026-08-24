import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../core/database/prisma.service';
import {
  IProductRepository,
  ProductWithDetails,
} from '../../application/interfaces/product-repository.interface';
import {
  Product,
  ProductImage,
  ProductSpecification,
  Prisma,
} from '@prisma/client';
import {
  formatImageUrl,
  formatProductImages,
} from '../../../../shared/utils/image-url.util';

@Injectable()
export class ProductRepository implements IProductRepository {
  constructor(private readonly prisma: PrismaService) {}

  async createProduct(
    data: Prisma.ProductUncheckedCreateInput,
  ): Promise<Product> {
    return this.prisma.product.create({
      data,
    });
  }

  async findAllProducts(params?: {
    skip?: number;
    take?: number;
    search?: string;
    categoryId?: number;
  }): Promise<{ data: ProductWithDetails[]; total: number }> {
    const { skip, take, search, categoryId } = params || {};

    const where = {
      ...(categoryId ? { categoryId } : {}),
      ...(search ? { name: { contains: search } } : {}), // Dùng contains cho SQLite
    };

    const [data, total] = await Promise.all([
      this.prisma.product.findMany({
        skip,
        take,
        where,
        include: {
          category: true,
          images: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
      }),
      this.prisma.product.count({ where }),
    ]);

    const formattedData = data.map((product) => ({
      ...product,
      images: formatProductImages(product.images),
    }));

    return { data: formattedData, total };
  }

  async findProductById(id: number): Promise<ProductWithDetails | null> {
    const product = await this.prisma.product.findUnique({
      where: { id },
      include: {
        category: true,
        images: true,
        specifications: true,
      },
    });

    if (!product) return null;

    return {
      ...product,
      images: formatProductImages(product.images),
    };
  }

  async updateProduct(
    id: number,
    data: Prisma.ProductUncheckedUpdateInput,
  ): Promise<Product> {
    return this.prisma.product.update({
      where: { id },
      data,
    });
  }

  async deleteProduct(id: number): Promise<void> {
    await this.prisma.product.delete({
      where: { id },
    });
  }

  async addImage(
    productId: number,
    data: { imageUrl: string; isThumbnail?: boolean },
  ): Promise<ProductImage> {
    const created = await this.prisma.productImage.create({
      data: {
        productId,
        imageUrl: formatImageUrl(data.imageUrl),
        isThumbnail: data.isThumbnail || false,
      },
    });
    return {
      ...created,
      imageUrl: formatImageUrl(created.imageUrl),
    };
  }

  async deleteImage(imageId: number): Promise<void> {
    await this.prisma.productImage.delete({
      where: { id: imageId },
    });
  }

  async setThumbnail(productId: number, imageId: number): Promise<void> {
    // 1. Reset all thumbnails for this product to false
    await this.prisma.productImage.updateMany({
      where: { productId },
      data: { isThumbnail: false },
    });

    // 2. Set the target image to true
    await this.prisma.productImage.update({
      where: { id: imageId },
      data: { isThumbnail: true },
    });
  }

  async findImagesByProductId(productId: number): Promise<ProductImage[]> {
    const images = await this.prisma.productImage.findMany({
      where: { productId },
    });
    return formatProductImages(images);
  }

  async addSpecification(
    productId: number,
    data: { specName: string; specValue: string },
  ): Promise<ProductSpecification> {
    return this.prisma.productSpecification.create({
      data: {
        productId,
        specName: data.specName,
        specValue: data.specValue,
      },
    });
  }

  async deleteSpecification(specId: number): Promise<void> {
    await this.prisma.productSpecification.delete({
      where: { id: specId },
    });
  }
}
