import { Test, TestingModule } from '@nestjs/testing';
import { OrdersRepository } from '../../src/modules/orders/infrastructure/repositories/orders.repository';
import { PrismaService } from '../../src/core/database/prisma.service';

describe('OrdersRepository', () => {
  let repository: OrdersRepository;
  let prisma: {
    order: {
      findMany: jest.Mock;
      count: jest.Mock;
      findUnique: jest.Mock;
      update: jest.Mock;
    };
    $transaction: jest.Mock;
  };

  beforeEach(async () => {
    prisma = {
      order: {
        findMany: jest.fn().mockResolvedValue([]),
        count: jest.fn().mockResolvedValue(0),
        findUnique: jest.fn(),
        update: jest.fn(),
      },
      $transaction: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrdersRepository,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    repository = module.get<OrdersRepository>(OrdersRepository);
  });

  it('should be defined', () => {
    expect(repository).toBeDefined();
  });

  describe('findAll', () => {
    it('should correctly build where conditions when searching by #1024', async () => {
      prisma.order.findMany.mockResolvedValue([
        {
          id: 1024,
          customerName: 'Nguyen Van A',
          customerPhone: '0912345678',
          items: [],
        },
      ]);
      prisma.order.count.mockResolvedValue(1);

      const result = await repository.findAll({ search: '#1024' });

      expect(prisma.order.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            OR: [
              { customerName: { contains: '#1024' } },
              { customerPhone: { contains: '#1024' } },
              { id: 1024 },
            ],
          },
        }),
      );
      expect(result.total).toBe(1);
      expect(result.data[0].id).toBe(1024);
    });

    it('should correctly handle search with DH-1024 prefix', async () => {
      await repository.findAll({ search: 'DH-1024' });

      expect(prisma.order.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            OR: [
              { customerName: { contains: 'DH-1024' } },
              { customerPhone: { contains: 'DH-1024' } },
              { id: 1024 },
            ],
          },
        }),
      );
    });

    it('should correctly handle search with formatted phone number', async () => {
      await repository.findAll({ search: '0912 345 678' });

      expect(prisma.order.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            OR: [
              { customerName: { contains: '0912 345 678' } },
              { customerPhone: { contains: '0912 345 678' } },
              { customerPhone: { contains: '0912345678' } },
            ],
          },
        }),
      );
    });
  });
});
