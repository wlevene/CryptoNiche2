/**
 * 应用启动自动初始化服务
 * 基于 main.py 的 schedule 逻辑，应用启动时自动运行
 * 参考 crypto_crawler.py 的 get_all_cryptocurrencies 逻辑
 */

import { cryptoDataService } from './crypto-data-service';
import { schedulerConfig, validateConfig, getSchedulerStatus, formatInterval } from './config/scheduler.config';

class AppInitializer {
  private isInitialized = false;
  private initPromise: Promise<void> | null = null;

  /**
   * 应用启动时的自动初始化
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) {
      console.log('应用已经初始化完成');
      return;
    }

    if (this.initPromise) {
      console.log('正在初始化中，等待完成...');
      return this.initPromise;
    }

    this.initPromise = this.performInitialization();
    await this.initPromise;
  }

  private async performInitialization(): Promise<void> {
    try {
      console.log('🚀 开始应用初始化...');
      
      // 验证配置
      const configValidation = validateConfig();
      if (!configValidation.isValid) {
        console.error('❌ 配置验证失败:', configValidation.errors);
      }
      
      // 打印配置信息
      this.printConfiguration();

      // 1. 执行初始数据同步
      await this.performInitialDataSync();

      // 2. 启动自动数据同步（从配置读取）
      this.startAutoDataSync();

      this.isInitialized = true;
      console.log('✅ 应用初始化完成');

    } catch (error) {
      console.error('❌ 应用初始化失败:', error);
      // 不抛出错误，让应用继续运行，但标记为未初始化
      this.isInitialized = false;
      this.initPromise = null;
    }
  }
  
  /**
   * 打印当前配置
   */
  private printConfiguration(): void {
    console.log('📋 定时任务配置:');
    console.log('├─ 数据同步:', schedulerConfig.dataSync.enabled ? 
      `每 ${formatInterval(schedulerConfig.dataSync.intervalMinutes)} 同步 ${schedulerConfig.dataSync.maxCount} 条` : 
      '已禁用');
    console.log('├─ 价格聚合:', schedulerConfig.priceAggregation.enabled ? 
      `每 ${formatInterval(schedulerConfig.priceAggregation.intervalMinutes)} 执行` : 
      '已禁用');
    console.log('├─ 价格监控:', schedulerConfig.priceMonitor.enabled ? 
      `每 ${formatInterval(schedulerConfig.priceMonitor.intervalMinutes)} 检查` : 
      '已禁用');
    console.log('├─ 数据清理:', schedulerConfig.dataCleanup.enabled ? 
      `每 ${formatInterval(schedulerConfig.dataCleanup.intervalHours * 60)} 执行` : 
      '已禁用');
    console.log('└─ 市场数据:', schedulerConfig.marketData.enabled ? 
      `每 ${formatInterval(schedulerConfig.marketData.intervalMinutes)} 更新` : 
      '已禁用');
  }



  /**
   * 执行初始数据同步
   */
  private async performInitialDataSync(): Promise<void> {
    try {
      console.log('📥 开始初始数据同步...');
      
      // 在客户端环境中使用浏览器客户端
      let supabase;
      if (typeof window !== 'undefined') {
        const { createClient } = await import('./supabase-client');
        supabase = createClient();
      } else {
        // 服务器端使用服务器客户端
        const { createClient } = await import('./supabase-server');
        supabase = await createClient();
      }
      
      const { count } = await supabase
        .from('top_cryptocurrencies')
        .select('*', { count: 'exact', head: true });
      
      if (count && count > 0) {
        console.log(`ℹ️ 数据库已有 ${count} 条数据，跳过初始同步`);
        return;
      }
      
      // 如果没有数据，尝试从 API 获取
      console.log('数据库为空，尝试从 API 获取数据...');
      
      // 使用新的一次性获取所有数据的方法，设置较短的超时时间
      const result = await Promise.race([
        cryptoDataService.getAllCryptocurrenciesAndSave(),
        new Promise<{ success: false; error: string }>((resolve) => 
          setTimeout(() => resolve({ success: false, error: 'API timeout' }), 5000)
        )
      ]);
      
      if (result.success) {
         console.log(`✅ 初始同步完成: ${result.cryptoCount} 个币种数据已保存`);
       } else {
         console.log('⚠️ 初始数据同步失败，尝试使用测试数据:', result.error);
         // 如果 API 失败，使用测试数据
         await this.insertTestData();
       }
    } catch (error) {
      console.log('❌ 初始数据同步出错，尝试使用测试数据:', error);
      // 如果出错，使用测试数据
      await this.insertTestData();
    }
  }

  /**
   * 插入测试数据（当 API 不可用时）
   */
  private async insertTestData(): Promise<void> {
    try {
      // 在服务器端环境中，使用完整的 URL
      const baseUrl = process.env.NODE_ENV === 'production' 
        ? process.env.NEXT_PUBLIC_APP_URL || 'https://your-domain.com'
        : 'http://localhost:3000';
      
      const response = await fetch(`${baseUrl}/api/crypto/test-sync`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      const result = await response.json();
      
      if (result.success) {
        console.log('✅ 测试数据插入成功');
      } else {
        console.log('❌ 测试数据插入失败:', result.error);
      }
    } catch (error) {
      console.log('❌ 无法插入测试数据:', error);
    }
  }



  /**
   * 启动自动数据同步和价格历史聚合
   */
  private startAutoDataSync(): void {
    console.log('⏰ 启动自动定时任务...');

    // 启动自动数据同步（从配置读取）
    if (schedulerConfig.dataSync.enabled) {
      cryptoDataService.startAutoSync(
        schedulerConfig.dataSync.intervalMinutes,
        schedulerConfig.dataSync.maxCount
      );
      console.log(`✅ 自动数据同步已启动（每 ${formatInterval(schedulerConfig.dataSync.intervalMinutes)} 执行，每次 ${schedulerConfig.dataSync.maxCount} 条）`);
    } else {
      console.log('⏸️ 自动数据同步已禁用');
    }

    // 启动价格历史聚合（从配置读取）
    if (schedulerConfig.priceAggregation.enabled) {
      cryptoDataService.startPriceHistoryAggregation(
        schedulerConfig.priceAggregation.intervalMinutes
      );
      console.log(`✅ 价格历史聚合已启动（每 ${formatInterval(schedulerConfig.priceAggregation.intervalMinutes)} 执行）`);
    } else {
      console.log('⏸️ 价格历史聚合已禁用');
    }
    
    // 启动数据清理（如果启用）
    if (schedulerConfig.dataCleanup.enabled) {
      this.startDataCleanup();
      console.log(`✅ 数据清理已启动（每 ${formatInterval(schedulerConfig.dataCleanup.intervalHours * 60)} 执行）`);
    }
  }
  
  /**
   * 启动数据清理任务
   */
  private startDataCleanup(): void {
    setInterval(() => {
      console.log('🧹 执行数据清理...');
      cryptoDataService.cleanupOldPriceData(schedulerConfig.dataCleanup.priceDataRetentionDays);
    }, schedulerConfig.dataCleanup.intervalHours * 60 * 60 * 1000);
  }

  /**
   * 获取初始化状态
   */
  getStatus() {
    return {
      isInitialized: this.isInitialized,
      isInitializing: !!this.initPromise && !this.isInitialized,
    };
  }

  /**
   * 手动重新初始化
   */
  async reinitialize(): Promise<void> {
    console.log('🔄 手动重新初始化...');
    this.isInitialized = false;
    this.initPromise = null;
    await this.initialize();
  }
}

// 导出单例实例
export const appInitializer = new AppInitializer();

// 自动启动初始化（延迟启动避免阻塞应用启动）
// 根据配置决定是否自动初始化
// 只在运行时执行，不在构建时执行
if (typeof window === 'undefined' && 
    process.env.NODE_ENV !== 'production' && 
    process.env.NEXT_PHASE !== 'phase-production-build' &&
    schedulerConfig.dataSync.enabled) {
  // 确保有环境变量才执行
  if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    setTimeout(() => {
      console.log('⏳ 准备启动应用初始化...');
      appInitializer.initialize().catch(console.error);
    }, schedulerConfig.dataSync.initialDelayMs || 2000); // 使用配置的延迟时间
  }
}