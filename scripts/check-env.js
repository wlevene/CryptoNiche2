#!/usr/bin/env node

/**
 * 环境配置检查脚本
 * 用于验证所有必需的环境变量是否正确配置
 */

const fs = require('fs');
const path = require('path');

// 颜色输出
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logSection(title) {
  console.log('\n' + '='.repeat(50));
  log(title, 'cyan');
  console.log('='.repeat(50) + '\n');
}

function logSuccess(message) {
  log(`✅ ${message}`, 'green');
}

function logError(message) {
  log(`❌ ${message}`, 'red');
}

function logWarning(message) {
  log(`⚠️  ${message}`, 'yellow');
}

function logInfo(message) {
  log(`ℹ️  ${message}`, 'blue');
}

// 检查 .env.local 是否存在
function checkEnvFileExists() {
  logSection('检查环境文件');

  const envPath = path.join(process.cwd(), '.env.local');
  const envExamplePath = path.join(process.cwd(), '.env.example');

  if (fs.existsSync(envPath)) {
    logSuccess('.env.local 文件存在');
    return true;
  } else {
    logError('.env.local 文件不存在');

    if (fs.existsSync(envExamplePath)) {
      logInfo('发现 .env.example 文件');
      logInfo('请运行: cp .env.example .env.local');
    }

    return false;
  }
}

// 读取环境变量
function loadEnvFile() {
  const envPath = path.join(process.cwd(), '.env.local');

  try {
    const content = fs.readFileSync(envPath, 'utf-8');
    const env = {};

    content.split('\n').forEach(line => {
      line = line.trim();

      // 跳过注释和空行
      if (!line || line.startsWith('#')) return;

      const [key, ...valueParts] = line.split('=');
      if (key && valueParts.length > 0) {
        env[key.trim()] = valueParts.join('=').trim();
      }
    });

    return env;
  } catch (error) {
    logError(`读取 .env.local 失败: ${error.message}`);
    return null;
  }
}

// 检查必需的环境变量
function checkRequiredEnvVars(env) {
  logSection('检查必需的环境变量');

  const required = [
    {
      key: 'NEXT_PUBLIC_API_BASE_URL',
      description: '后端 API 基础地址',
      example: 'http://localhost:8888',
    },
  ];

  const optional = [
    {
      key: 'COINMARKETCAP_API_KEY',
      description: 'CoinMarketCap API 密钥',
      example: 'your_api_key',
    },
    {
      key: 'RESEND_API_KEY',
      description: 'Resend API 密钥（邮件服务）',
      example: 'your_resend_key',
    },
  ];

  let hasErrors = false;

  // 检查必需变量
  log('\n必需的环境变量:', 'bright');
  required.forEach(({ key, description, example }) => {
    if (env[key]) {
      logSuccess(`${key}: ${env[key]}`);
      logInfo(`  说明: ${description}`);
    } else {
      logError(`${key}: 未配置`);
      logInfo(`  说明: ${description}`);
      logInfo(`  示例: ${example}`);
      hasErrors = true;
    }
  });

  // 检查可选变量
  log('\n可选的环境变量:', 'bright');
  optional.forEach(({ key, description, example }) => {
    if (env[key]) {
      logSuccess(`${key}: ${env[key]}`);
    } else {
      logWarning(`${key}: 未配置（可选）`);
      logInfo(`  说明: ${description}`);
    }
  });

  return !hasErrors;
}

// 检查废弃的 Supabase 配置
function checkDeprecatedVars(env) {
  logSection('检查废弃的配置');

  const deprecated = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    'SUPABASE_SERVICE_ROLE_KEY',
  ];

  let foundDeprecated = false;

  deprecated.forEach(key => {
    if (env[key]) {
      logWarning(`${key}: 已废弃，可以删除`);
      foundDeprecated = true;
    }
  });

  if (!foundDeprecated) {
    logSuccess('没有发现废弃的配置');
  } else {
    logInfo('\n这些变量在新架构中不再需要，可以安全删除');
  }
}

// 验证 API URL 格式
function validateApiUrl(env) {
  logSection('验证 API 配置');

  const apiUrl = env['NEXT_PUBLIC_API_BASE_URL'];

  if (!apiUrl) {
    logError('NEXT_PUBLIC_API_BASE_URL 未配置');
    return false;
  }

  try {
    const url = new URL(apiUrl);

    logSuccess(`API URL 格式正确: ${apiUrl}`);
    logInfo(`  协议: ${url.protocol}`);
    logInfo(`  主机: ${url.hostname}`);
    logInfo(`  端口: ${url.port || '默认'}`);

    // 检查是否是本地开发
    if (url.hostname === 'localhost' || url.hostname === '127.0.0.1') {
      logInfo('  环境: 本地开发');
    } else {
      logInfo('  环境: 远程服务器');
    }

    return true;
  } catch (error) {
    logError(`API URL 格式错误: ${error.message}`);
    logInfo('  正确格式示例: http://localhost:8888');
    return false;
  }
}

// 生成配置摘要
function generateSummary(hasEnvFile, hasRequiredVars, hasValidApiUrl) {
  logSection('配置摘要');

  const checks = [
    { name: '环境文件存在', passed: hasEnvFile },
    { name: '必需变量已配置', passed: hasRequiredVars },
    { name: 'API URL 格式正确', passed: hasValidApiUrl },
  ];

  checks.forEach(({ name, passed }) => {
    if (passed) {
      logSuccess(name);
    } else {
      logError(name);
    }
  });

  const allPassed = checks.every(c => c.passed);

  console.log('\n' + '='.repeat(50));
  if (allPassed) {
    log('🎉 所有检查通过！环境配置正确！', 'green');
    log('\n你可以运行: npm run dev', 'cyan');
  } else {
    log('⚠️  存在配置问题，请修复后再运行项目', 'yellow');
    log('\n请参考 .env.example 文件进行配置', 'cyan');
  }
  console.log('='.repeat(50) + '\n');

  return allPassed;
}

// 主函数
function main() {
  console.log('\n');
  log('🔍 CryptoNiche 2.0 - 环境配置检查工具', 'bright');

  // 1. 检查文件是否存在
  const hasEnvFile = checkEnvFileExists();

  if (!hasEnvFile) {
    console.log('\n');
    process.exit(1);
  }

  // 2. 读取环境变量
  const env = loadEnvFile();

  if (!env) {
    console.log('\n');
    process.exit(1);
  }

  // 3. 检查必需变量
  const hasRequiredVars = checkRequiredEnvVars(env);

  // 4. 检查废弃变量
  checkDeprecatedVars(env);

  // 5. 验证 API URL
  const hasValidApiUrl = validateApiUrl(env);

  // 6. 生成摘要
  const allPassed = generateSummary(hasEnvFile, hasRequiredVars, hasValidApiUrl);

  process.exit(allPassed ? 0 : 1);
}

// 运行
main();
