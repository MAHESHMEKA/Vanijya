import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AdminService } from './admin.service';
import { TransactionsService } from '../transactions/transactions.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Role } from '@prisma/client';

@ApiTags('Admin Command & Monitoring')
@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
@ApiBearerAuth()
export class AdminController {
  constructor(
    private readonly adminService: AdminService,
    private readonly transactionsService: TransactionsService,
  ) {}

  @Get('dashboard')
  @ApiOperation({ summary: 'Get unified marketplace KPI statistics and overview metrics' })
  @ApiResponse({ status: 200, description: 'Admin statistics returned' })
  getDashboardStats() {
    return this.adminService.getDashboardStats();
  }

  @Get('lots')
  @ApiOperation({ summary: 'Monitor all crop lots with filters (crop, status, farmer)' })
  @ApiResponse({ status: 200, description: 'All lots returned for admin inspection' })
  getLots(@Query() query: any) {
    return this.adminService.getAllLots(query);
  }

  @Get('bids')
  @ApiOperation({ summary: 'Monitor all bidding activity with status filters' })
  @ApiResponse({ status: 200, description: 'All bids returned for admin inspection' })
  getBids(@Query() query: any) {
    return this.adminService.getAllBids(query);
  }

  @Get('users')
  @ApiOperation({ summary: 'Monitor farmer and buyer directories with volume statistics' })
  @ApiResponse({ status: 200, description: 'Users directory returned' })
  getUsers() {
    return this.adminService.getUsers();
  }

  @Get('transactions')
  @ApiOperation({ summary: 'Monitor all transactions and purchase contracts' })
  @ApiResponse({ status: 200, description: 'All transactions returned' })
  getTransactions(@CurrentUser('id') userId: string, @CurrentUser('role') role: Role) {
    return this.transactionsService.findAll(userId, role);
  }

  @Get('activity')
  @ApiOperation({ summary: 'Get real-time audit activity feed' })
  @ApiResponse({ status: 200, description: 'Live audit log returned' })
  getActivity(@Query('limit') limit?: number) {
    return this.adminService.getActivityFeed(limit ? Number(limit) : 50);
  }
}
