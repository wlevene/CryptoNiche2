/**
 * 数据格式化工具
 */

import { CONFIG } from '../config/constants';

/**
 * 数字格式化工具类
 */
export class NumberFormatter {
  /**
   * 格式化大数字显示
   */
  static formatLargeNumber(num: number): string {
    if (num >= CONFIG.FORMATTING.LARGE_NUMBER_THRESHOLDS.TRILLION) {
      return (num / CONFIG.FORMATTING.LARGE_NUMBER_THRESHOLDS.TRILLION).toFixed(1) + 'T';
    }
    if (num >= CONFIG.FORMATTING.LARGE_NUMBER_THRESHOLDS.BILLION) {
      return (num / CONFIG.FORMATTING.LARGE_NUMBER_THRESHOLDS.BILLION).toFixed(1) + 'B';
    }
    if (num >= CONFIG.FORMATTING.LARGE_NUMBER_THRESHOLDS.MILLION) {
      return (num / CONFIG.FORMATTING.LARGE_NUMBER_THRESHOLDS.MILLION).toFixed(1) + 'M';
    }
    if (num >= CONFIG.FORMATTING.LARGE_NUMBER_THRESHOLDS.THOUSAND) {
      return (num / CONFIG.FORMATTING.LARGE_NUMBER_THRESHOLDS.THOUSAND).toFixed(1) + 'K';
    }
    return num.toFixed(2);
  }

  /**
   * 格式化货币显示
   */
  static formatCurrency(value: number): string {
    if (value >= CONFIG.FORMATTING.LARGE_NUMBER_THRESHOLDS.TRILLION) {
      return `$${(value / CONFIG.FORMATTING.LARGE_NUMBER_THRESHOLDS.TRILLION).toFixed(2)}T`;
    }
    if (value >= CONFIG.FORMATTING.LARGE_NUMBER_THRESHOLDS.BILLION) {
      return `$${(value / CONFIG.FORMATTING.LARGE_NUMBER_THRESHOLDS.BILLION).toFixed(1)}B`;
    }
    if (value >= CONFIG.FORMATTING.LARGE_NUMBER_THRESHOLDS.MILLION) {
      return `$${(value / CONFIG.FORMATTING.LARGE_NUMBER_THRESHOLDS.MILLION).toFixed(1)}M`;
    }
    return `$${value.toLocaleString()}`;
  }

  /**
   * 格式化百分比显示
   */
  static formatPercentage(value: number): string {
    return `${value >= 0 ? '+' : ''}${value.toFixed(CONFIG.FORMATTING.DECIMAL_PLACES.PERCENTAGE)}%`;
  }

  /**
   * 格式化价格显示
   */
  static formatPrice(price: number): string {
    if (price >= 1) {
      return price.toFixed(2);
    }
    if (price >= 0.01) {
      return price.toFixed(4);
    }
    return price.toFixed(CONFIG.FORMATTING.DECIMAL_PLACES.PRICE);
  }

  /**
   * 安全的数字转换
   */
  static safeNumber(value: any, defaultValue = 0): number {
    const parsed = parseFloat(String(value));
    return isNaN(parsed) ? defaultValue : parsed;
  }

  /**
   * 安全的整数转换
   */
  static safeInteger(value: any, defaultValue = 0): number {
    const parsed = parseInt(String(value));
    return isNaN(parsed) ? defaultValue : parsed;
  }
}

/**
 * 日期格式化工具类
 */
export class DateFormatter {
  /**
   * 格式化相对时间
   */
  static formatRelativeTime(date: string | Date): string {
    const now = new Date();
    const targetDate = typeof date === 'string' ? new Date(date) : date;
    const diffMs = now.getTime() - targetDate.getTime();

    const diffSeconds = Math.floor(diffMs / 1000);
    const diffMinutes = Math.floor(diffSeconds / 60);
    const diffHours = Math.floor(diffMinutes / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffSeconds < 60) return '刚刚';
    if (diffMinutes < 60) return `${diffMinutes}分钟前`;
    if (diffHours < 24) return `${diffHours}小时前`;
    if (diffDays < 30) return `${diffDays}天前`;
    
    return targetDate.toLocaleDateString();
  }

  /**
   * 格式化ISO日期字符串
   */
  static formatISODate(date?: string | Date): string {
    const targetDate = date ? (typeof date === 'string' ? new Date(date) : date) : new Date();
    return targetDate.toISOString();
  }

  /**
   * 检查日期是否有效
   */
  static isValidDate(date: string | Date): boolean {
    const targetDate = typeof date === 'string' ? new Date(date) : date;
    return targetDate instanceof Date && !isNaN(targetDate.getTime());
  }
}

/**
 * 字符串格式化工具类
 */
export class StringFormatter {
  /**
   * 安全的字符串转换
   */
  static safeString(value: any, defaultValue = ''): string {
    return value != null ? String(value).trim() : defaultValue;
  }

  /**
   * 截断字符串
   */
  static truncate(str: string, maxLength: number, suffix = '...'): string {
    if (str.length <= maxLength) return str;
    return str.substring(0, maxLength - suffix.length) + suffix;
  }

  /**
   * 首字母大写
   */
  static capitalize(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  }

  /**
   * 生成slug
   */
  static generateSlug(str: string): string {
    return str
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  }
}

/**
 * 验证工具类
 */
export class ValidationHelper {
  /**
   * 验证加密货币ID
   */
  static isValidCryptoId(id: any): id is number {
    const numId = NumberFormatter.safeInteger(id);
    return numId > 0 && numId === parseInt(String(id));
  }

  /**
   * 验证价格数据
   */
  static isValidPrice(price: any): price is number {
    const numPrice = NumberFormatter.safeNumber(price);
    return numPrice >= 0 && isFinite(numPrice);
  }

  /**
   * 验证百分比数据
   */
  static isValidPercentage(value: any): value is number {
    const numValue = NumberFormatter.safeNumber(value);
    return isFinite(numValue);
  }

  /**
   * 验证邮箱格式
   */
  static isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
}