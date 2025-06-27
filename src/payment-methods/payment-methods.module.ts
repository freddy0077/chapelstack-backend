import { Module } from '@nestjs/common';
import { PaymentMethodResolver } from './payment-method.resolver';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [PaymentMethodResolver],
})
export class PaymentMethodsModule {}
