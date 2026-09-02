import { Controller, Get, Post, Patch, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { BidsService } from './bids.service';
import { CreateBidDto } from './dto/create-bid.dto';
import { UpdateBidQuantityDto } from './dto/update-bid-quantity.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Role } from '../database/schemas/enums';

@ApiTags('Bids & Bidding Desk')
@Controller()
export class BidsController {
  constructor(private readonly bidsService: BidsService) {}

  @Post('lots/:id/bids')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.BUYER, Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Place a bid on a crop lot (Buyers only)' })
  @ApiResponse({ status: 201, description: 'Bid placed successfully' })
  @ApiResponse({ status: 400, description: 'Invalid bid price/quantity or self-bidding' })
  createBid(
    @Param('id') lotId: string,
    @CurrentUser('id') buyerId: string,
    @Body() dto: CreateBidDto,
  ) {
    return this.bidsService.createBid(lotId, buyerId, dto);
  }

  @Get('lots/:id/bids')
  @ApiOperation({ summary: 'List all bids received on a specific crop lot' })
  @ApiResponse({ status: 200, description: 'List of lot bids returned' })
  getLotBids(@Param('id') lotId: string) {
    return this.bidsService.findBidsForLot(lotId);
  }

  @Get('bids/my')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current user bids' })
  @ApiResponse({ status: 200, description: 'User bids returned' })
  getMyBids(@CurrentUser('id') userId: string) {
    return this.bidsService.findMyBids(userId);
  }

  @Patch('bids/:id/quantity')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.BUYER, Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Modify quantity of a pending bid (Buyer only)' })
  @ApiResponse({ status: 200, description: 'Bid quantity modified successfully' })
  @ApiResponse({ status: 400, description: 'Cannot modify non-pending bid or invalid quantity' })
  updateBidQuantity(
    @Param('id') bidId: string,
    @CurrentUser('id') buyerId: string,
    @CurrentUser('role') userRole: Role,
    @Body() dto: UpdateBidQuantityDto,
  ) {
    return this.bidsService.modifyBidQuantity(bidId, buyerId, userRole, dto.quantity);
  }

  @Patch('bids/:id/cancel')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.BUYER, Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Cancel/withdraw a pending bid (Buyer only)' })
  @ApiResponse({ status: 200, description: 'Bid cancelled and marked WITHDRAWN' })
  @ApiResponse({ status: 400, description: 'Cannot cancel non-pending bid or sold lot bid' })
  cancelBid(
    @Param('id') bidId: string,
    @CurrentUser('id') buyerId: string,
    @CurrentUser('role') userRole: Role,
  ) {
    return this.bidsService.cancelBid(bidId, buyerId, userRole);
  }

  @Patch('bids/:id/accept')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.FARMER, Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Accept a bid (Farmer only) - Creates Transaction & Marks Lot SOLD' })
  @ApiResponse({ status: 200, description: 'Bid accepted and transaction created' })
  acceptBid(
    @Param('id') bidId: string,
    @CurrentUser('id') userId: string,
    @CurrentUser('role') userRole: Role,
  ) {
    return this.bidsService.acceptBid(bidId, userId, userRole);
  }

  @Patch('bids/:id/reject')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.FARMER, Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Reject a bid (Farmer only)' })
  @ApiResponse({ status: 200, description: 'Bid rejected' })
  rejectBid(
    @Param('id') bidId: string,
    @CurrentUser('id') userId: string,
    @CurrentUser('role') userRole: Role,
  ) {
    return this.bidsService.rejectBid(bidId, userId, userRole);
  }
}
