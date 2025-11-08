export enum Gender {
  MALE = 'male',
  FEMALE = 'female',
  OTHER = 'other',
}

export enum ProductStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
}

export enum StockMovementType {
  IN = 'IN',
  OUT = 'OUT',
  ADJUST = 'ADJUST',
}

export enum StockMovementReason {
  PURCHASE = 'PURCHASE',
  SALE = 'SALE',
  WASTE = 'WASTE',
  ADJUSTMENT = 'ADJUSTMENT',
}

export enum PaymentMethod {
  CASH = 'cash',
}

export enum InvoiceStatus {
  COMPLETED = 'completed',
  VOID = 'void',
}

export enum PromotionType {
  PERCENT = 'PERCENT',
  AMOUNT = 'AMOUNT',
  POINT_MULTIPLIER = 'POINT_MULTIPLIER',
}

export enum PromotionScope {
  ORDER = 'ORDER',
  ITEM = 'ITEM',
}

export enum LoyaltyLedgerType {
  EARN = 'EARN',
  REDEEM = 'REDEEM',
  ADJUST = 'ADJUST',
}
