import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  InvoiceItem,
  InvoiceItemDocument,
  Product,
  ProductDocument,
} from '../../../schemas';

export interface TopProductsReportParams {
  startDate?: Date;
  endDate?: Date;
  limit?: number;
  category?: string;
}

export interface TopProductsReportResult {
  product: {
    _id: string;
    name: string;
    sku: string;
    category: string;
    unit: string;
    price: number;
  };
  totalQuantitySold: number;
  totalRevenue: number;
  totalOrders: number;
  averageOrderQuantity: number;
}

@Injectable()
export class TopProductsReportService {
  constructor(
    @InjectModel(InvoiceItem.name)
    private invoiceItemModel: Model<InvoiceItemDocument>,
    @InjectModel(Product.name) private productModel: Model<ProductDocument>,
  ) {}

  async getTopProductsReport(
    params: TopProductsReportParams,
  ): Promise<TopProductsReportResult[]> {
    const { startDate, endDate, limit = 10, category } = params;

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
          from: 'invoices',
          localField: 'invoice',
          foreignField: '_id',
          as: 'invoiceData',
        },
      },
      { $unwind: '$invoiceData' },
      { $match: { 'invoiceData.status': 'completed' } },
      {
        $lookup: {
          from: 'products',
          localField: 'product',
          foreignField: '_id',
          as: 'productData',
        },
      },
      { $unwind: '$productData' },
      ...(category ? [{ $match: { 'productData.category': category } }] : []),
      {
        $group: {
          _id: '$product',
          product: { $first: '$productData' },
          totalQuantitySold: { $sum: '$quantity' },
          totalRevenue: { $sum: '$lineTotal' },
          totalOrders: { $sum: 1 },
          averageOrderQuantity: { $avg: '$quantity' },
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
          totalQuantitySold: 1,
          totalRevenue: 1,
          totalOrders: 1,
          averageOrderQuantity: { $round: ['$averageOrderQuantity', 2] },
        },
      },
      { $sort: { totalQuantitySold: -1 } },
      { $limit: limit },
    ];

    return await this.invoiceItemModel.aggregate(pipeline as any);
  }

  async getTopProductsByRevenue(
    params: TopProductsReportParams,
  ): Promise<TopProductsReportResult[]> {
    const { startDate, endDate, limit = 10, category } = params;

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
          from: 'invoices',
          localField: 'invoice',
          foreignField: '_id',
          as: 'invoiceData',
        },
      },
      { $unwind: '$invoiceData' },
      { $match: { 'invoiceData.status': 'completed' } },
      {
        $lookup: {
          from: 'products',
          localField: 'product',
          foreignField: '_id',
          as: 'productData',
        },
      },
      { $unwind: '$productData' },
      ...(category ? [{ $match: { 'productData.category': category } }] : []),
      {
        $group: {
          _id: '$product',
          product: { $first: '$productData' },
          totalQuantitySold: { $sum: '$quantity' },
          totalRevenue: { $sum: '$lineTotal' },
          totalOrders: { $sum: 1 },
          averageOrderQuantity: { $avg: '$quantity' },
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
          totalQuantitySold: 1,
          totalRevenue: 1,
          totalOrders: 1,
          averageOrderQuantity: { $round: ['$averageOrderQuantity', 2] },
        },
      },
      { $sort: { totalRevenue: -1 } },
      { $limit: limit },
    ];

    return await this.invoiceItemModel.aggregate(pipeline as any);
  }

  async getCategorySalesReport(
    startDate?: Date,
    endDate?: Date,
  ): Promise<
    {
      category: string;
      totalQuantitySold: number;
      totalRevenue: number;
      productCount: number;
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
          from: 'invoices',
          localField: 'invoice',
          foreignField: '_id',
          as: 'invoiceData',
        },
      },
      { $unwind: '$invoiceData' },
      { $match: { 'invoiceData.status': 'completed' } },
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
          _id: '$productData.category',
          totalQuantitySold: { $sum: '$quantity' },
          totalRevenue: { $sum: '$lineTotal' },
          productCount: { $addToSet: '$product' },
        },
      },
      {
        $project: {
          _id: 0,
          category: '$_id',
          totalQuantitySold: 1,
          totalRevenue: 1,
          productCount: { $size: '$productCount' },
        },
      },
      { $sort: { totalRevenue: -1 } },
    ];

    return await this.invoiceItemModel.aggregate(pipeline as any);
  }
}
