import { Controller, Get, Patch, Param, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { PaymentsService } from './payments.service';
import { UpdatePaymentStatusDto } from './dto/update-payment-status.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Role } from '../database/schemas/enums';

@ApiTags('Payments & Settlement')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Get(':transactionId')
  @ApiOperation({ summary: 'Get payment status for a specific transaction' })
  @ApiResponse({ status: 200, description: 'Payment status returned' })
  @ApiResponse({ status: 404, description: 'Payment record not found' })
  getPayment(
    @Param('transactionId') transactionId: string,
    @CurrentUser('id') userId: string,
    @CurrentUser('role') role: Role,
  ) {
    return this.paymentsService.getPaymentByTransaction(transactionId, userId, role);
  }

  @Patch(':transactionId/status')
  @ApiOperation({ summary: 'Update payment status (PENDING -> INITIATED -> PAID / FAILED)' })
  @ApiResponse({ status: 200, description: 'Payment status updated' })
  updateStatus(
    @Param('transactionId') transactionId: string,
    @CurrentUser('id') userId: string,
    @CurrentUser('role') role: Role,
    @Body() dto: UpdatePaymentStatusDto,
  ) {
    return this.paymentsService.updatePaymentStatus(transactionId, userId, role, dto);
  }
}
