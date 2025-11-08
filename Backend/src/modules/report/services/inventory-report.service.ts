import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  InventoryLot,
  InventoryLotDocument,
  Product,
  ProductDocument,
  StockMovement,
  StockMovementDocument,
} from '../../../schemas';

export interface InventoryReportParams {
  lowStockThreshold?: number;
  expiryWarningDays?: number;
  category?: string;
}

export interface InventoryReportResult {
  product: {
    _id: string;
    name: string;
    sku: string;
    category: string;
    unit: string;
    price: number;
  };
  totalStock: number;
  totalValue: number;
  lotCount: number;
  lowStock: boolean;
  expiringSoon: boolean;
  nearestExpiry?: Date;
  averageCost: number;
}

@Injectable()
export class InventoryReportService {
  constructor(
    @InjectModel(InventoryLot.name)
    private inventoryLotModel: Model<InventoryLotDocument>,
    @InjectModel(Product.name) private productModel: Model<ProductDocument>,
    @InjectModel(StockMovement.name)
    private stockMovementModel: Model<StockMovementDocument>,
  ) {}

  async getCurrentInventoryReport(
    params: InventoryReportParams,
  ): Promise<InventoryReportResult[]> {
    const { lowStockThreshold = 10, expiryWarningDays = 3, category } = params;

    const matchStage: any = {
      quantityAvailable: { $gt: 0 },
    };

    if (category) {
      matchStage['productData.category'] = category;
    }

    const pipeline = [
      {
        $lookup: {
          from: 'products',
          localField: 'product',
          foreignField: '_id',
          as: 'productData',
        },
      },
      { $unwind: '$productData' },
      { $match: matchStage },
      {
        $group: {
          _id: '$product',
          product: { $first: '$productData' },
          totalStock: { $sum: '$quantityAvailable' },
          totalValue: {
            $sum: { $multiply: ['$quantityAvailable', '$costPerUnit'] },
          },
          lotCount: { $sum: 1 },
          averageCost: { $avg: '$costPerUnit' },
          nearestExpiry: { $min: '$expiryDate' },
        },
      },
      {
        $addFields: {
          lowStock: { $lt: ['$totalStock', lowStockThreshold] },
          expiringSoon: {
            $and: [
              { $ne: ['$nearestExpiry', null] },
              {
                $lte: [
                  '$nearestExpiry',
                  new Date(
                    Date.now() + expiryWarningDays * 24 * 60 * 60 * 1000,
                  ),
                ],
              },
            ],
          },
        },
      },
      {
        $project: {
          _id: 0,
          product: {
            _id: '$_id',
            name: '$product.name',
            sku: '$product.sku',
            category: '$product.category',
            unit: '$product.unit',
            price: '$product.price',
          },
          totalStock: 1,
          totalValue: 1,
          lotCount: 1,
          lowStock: 1,
          expiringSoon: 1,
          nearestExpiry: '$nearestExpiry',
          averageCost: { $round: ['$averageCost', 2] },
        },
      },
      { $sort: { totalValue: -1 } },
    ];

    return await this.inventoryLotModel.aggregate(pipeline as any);
  }

  async getLowStockReport(
    threshold: number = 10,
  ): Promise<InventoryReportResult[]> {
    const pipeline = [
      {
        $lookup: {
          from: 'products',
          localField: 'product',
          foreignField: '_id',
          as: 'productData',
        },
      },
      { $unwind: '$productData' },
      {
        $group: {
          _id: '$product',
          product: { $first: '$productData' },
          totalStock: { $sum: '$quantityAvailable' },
          totalValue: {
            $sum: { $multiply: ['$quantityAvailable', '$costPerUnit'] },
          },
          lotCount: { $sum: 1 },
          averageCost: { $avg: '$costPerUnit' },
        },
      },
      { $match: { totalStock: { $lt: threshold } } },
      {
        $project: {
          _id: 0,
          product: {
            _id: '$_id',
            name: '$product.name',
            sku: '$product.sku',
            category: '$product.category',
            unit: '$product.unit',
            price: '$product.price',
          },
          totalStock: 1,
          totalValue: 1,
          lotCount: 1,
          lowStock: true,
          expiringSoon: false,
          averageCost: { $round: ['$averageCost', 2] },
        },
      },
      { $sort: { totalStock: 1 } },
    ];

    return await this.inventoryLotModel.aggregate(pipeline as any);
  }

  async getExpiringSoonReport(
    days: number = 3,
  ): Promise<InventoryReportResult[]> {
    const expiryDate = new Date(Date.now() + days * 24 * 60 * 60 * 1000);

    const pipeline = [
      {
        $match: {
          expiryDate: { $lte: expiryDate, $ne: null },
          quantityAvailable: { $gt: 0 },
        },
      },
      {
        $lookup: {
          from: 'products',
          localField: 'product',
          foreignField: '_id',
          as: 'productData',
        },
      },
      { $unwind: '$productData' },
      {
        $group: {
          _id: '$product',
          product: { $first: '$productData' },
          totalStock: { $sum: '$quantityAvailable' },
          totalValue: {
            $sum: { $multiply: ['$quantityAvailable', '$costPerUnit'] },
          },
          lotCount: { $sum: 1 },
          averageCost: { $avg: '$costPerUnit' },
          nearestExpiry: { $min: '$expiryDate' },
        },
      },
      {
        $project: {
          _id: 0,
          product: {
            _id: '$_id',
            name: '$product.name',
            sku: '$product.sku',
            category: '$product.category',
            unit: '$product.unit',
            price: '$product.price',
          },
          totalStock: 1,
          totalValue: 1,
          lotCount: 1,
          lowStock: false,
          expiringSoon: true,
          nearestExpiry: '$nearestExpiry',
          averageCost: { $round: ['$averageCost', 2] },
        },
      },
      { $sort: { nearestExpiry: 1 } },
    ];

    return await this.inventoryLotModel.aggregate(pipeline as any);
  }

  async getStockMovementReport(
    startDate?: Date,
    endDate?: Date,
  ): Promise<
    {
      date: Date;
      type: string;
      product: string;
      quantity: number;
      reason: string;
      actor: string;
    }[]
  > {
    const matchStage: any = {};

    if (startDate || endDate) {
      matchStage.createdAt = {};
      if (startDate) matchStage.createdAt.$gte = startDate;
      if (endDate) matchStage.createdAt.$lte = endDate;
    }

    const pipeline = [
      { $match: matchStage },
      {
        $lookup: {
          from: 'products',
          localField: 'product',
          foreignField: '_id',
          as: 'productData',
        },
      },
      { $unwind: '$productData' },
      {
        $lookup: {
          from: 'admins',
          localField: 'actor',
          foreignField: '_id',
          as: 'actorData',
        },
      },
      { $unwind: '$actorData' },
      {
        $project: {
          _id: 0,
          date: '$createdAt',
          type: 1,
          product: '$productData.name',
          quantity: 1,
          reason: 1,
          actor: '$actorData.fullName',
        },
      },
      { $sort: { date: -1 } },
    ];

    return await this.stockMovementModel.aggregate(pipeline as any);
  }

  async getInventoryValueReport(): Promise<{
    totalValue: number;
    totalItems: number;
    categoryBreakdown: {
      category: string;
      value: number;
      percentage: number;
    }[];
  }> {
    const pipeline = [
      {
        $lookup: {
          from: 'products',
          localField: 'product',
          foreignField: '_id',
          as: 'productData',
        },
      },
      { $unwind: '$productData' },
      {
        $group: {
          _id: null,
          totalValue: {
            $sum: { $multiply: ['$quantityAvailable', '$costPerUnit'] },
          },
          totalItems: { $sum: '$quantityAvailable' },
          categories: {
            $push: {
              category: '$productData.category',
              value: { $multiply: ['$quantityAvailable', '$costPerUnit'] },
            },
          },
        },
      },
      {
        $unwind: '$categories',
      },
      {
        $group: {
          _id: '$categories.category',
          categoryValue: { $sum: '$categories.value' },
          totalValue: { $first: '$totalValue' },
          totalItems: { $first: '$totalItems' },
        },
      },
      {
        $project: {
          _id: 0,
          category: '$_id',
          value: '$categoryValue',
          percentage: {
            $multiply: [{ $divide: ['$categoryValue', '$totalValue'] }, 100],
          },
          totalValue: 1,
          totalItems: 1,
        },
      },
      { $sort: { value: -1 } },
    ];

    const result = await this.inventoryLotModel.aggregate(pipeline as any);

    if (result.length === 0) {
      return {
        totalValue: 0,
        totalItems: 0,
        categoryBreakdown: [],
      };
    }

    const totalValue = result[0].totalValue;
    const totalItems = result[0].totalItems;
    const categoryBreakdown = result.map((item) => ({
      category: item.category,
      value: item.value,
      percentage: Math.round(item.percentage * 100) / 100,
    }));

    return {
      totalValue,
      totalItems,
      categoryBreakdown,
    };
  }
}
