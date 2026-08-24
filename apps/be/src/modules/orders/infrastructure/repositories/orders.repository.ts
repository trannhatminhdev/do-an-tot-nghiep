import { Injectable, BadRequestException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import {
  IOrderRepository,
  CreateOrderData,
  FindAllOrdersParams,
} from '../../application/interfaces/order-repository.interface';
import { PrismaService } from '../../../../core/database/prisma.service';
import { formatProductImages } from '../../../../shared/utils/image-url.util';

@Injectable()
export class OrdersRepository implements IOrderRepository {
  constructor(private readonly prisma: PrismaService) {}

  async createWithItems(data: CreateOrderData) {
    return this.prisma.$transaction(async (tx) => {
      // Create the order
      const order = await tx.order.create({
        data: {
          userId: data.userId,
          customerName: data.customerName,
          customerPhone: data.customerPhone,
          shippingAddress: data.shippingAddress,
          shippingMethod: data.shippingMethod,
          paymentMethod: data.paymentMethod,
          totalAmount: data.totalAmount,
          items: {
            create: data.items.map((item) => ({
              productId: item.productId,
              quantity: item.quantity,
              unitPrice: item.unitPrice,
            })),
          },
        },
        include: {
          items: true,
        },
      });

      // Update product stock
      for (const item of data.items) {
        const product = await tx.product.findUnique({
          where: { id: item.productId },
        });

        if (!product || product.stock < item.quantity) {
          throw new BadRequestException(
            `Product with ID ${item.productId} does not have enough stock.`,
          );
        }

        await tx.product.update({
          where: { id: item.productId },
          data: { stock: product.stock - item.quantity },
        });
      }

      return order;
    });
  }

  async findAll(params?: FindAllOrdersParams) {
    const where: Prisma.OrderWhereInput = {};
    if (params?.userId) {
      where.userId = params.userId;
    }
    if (params?.search) {
      const rawSearch = params.search.trim();
      const orConditions: Prisma.OrderWhereInput[] = [
        { customerName: { contains: rawSearch } },
        { customerPhone: { contains: rawSearch } },
      ];

      // Extract ID if user prefixed with '#', 'DH', 'MDH', 'ORDER', 'ORD', etc. (e.g. "#1024", "DH-1024", "# 1024")
      const cleanedIdStr = rawSearch
        .replace(/^[#\s]*(?:(?:DH|MDH|ORDER|ORD|DONHANG)[-_#\s]*)?/i, '')
        .replace(/^#+/, '')
        .trim();
      const idSearch = parseInt(cleanedIdStr, 10);
      if (
        !isNaN(idSearch) &&
        /^\d+$/.test(cleanedIdStr) &&
        idSearch <= 2147483647
      ) {
        orConditions.push({ id: idSearch });
      }

      // Also if search contains phone with spaces/dashes/dots (e.g. 0912 345 678), match with stripped phone digits
      const cleanPhoneDigits = rawSearch.replace(/\D/g, '');
      if (
        cleanPhoneDigits.length >= 4 &&
        cleanPhoneDigits !== rawSearch &&
        cleanPhoneDigits !== cleanedIdStr
      ) {
        orConditions.push({ customerPhone: { contains: cleanPhoneDigits } });
      }

      where.OR = orConditions;
    }

    const [data, total] = await Promise.all([
      this.prisma.order.findMany({
        where,
        include: {
          items: { include: { product: { include: { images: true } } } },
        },
        orderBy: { createdAt: 'desc' },
        skip: params?.skip ? Number(params.skip) : undefined,
        take: params?.take ? Number(params.take) : undefined,
      }),
      this.prisma.order.count({ where }),
    ]);

    const formattedData = data.map((order) => ({
      ...order,
      items: order.items.map((item) => ({
        ...item,
        product: item.product
          ? {
              ...item.product,
              images: formatProductImages(item.product.images),
            }
          : item.product,
      })),
    }));

    return { data: formattedData, total };
  }

  async findById(id: number) {
    const order = await this.prisma.order.findUnique({
      where: { id },
      include: {
        items: {
          include: {
            product: {
              include: {
                images: true,
              },
            },
          },
        },
      },
    });

    if (!order) return null;

    return {
      ...order,
      items: order.items.map((item) => ({
        ...item,
        product: item.product
          ? {
              ...item.product,
              images: formatProductImages(item.product.images),
            }
          : item.product,
      })),
    };
  }

  async updateStatus(id: number, status: string) {
    return this.prisma.order.update({
      where: { id },
      data: { status },
      include: { items: true },
    });
  }

  async hasUserPurchasedProduct(
    userId: number,
    productId: number,
  ): Promise<boolean> {
    const count = await this.prisma.order.count({
      where: {
        userId,
        status: { in: ['COMPLETED', 'DELIVERED'] },
        items: {
          some: { productId },
        },
      },
    });
    return count > 0;
  }

  async findPurchasedOrdersByPhone(phone: string, productId: number) {
    const rawPhone = phone.trim();
    const cleanDigits = rawPhone.replace(/\D/g, '');
    const normalizedPhone =
      cleanDigits.startsWith('84') && cleanDigits.length >= 10
        ? '0' + cleanDigits.slice(2)
        : cleanDigits;

    const orders = await this.prisma.order.findMany({
      where: {
        status: { not: 'CANCELLED' },
        items: {
          some: { productId },
        },
      },
      orderBy: { createdAt: 'asc' },
    });

    return orders.filter((order) => {
      const orderDigits = order.customerPhone.replace(/\D/g, '');
      const orderNorm =
        orderDigits.startsWith('84') && orderDigits.length >= 10
          ? '0' + orderDigits.slice(2)
          : orderDigits;

      return (
        orderNorm === normalizedPhone ||
        order.customerPhone.trim() === rawPhone ||
        (cleanDigits.length >= 8 && orderDigits === cleanDigits)
      );
    });
  }
}
