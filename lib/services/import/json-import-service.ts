/**
 * JSON数据导入服务
 */

import fs from 'fs';
import path from 'path';
import { CryptoAdminRepository } from '../database/crypto-admin-repository';
import { DataTransformer } from './data-transformer';
import type { ImportProgress } from '@/lib/types/crypto';
import { ErrorHandler, ValidationError } from '@/lib/utils/error-handler';
import { DateFormatter } from '@/lib/utils/formatters';
import { logger } from '@/lib/utils/logger';

export class JsonImportService {
  private cryptoAdminRepository: CryptoAdminRepository;

  constructor() {
    this.cryptoAdminRepository = new CryptoAdminRepository();
  }

  /**
   * 从JSON文件导入加密货币数据
   */
  async importFromJson(filePath?: string): Promise<ImportProgress> {
    return ErrorHandler.withErrorHandling('importFromJson', async () => {
      const jsonPath = filePath || path.join(process.cwd(), '../data/all_cryptocurrencies.json');
      
      // 检查文件是否存在
      if (!fs.existsSync(jsonPath)) {
        throw new ValidationError(`JSON file not found: ${jsonPath}`, { filePath: jsonPath });
      }

      // 读取JSON文件
      const rawData = await this.readJsonFile(jsonPath);
      logger.info('JSON file loaded successfully', { path: jsonPath });

      // 转换数据格式
      const { cryptoData, priceData } = DataTransformer.transformBatchData(rawData);
      logger.info('Data transformation completed', {
        cryptoCount: cryptoData.length,
        priceCount: priceData.length,
      });

      // 导入数据到数据库
      const importedCryptos = await this.cryptoAdminRepository.upsertCryptocurrencies(cryptoData);
      const importedPrices = await this.cryptoAdminRepository.insertPriceData(priceData);

      const result: ImportProgress = {
        totalProcessed: cryptoData.length,
        cryptoCount: importedCryptos,
        priceCount: importedPrices,
        timestamp: DateFormatter.formatISODate(),
      };

      logger.info('JSON import completed', result);
      return result;
    });
  }

  /**
   * 读取JSON文件
   */
  private async readJsonFile(filePath: string): Promise<Record<string, RawJsonCrypto>> {
    return ErrorHandler.withErrorHandling('readJsonFile', async () => {
      const fileContent = fs.readFileSync(filePath, 'utf8');
      const jsonData = JSON.parse(fileContent);
      
      if (!jsonData || typeof jsonData !== 'object') {
        throw new ValidationError('Invalid JSON format', { filePath });
      }

      return jsonData;
    });
  }


  /**
   * 验证导入结果
   */
  async validateImportResult(result: ImportProgress): Promise<boolean> {
    return ErrorHandler.withErrorHandling('validateImportResult', async () => {
      if (result.totalProcessed === 0) {
        logger.warn('No data was processed during import');
        return false;
      }

      if (result.cryptoCount === 0) {
        logger.warn('No cryptocurrencies were imported');
        return false;
      }

      const stats = await this.cryptoAdminRepository.getDatabaseStats();
      
      logger.info('Import validation completed', {
        importedCryptos: result.cryptoCount,
        totalInDatabase: stats.totalCryptocurrencies,
        activeInDatabase: stats.activeCryptocurrencies,
      });

      return stats.activeCryptocurrencies > 0;
    });
  }
}