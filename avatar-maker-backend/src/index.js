import express from 'express';
import cors from 'cors';
import fetch from 'node-fetch';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

// 日志开关：通过环境变量或启动参数控制
// 使用方式：LOG_LEVEL=debug node src/index.js 或 node src/index.js --log-level=debug
const getLogLevel = () => {
  // 优先使用命令行参数
  const logLevelArg = process.argv.find(arg => arg.startsWith('--log-level='));
  if (logLevelArg) {
    return logLevelArg.split('=')[1].toLowerCase();
  }
  // 其次使用环境变量
  if (process.env.LOG_LEVEL) {
    return process.env.LOG_LEVEL.toLowerCase();
  }
  // 默认为 info
  return 'info';
};

const LOG_LEVEL = getLogLevel();
const LOG_LEVELS = {
  none: 0,    // 不输出日志
  error: 1,   // 只输出错误
  warn: 2,    // 输出警告和错误
  info: 3,    // 输出基本信息（默认）
  debug: 4    // 输出调试信息（详细）
};

const currentLogLevel = LOG_LEVELS[LOG_LEVEL] || LOG_LEVELS.info;

// 日志函数封装
const logger = {
  error: (...args) => {
    if (currentLogLevel >= LOG_LEVELS.error) {
      console.error(...args);
    }
  },
  warn: (...args) => {
    if (currentLogLevel >= LOG_LEVELS.warn) {
      console.warn(...args);
    }
  },
  info: (...args) => {
    if (currentLogLevel >= LOG_LEVELS.info) {
      console.log(...args);
    }
  },
  debug: (...args) => {
    if (currentLogLevel >= LOG_LEVELS.debug) {
      console.log(...args);
    }
  }
};

// 日志目录
const LOG_DIR = path.join(__dirname, '..', 'logs');
if (!fs.existsSync(LOG_DIR)) {
  fs.mkdirSync(LOG_DIR, { recursive: true });
}

// 日志工具函数
function writeLog(filename, content) {
  try {
    const timestamp = new Date().toISOString().replace(/:/g, '-');
    const logPath = path.join(LOG_DIR, `${timestamp}_${filename}`);
    fs.writeFileSync(logPath, content, 'utf-8');
    logger.debug(`📝 日志已保存: ${logPath}`);
    return logPath;
  } catch (error) {
    logger.error('❌ 写入日志失败:', error);
    return null;
  }
}

function writeJsonLog(filename, data) {
  return writeLog(filename, JSON.stringify(data, null, 2));
}

// 中间件
app.use(cors());
app.use(express.json({ limit: '50mb' }));

// 请求日志中间件
app.use((req, res, next) => {
  logger.info(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// 健康检查
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Avatar Maker Backend is running' });
});

// AI 生成接口代理
app.post('/api/generate', async (req, res) => {
  try {
    logger.info('收到生成请求');
    
    // 保存请求数据（仅在 debug 模式）
    if (currentLogLevel >= LOG_LEVELS.debug) {
      writeJsonLog('request.json', {
        timestamp: new Date().toISOString(),
        body: req.body,
        headers: req.headers
      });
    }
    
    const { modelConfig, generateRequest } = req.body;

    // 验证必需参数
    if (!modelConfig || !generateRequest) {
      return res.status(400).json({
        success: false,
        error: '缺少必需参数'
      });
    }

    const { baseURL, apiToken, modelName } = modelConfig;
    const { userImage, referenceImage, background } = generateRequest;

    if (!baseURL || !apiToken || !modelName) {
      return res.status(400).json({
        success: false,
        error: '模型配置不完整'
      });
    }

    // 构建提示词
    const prompt = `根据图 2 照片复刻图 1 的风格头像。
${background.elements ? `背景元素：${background.elements}` : ''}

要求：
- 头像的底色为${background.type === 'color' ? `颜色为 ${background.color || '自动选择'}` : '从图 2 主要颜色中提取'}
- 圆形内部的背景插画处理，不需要保留墙壁的细节，使用 ${background.elements ? `${background.elements}` : '随机图案'} 生成规律性的插画背景，稀疏分布
- 人物主体使用图 2 中的人物，放大到只显示上半身
- 正方形
`;

    // 构建请求体
    const payload = {
      model: modelName,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: prompt
            },
            {
              type: 'image_url',
              image_url: {
                url: userImage
              }
            },
            {
              type: 'image_url',
              image_url: {
                url: referenceImage
              }
            }
          ]
        }
      ],
      max_tokens: 4096
    };

    // 调用 AI 接口
    const url = `${baseURL}/v1/chat/completions`;
    
    // 保存发送到 AI 的请求（仅在 debug 模式）
    if (currentLogLevel >= LOG_LEVELS.debug) {
      writeJsonLog('ai_request.json', {
        timestamp: new Date().toISOString(),
        url,
        payload
      });
    }
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiToken}`
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errorData = await response.json();
      logger.error('AI API Error:', errorData);
      
      // 保存错误响应
      writeJsonLog('ai_error_response.json', {
        timestamp: new Date().toISOString(),
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries()),
        error: errorData
      });
      
      return res.status(response.status).json({
        success: false,
        imageUrl: '',
        error: errorData.error?.message || '生成失败，请检查配置'
      });
    }

    const data = await response.json();
    logger.debug('AI API Response:', JSON.stringify(data, null, 2));
    
    // 保存完整的 AI 响应（仅在 debug 模式）
    if (currentLogLevel >= LOG_LEVELS.debug) {
      writeJsonLog('ai_response.json', {
        timestamp: new Date().toISOString(),
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries()),
        data
      });
    }
    
    // 检查 finish_reason
    const finishReason = data.choices?.[0]?.finish_reason;
    const nativeFinishReason = data.choices?.[0]?.native_finish_reason;
    
    logger.debug('🏁 Finish reasons:', { finishReason, nativeFinishReason });
    
    // 检查 native_finish_reason 是否为 STOP（不区分大小写）
    if (nativeFinishReason && nativeFinishReason.toUpperCase() !== 'STOP') {
      const errorMsg = `AI 生成未正常完成。原因: ${nativeFinishReason}`;
      logger.warn('⚠️', errorMsg);
      
      // 保存异常的 finish_reason
      writeJsonLog('finish_reason_error.json', {
        timestamp: new Date().toISOString(),
        finishReason,
        nativeFinishReason,
        fullResponse: data
      });
      
      return res.status(500).json({
        success: false,
        imageUrl: '',
        error: errorMsg
      });
    }
    
    // 尝试多种可能的响应格式
    let imageUrl = null;
    
    // 调试：打印 message 对象结构
    if (data.choices?.[0]?.message) {
      logger.debug('📋 Message object keys:', Object.keys(data.choices[0].message));
      logger.debug('📋 Message object:', JSON.stringify(data.choices[0].message, null, 2));
    }
    
    // 优先检查 images 字段（Gemini 图片生成格式）
    if (data.choices?.[0]?.message?.images && Array.isArray(data.choices[0].message.images) && data.choices[0].message.images.length > 0) {
      const imageData = data.choices[0].message.images[0];
      logger.debug('📸 Image data type:', typeof imageData);
      logger.debug('📸 Image data structure:', Object.keys(imageData || {}));
      
      // 标准格式：images[0].image_url.url (base64)
      if (imageData?.image_url?.url) {
        imageUrl = imageData.image_url.url;
        logger.debug('✅ Extracted from: choices[0].message.images[0].image_url.url');
        logger.debug('📸 Image format:', imageUrl.startsWith('data:image') ? 'base64' : 'url');
      }
      // 如果是字符串，直接使用
      else if (typeof imageData === 'string') {
        imageUrl = imageData;
        logger.debug('✅ Extracted from: choices[0].message.images[0] (string)');
      }
      // 如果是对象，尝试提取其他可能的字段
      else if (typeof imageData === 'object' && imageData !== null) {
        imageUrl = imageData.url || imageData.data || imageData.content || imageData.image;
        if (imageUrl) {
          logger.debug('✅ Extracted from: choices[0].message.images[0] (object)');
        }
      }
    }
    // 标准 OpenAI 格式
    else if (data.choices?.[0]?.message?.content && data.choices[0].message.content.trim()) {
      imageUrl = data.choices[0].message.content;
      logger.debug('✅ Extracted from: choices[0].message.content');
    }
    // 某些代理服务可能使用 text 字段
    else if (data.choices?.[0]?.message?.text) {
      imageUrl = data.choices[0].message.text;
      logger.debug('✅ Extracted from: choices[0].message.text');
    }
    // 某些服务可能直接返回 text
    else if (data.choices?.[0]?.text) {
      imageUrl = data.choices[0].text;
      logger.debug('✅ Extracted from: choices[0].text');
    }
    // Gemini 原生格式（如果是直接调用）
    else if (data.candidates?.[0]?.content?.parts?.[0]?.text) {
      imageUrl = data.candidates[0].content.parts[0].text;
      logger.debug('✅ Extracted from: candidates[0].content.parts[0].text');
    }

    if (!imageUrl || typeof imageUrl !== 'string') {
      logger.error('❌ Invalid response format');
      logger.error('Complete response:', JSON.stringify(data, null, 2));
      logger.error('Failed to extract content from any known format');
      
      // 保存解析失败的详细信息
      writeJsonLog('parse_error.json', {
        timestamp: new Date().toISOString(),
        error: 'Failed to extract content from any known format',
        attemptedPaths: [
          'choices[0].message.images[0]',
          'choices[0].message.content',
          'choices[0].message.text',
          'choices[0].text',
          'candidates[0].content.parts[0].text'
        ],
        actualStructure: {
          hasChoices: !!data.choices,
          choicesLength: data.choices?.length,
          firstChoice: data.choices?.[0] ? Object.keys(data.choices[0]) : null,
          message: data.choices?.[0]?.message ? Object.keys(data.choices[0].message) : null,
          hasImages: !!data.choices?.[0]?.message?.images,
          imagesLength: data.choices?.[0]?.message?.images?.length,
          imagesContent: data.choices?.[0]?.message?.images,
          hasCandidates: !!data.candidates,
          topLevelKeys: Object.keys(data)
        },
        fullResponse: data
      });
      
      return res.status(500).json({
        success: false,
        imageUrl: '',
        error: '返回数据格式错误，无法提取内容。请查看后端日志了解详情。'
      });
    }

    // 处理返回的内容，确保是可用的图片格式
    let finalImageUrl = imageUrl.trim();
    
    logger.debug('📝 Content preview (first 200 chars):', finalImageUrl.substring(0, 200));
    
    // 检查是否已经是 data URI 格式
    if (finalImageUrl.startsWith('data:image/')) {
      logger.debug('✅ Already a valid data URI');
    }
    // 如果是纯 base64，添加前缀（假设是 PNG）
    else if (finalImageUrl.match(/^[A-Za-z0-9+/]+=*$/)) {
      logger.debug('🔧 Converting pure base64 to data URI');
      finalImageUrl = `data:image/png;base64,${finalImageUrl}`;
    }
    // 如果 AI 返回的是 URL（某些服务可能返回图片 URL）
    else if (finalImageUrl.startsWith('http://') || finalImageUrl.startsWith('https://')) {
      logger.debug('✅ Using image URL directly');
    }
    // 未知格式
    else {
      logger.warn('⚠️ Unknown image format, using as-is');
      logger.debug('Content type detection:', {
        startsWithData: finalImageUrl.startsWith('data:'),
        startsWithHttp: finalImageUrl.startsWith('http'),
        length: finalImageUrl.length,
        preview: finalImageUrl.substring(0, 100)
      });
    }

    // 保存最终结果（仅在 debug 模式）
    if (currentLogLevel >= LOG_LEVELS.debug) {
      writeJsonLog('final_result.json', {
        timestamp: new Date().toISOString(),
        success: true,
        imageUrl: finalImageUrl,
        imageUrlLength: finalImageUrl.length,
        imageUrlPreview: finalImageUrl.substring(0, 200)
      });
    }
    
    // 返回成功结果
    res.json({
      success: true,
      imageUrl: finalImageUrl
    });

  } catch (error) {
    logger.error('Server Error:', error);
    
    // 保存异常信息
    writeJsonLog('exception.json', {
      timestamp: new Date().toISOString(),
      error: {
        message: error.message,
        stack: error.stack,
        name: error.name
      }
    });
    
    res.status(500).json({
      success: false,
      imageUrl: '',
      error: error.message || '服务器内部错误'
    });
  }
});

app.listen(PORT, () => {
  logger.info(`🚀 Avatar Maker Backend server is running on http://localhost:${PORT}`);
  logger.info(`📍 Health check: http://localhost:${PORT}/health`);
  logger.info(`📍 API endpoint: http://localhost:${PORT}/api/generate`);
  logger.info(`📁 日志目录: ${LOG_DIR}`);
  logger.info(`📊 日志级别: ${LOG_LEVEL.toUpperCase()}`);
  logger.info('');
  logger.info('💡 使用方法:');
  logger.info('  - 默认模式 (info):     npm start');
  logger.info('  - 调试模式 (debug):    npm start -- --log-level=debug');
  logger.info('  - 静默模式 (error):    npm start -- --log-level=error');
  logger.info('  - 完全静默 (none):     npm start -- --log-level=none');
  logger.info('  - 或使用环境变量:      LOG_LEVEL=debug npm start');
});
