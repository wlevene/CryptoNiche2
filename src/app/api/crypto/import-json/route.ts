/**
 * 从Python爬取的JSON文件导入加密货币数据
 * 重构后的简化版本
 */

import { NextRequest, NextResponse } from 'next/server';
import { JsonImportService } from '@/lib/services/import/json-import-service';
import { ErrorHandler } from '@/lib/utils/error-handler';
import { logger } from '@/lib/utils/logger';

export async function POST(request: NextRequest) {
  try {
    logger.info('Starting JSON import API endpoint');
    
    const importService = new JsonImportService();
    const result = await importService.importFromJson();
    
    // 验证导入结果
    const isValid = await importService.validateImportResult(result);
    if (!isValid) {
      logger.warn('Import validation failed', result);
    }
    
    logger.info('JSON import completed successfully', result);
    
    return NextResponse.json({
      success: true,
      message: 'JSON数据导入成功',
      data: result
    });

  } catch (error) {
    const appError = ErrorHandler.handle(error, 'JSON import API');
    logger.error('JSON import API failed', appError);
    
    return NextResponse.json(
      ErrorHandler.toApiResponse(appError),
      { status: appError.statusCode }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'JSON数据导入接口',
    usage: 'POST /api/crypto/import-json',
    description: '从Python爬取的all_cryptocurrencies.json导入数据到数据库',
    version: '2.0 - 重构版本'
  });
}