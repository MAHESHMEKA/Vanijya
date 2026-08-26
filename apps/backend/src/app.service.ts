import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHealth() {
    return {
      status: 'ok',
      service: 'vanijya-backend',
      timestamp: new Date().toISOString(),
      sihProblemStatement: '26132 - Strengthening Market Linkages & Price Discovery for Farmers',
    };
  }
}
