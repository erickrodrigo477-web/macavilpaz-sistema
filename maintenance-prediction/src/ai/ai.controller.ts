import { Controller, Get, Param } from '@nestjs/common';
import { AiService } from './ai.service';

@Controller('ai')
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Get('predict/:assetId')
  async predictAsset(@Param('assetId') assetId: string) {
    return await this.aiService.predictForAsset(parseInt(assetId));
  }
}
