import { Module, Global } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { DatabaseService } from './database.service';
import {
  User,
  UserSchema,
  Crop,
  CropSchema,
  Market,
  MarketSchema,
  MandiPrice,
  MandiPriceSchema,
  CropLot,
  CropLotSchema,
  Bid,
  BidSchema,
  Transaction,
  TransactionSchema,
  Payment,
  PaymentSchema,
  Notification,
  NotificationSchema,
  AuditLog,
  AuditLogSchema,
} from './schemas';

const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/vanijya_db';

@Global()
@Module({
  imports: [
    MongooseModule.forRoot(uri, {
      serverSelectionTimeoutMS: 2000,
      connectTimeoutMS: 2000,
    }),
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Crop.name, schema: CropSchema },
      { name: Market.name, schema: MarketSchema },
      { name: MandiPrice.name, schema: MandiPriceSchema },
      { name: CropLot.name, schema: CropLotSchema },
      { name: Bid.name, schema: BidSchema },
      { name: Transaction.name, schema: TransactionSchema },
      { name: Payment.name, schema: PaymentSchema },
      { name: Notification.name, schema: NotificationSchema },
      { name: AuditLog.name, schema: AuditLogSchema },
    ]),
  ],
  providers: [DatabaseService],
  exports: [DatabaseService, MongooseModule],
})
export class DatabaseModule {}
