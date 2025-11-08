import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Invoice, InvoiceDocument } from '../../../schemas';

export interface RevenueReportParams {
  startDate?: Date;
  endDate?: Date;
  groupBy: 'day' | 'week' | 'month';
}

export interface RevenueReportResult {
  period: string;
  totalRevenue: number;
  totalInvoices: number;
  averageOrderValue: number;
  date: Date;
}

@Injectable()
export class RevenueReportService {
  constructor(
    @InjectModel(Invoice.name) private invoiceModel: Model<InvoiceDocument>,
  ) {}

  async getRevenueReport(
    params: RevenueReportParams,
  ): Promise<RevenueReportResult[]> {
    const { startDate, endDate, groupBy } = params;

    const matchStage: any = {
      status: 'completed',
    };

    if (startDate || endDate) {
      matchStage.createdAt = {};
      if (startDate) matchStage.createdAt.$gte = startDate;
      if (endDate) matchStage.createdAt.$lte = endDate;
    }

    let groupFormat: any;
    let dateTrunc: any;

    switch (groupBy) {
      case 'day':
        groupFormat = '%Y-%m-%d';
        dateTrunc = {
          $dateTrunc: {
            date: '$createdAt',
            unit: 'day',
          },
        };
        break;
      case 'week':
        groupFormat = '%Y-W%U';
        dateTrunc = {
          $dateTrunc: {
            date: '$createdAt',
            unit: 'week',
          },
        };
        break;
      case 'month':
        groupFormat = '%Y-%m';
        dateTrunc = {
          $dateTrunc: {
            date: '$createdAt',
            unit: 'month',
          },
        };
        break;
    }

    const pipeline: any[] = [
      { $match: matchStage },
      {
        $group: {
          _id: dateTrunc,
          totalRevenue: { $sum: '$itemsSummary.grandTotal' },
          totalInvoices: { $sum: 1 },
          averageOrderValue: { $avg: '$itemsSummary.grandTotal' },
          date: { $first: '$createdAt' },
        },
      },
      {
        $addFields: {
          period: {
            $dateToString: {
              format: groupFormat,
              date: '$_id',
            },
          },
        },
      },
      {
        $sort: { date: 1 },
      },
      {
        $project: {
          _id: 0,
          period: 1,
          totalRevenue: 1,
          totalInvoices: 1,
          averageOrderValue: { $round: ['$averageOrderValue', 2] },
          date: 1,
        },
      },
    ];

    return await this.invoiceModel.aggregate(pipeline);
  }

  async getRevenueSummary(
    startDate?: Date,
    endDate?: Date,
  ): Promise<{
    totalRevenue: number;
    totalInvoices: number;
    averageOrderValue: number;
    period: string;
  }> {
    const matchStage: any = {
      status: 'completed',
    };

    if (startDate || endDate) {
      matchStage.createdAt = {};
      if (startDate) matchStage.createdAt.$gte = startDate;
      if (endDate) matchStage.createdAt.$lte = endDate;
    }

    const result = await this.invoiceModel.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$itemsSummary.grandTotal' },
          totalInvoices: { $sum: 1 },
          averageOrderValue: { $avg: '$itemsSummary.grandTotal' },
        },
      },
      {
        $project: {
          _id: 0,
          totalRevenue: 1,
          totalInvoices: 1,
          averageOrderValue: { $round: ['$averageOrderValue', 2] },
          period: {
            $cond: {
              if: { $and: [startDate, endDate] },
              then: `${startDate?.toISOString().split('T')[0]} to ${endDate?.toISOString().split('T')[0]}`,
              else: 'All time',
            },
          },
        },
      },
    ]);

    return (
      result[0] || {
        totalRevenue: 0,
        totalInvoices: 0,
        averageOrderValue: 0,
        period: 'No data',
      }
    );
  }
}
