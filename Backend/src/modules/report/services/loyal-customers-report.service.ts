import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  Invoice,
  InvoiceDocument,
  Customer,
  CustomerDocument,
} from '../../../schemas';

export interface LoyalCustomersReportParams {
  startDate?: Date;
  endDate?: Date;
  limit?: number;
  minOrderCount?: number;
  minTotalSpent?: number;
}

export interface LoyalCustomersReportResult {
  customer: {
    _id: string;
    fullName: string;
    phone: string;
    loyaltyPoints: number;
    loyaltyTier?: string;
  };
  totalSpent: number;
  totalOrders: number;
  averageOrderValue: number;
  lastOrderDate: Date;
  loyaltyPointsEarned: number;
}

@Injectable()
export class LoyalCustomersReportService {
  constructor(
    @InjectModel(Invoice.name) private invoiceModel: Model<InvoiceDocument>,
    @InjectModel(Customer.name) private customerModel: Model<CustomerDocument>,
  ) {}

  async getLoyalCustomersReport(
    params: LoyalCustomersReportParams,
  ): Promise<LoyalCustomersReportResult[]> {
    const {
      startDate,
      endDate,
      limit = 10,
      minOrderCount = 1,
      minTotalSpent = 0,
    } = params;

    const matchStage: any = {
      status: 'completed',
      customer: { $exists: true, $ne: null },
    };

    if (startDate || endDate) {
      matchStage.createdAt = {};
      if (startDate) matchStage.createdAt.$gte = startDate;
      if (endDate) matchStage.createdAt.$lte = endDate;
    }

    const pipeline = [
      { $match: matchStage },
      {
        $lookup: {
          from: 'customers',
          localField: 'customer',
          foreignField: '_id',
          as: 'customerData',
        },
      },
      { $unwind: '$customerData' },
      {
        $group: {
          _id: '$customer',
          customer: { $first: '$customerData' },
          totalSpent: { $sum: '$itemsSummary.grandTotal' },
          totalOrders: { $sum: 1 },
          averageOrderValue: { $avg: '$itemsSummary.grandTotal' },
          lastOrderDate: { $max: '$createdAt' },
          loyaltyPointsEarned: {
            $sum: { $divide: ['$itemsSummary.grandTotal', 1000] },
          },
        },
      },
      {
        $match: {
          totalOrders: { $gte: minOrderCount },
          totalSpent: { $gte: minTotalSpent },
        },
      },
      {
        $project: {
          _id: 0,
          customer: {
            _id: '$_id',
            fullName: '$customer.fullName',
            phone: '$customer.phone',
            loyaltyPoints: '$customer.loyaltyPoints',
            loyaltyTier: '$customer.loyaltyTier',
          },
          totalSpent: 1,
          totalOrders: 1,
          averageOrderValue: { $round: ['$averageOrderValue', 2] },
          lastOrderDate: 1,
          loyaltyPointsEarned: { $floor: '$loyaltyPointsEarned' },
        },
      },
      { $sort: { totalSpent: -1 } },
      { $limit: limit },
    ];

    return await this.invoiceModel.aggregate(pipeline as any);
  }

  async getCustomerSegmentation(): Promise<
    {
      segment: string;
      count: number;
      totalSpent: number;
      averageSpent: number;
      criteria: string;
    }[]
  > {
    const pipeline = [
      {
        $match: {
          status: 'completed',
          customer: { $exists: true, $ne: null },
        },
      },
      {
        $lookup: {
          from: 'customers',
          localField: 'customer',
          foreignField: '_id',
          as: 'customerData',
        },
      },
      { $unwind: '$customerData' },
      {
        $group: {
          _id: '$customer',
          customer: { $first: '$customerData' },
          totalSpent: { $sum: '$itemsSummary.grandTotal' },
          totalOrders: { $sum: 1 },
        },
      },
      {
        $addFields: {
          segment: {
            $switch: {
              branches: [
                {
                  case: { $gte: ['$totalSpent', 1000000] },
                  then: 'VIP',
                },
                {
                  case: { $gte: ['$totalSpent', 500000] },
                  then: 'Gold',
                },
                {
                  case: { $gte: ['$totalSpent', 200000] },
                  then: 'Silver',
                },
                {
                  case: { $gte: ['$totalSpent', 50000] },
                  then: 'Bronze',
                },
              ],
              default: 'New',
            },
          },
        },
      },
      {
        $group: {
          _id: '$segment',
          count: { $sum: 1 },
          totalSpent: { $sum: '$totalSpent' },
          averageSpent: { $avg: '$totalSpent' },
        },
      },
      {
        $addFields: {
          criteria: {
            $switch: {
              branches: [
                {
                  case: { $eq: ['$_id', 'VIP'] },
                  then: 'Spent >= 1,000,000 VND',
                },
                {
                  case: { $eq: ['$_id', 'Gold'] },
                  then: 'Spent >= 500,000 VND',
                },
                {
                  case: { $eq: ['$_id', 'Silver'] },
                  then: 'Spent >= 200,000 VND',
                },
                {
                  case: { $eq: ['$_id', 'Bronze'] },
                  then: 'Spent >= 50,000 VND',
                },
              ],
              default: 'Spent < 50,000 VND',
            },
          },
        },
      },
      {
        $project: {
          _id: 0,
          segment: '$_id',
          count: 1,
          totalSpent: 1,
          averageSpent: { $round: ['$averageSpent', 2] },
          criteria: 1,
        },
      },
      { $sort: { totalSpent: -1 } },
    ];

    return await this.invoiceModel.aggregate(pipeline as any);
  }

  async getCustomerLoyaltyPointsReport(): Promise<
    {
      customer: {
        _id: string;
        fullName: string;
        phone: string;
        loyaltyPoints: number;
        loyaltyTier?: string;
      };
      totalEarned: number;
      totalRedeemed: number;
      currentBalance: number;
      lastActivity: Date;
    }[]
  > {
    const pipeline = [
      {
        $lookup: {
          from: 'customers',
          localField: 'customer',
          foreignField: '_id',
          as: 'customerData',
        },
      },
      { $unwind: '$customerData' },
      {
        $group: {
          _id: '$customer',
          customer: { $first: '$customerData' },
          totalEarned: {
            $sum: {
              $cond: [{ $eq: ['$type', 'EARN'] }, '$points', 0],
            },
          },
          totalRedeemed: {
            $sum: {
              $cond: [{ $eq: ['$type', 'REDEEM'] }, { $abs: '$points' }, 0],
            },
          },
          lastActivity: { $max: '$createdAt' },
        },
      },
      {
        $addFields: {
          currentBalance: '$customer.loyaltyPoints',
        },
      },
      {
        $project: {
          _id: 0,
          customer: {
            _id: '$_id',
            fullName: '$customer.fullName',
            phone: '$customer.phone',
            loyaltyPoints: '$customer.loyaltyPoints',
            loyaltyTier: '$customer.loyaltyTier',
          },
          totalEarned: 1,
          totalRedeemed: 1,
          currentBalance: 1,
          lastActivity: 1,
        },
      },
      { $sort: { currentBalance: -1 } },
    ];

    return await this.invoiceModel.aggregate(pipeline as any);
  }
}
