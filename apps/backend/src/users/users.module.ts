import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { PhotoStorageService } from './photo-storage.service';

@Module({
  controllers: [UsersController],
  providers: [UsersService, PhotoStorageService],
  exports: [UsersService, PhotoStorageService],
})
export class UsersModule {}
