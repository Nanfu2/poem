<template>
  <div class="n8n-chat-plugin">
    <div class="chat-header" @click="toggleChat">
      <span class="header-icon">🤖</span>
      <span class="header-text">AI 助手</span>
      <span class="toggle-icon">{{ isExpanded ? '−' : '+' }}</span>
    </div>
    
    <div v-if="isExpanded" class="chat-body">
      <div class="chat-messages" ref="messagesContainer">
        <div v-if="messages.length === 0" class="welcome-message">
          <p>你好！我是基于n8n工作流的AI助手，有什么我可以帮你的吗？</p>
          <div class="test-buttons">
            <button @click="testConnection" class="test-btn">
              测试连接
            </button>
            <button @click="diagnoseConnection" class="diagnose-btn">
              网络诊断
            </button>
          </div>
        </div>
        
        <div v-else class="message-list">
          <div
            v-for="(message, index) in messages"
            :key="index"
            class="message"
            :class="{ 'user-message': message.role === 'user', 'ai-message': message.role === 'assistant' }"
          >
            <div class="message-content">
              <div class="message-text">{{ message.content }}</div>
              <div class="message-time">{{ formatTime(message.timestamp) }}</div>
            </div>
          </div>
          
          <div v-if="loading" class="message ai-message">
            <div class="message-content">
              <div class="typing-indicator">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div class="chat-input">
        <form @submit.prevent="sendMessage">
          <div class="input-wrapper">
            <input
              v-model="currentMessage"
              placeholder="输入消息..."
              class="message-input"
              :disabled="loading"
            />
            <button
              type="submit"
              class="send-btn"
              :disabled="loading || !currentMessage.trim()"
            >
              发送
            </button>
          </div>
        </form>
        <div class="debug-info" v-if="debugInfo">
          <small>{{ debugInfo }}</small>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, nextTick, computed } from 'vue';

// 使用环境变量配置 webhook URL
const N8N_WEBHOOK_URL = import.meta.env.VITE_N8N_WEBHOOK_URL || 'https://nanfu.app.n8n.cloud/webhook/poetry-analysis';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

const isExpanded = ref(false);
const currentMessage = ref('');
const messages = ref<Message[]>([]);
const loading = ref(false);
const messagesContainer = ref<HTMLElement>();
const debugInfo = ref<string>('');

// 检查是否配置了webhook URL
const isWebhookConfigured = computed(() => {
  return !!N8N_WEBHOOK_URL;
});

// 切换聊天窗口展开/收起
function toggleChat() {
  isExpanded.value = !isExpanded.value;
  if (isExpanded.value) {
    scrollToBottom();
  }
}

// 格式化时间
function formatTime(date: Date) {
  return date.toLocaleTimeString('zh-CN', { 
    hour: '2-digit', 
    minute: '2-digit' 
  });
}

// 滚动到底部
function scrollToBottom() {
  nextTick(() => {
    if (messagesContainer.value) {
      messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight;
    }
  });
}

// 诊断网络连接
async function diagnoseConnection() {
  const webhookUrl = N8N_WEBHOOK_URL;
  if (!webhookUrl) return;

  // 添加诊断消息到聊天记录
  const diagnosisStartMessage: Message = {
    role: 'assistant',
    content: '🔍 开始网络诊断...',
    timestamp: new Date()
  };
  messages.value.push(diagnosisStartMessage);

  try {
    // 1. 检查URL格式
    try {
      new URL(webhookUrl);
    } catch (e) {
      throw new Error('URL格式无效');
    }

    // 2. 检查协议
    const protocol = webhookUrl.startsWith('https://') ? 'HTTPS' : webhookUrl.startsWith('http://') ? 'HTTP' : '未知';
    const protocolMessage: Message = {
      role: 'assistant',
      content: `✅ URL协议: ${protocol}`,
      timestamp: new Date()
    };
    messages.value.push(protocolMessage);

    // 3. 提取域名
    const urlObj = new URL(webhookUrl);
    const domain = urlObj.hostname;
    const domainMessage: Message = {
      role: 'assistant',
      content: `🌐 目标域名: ${domain}`,
      timestamp: new Date()
    };
    messages.value.push(domainMessage);

    // 4. 检查是否为本地地址
    const isLocal = domain === 'localhost' || domain === '127.0.0.1' || domain.startsWith('192.168.') || domain.startsWith('10.');
    if (isLocal) {
      const localMessage: Message = {
        role: 'assistant',
        content: '⚠️ 检测到本地地址，请确保n8n服务已在本地运行',
        timestamp: new Date()
      };
      messages.value.push(localMessage);
    }

    // 5. DNS检查（通过fetch一个简单请求）
    const dnsCheckMessage: Message = {
      role: 'assistant',
      content: '🔍 正在检查DNS解析和服务器可达性...',
      timestamp: new Date()
    };
    messages.value.push(dnsCheckMessage);

    // 尝试一个简单的HEAD请求来检查连接
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    try {
      const response = await fetch(webhookUrl, {
        method: 'HEAD',
        signal: controller.signal
      });
      clearTimeout(timeoutId);
      
      const dnsSuccessMessage: Message = {
        role: 'assistant',
        content: `✅ 服务器可达，状态码: ${response.status} ${response.statusText}`,
        timestamp: new Date()
      };
      messages.value.push(dnsSuccessMessage);
      
      // 如果是404，尝试不同的URL路径
      if (response.status === 404) {
        const notFoundMessage: Message = {
          role: 'assistant',
          content: '⚠️ 路径未找到，尝试其他可能的路径...',
          timestamp: new Date()
        };
        messages.value.push(notFoundMessage);
        
        // 尝试几种常见的路径变化
        const alternativePaths = [
          webhookUrl.replace('/webhook/', '/'),
          webhookUrl.replace('/webhook/poetry-analysis', '/poetry-analysis'),
          webhookUrl.replace('/webhook/poetry-analysis', '/webhook-test/poetry-analysis')
        ];
        
        for (const path of alternativePaths) {
          try {
            const altResponse = await fetch(path, {
              method: 'HEAD',
              signal: AbortSignal.timeout(5000)
            });
            
            if (altResponse.status !== 404) {
              const altSuccessMessage: Message = {
                role: 'assistant',
                content: `💡 在路径 ${path} 找到服务，状态码: ${altResponse.status}`,
                timestamp: new Date()
              };
              messages.value.push(altSuccessMessage);
              break;
            }
          } catch (e) {
            // 忽略错误，继续尝试下一个路径
          }
        }
      }
    } catch (headError: any) {
      clearTimeout(timeoutId);
      if (headError.name === 'AbortError') {
        const timeoutMessage: Message = {
          role: 'assistant',
          content: '❌ 请求超时，服务器可能未响应',
          timestamp: new Date()
        };
        messages.value.push(timeoutMessage);
      } else if (headError.message.includes('Failed to fetch')) {
        const fetchErrorMessage: Message = {
          role: 'assistant',
          content: '❌ 网络连接失败，可能原因:\n1. URL地址错误\n2. 网络连接问题\n3. 跨域问题(CORS)\n4. 防火墙阻止\n5. SSL证书问题',
          timestamp: new Date()
        };
        messages.value.push(fetchErrorMessage);
      } else {
        const dnsFailMessage: Message = {
          role: 'assistant',
          content: `⚠️ DNS检查发现问题: ${headError.message}`,
          timestamp: new Date()
        };
        messages.value.push(dnsFailMessage);
      }
    }

    // 6. 完整测试
    const testMessage: Message = {
      role: 'assistant',
      content: '🔍 正在进行完整连接测试...',
      timestamp: new Date()
    };
    messages.value.push(testMessage);

    await testConnection();

  } catch (error: any) {
    const errorMessage: Message = {
      role: 'assistant',
      content: `❌ 诊断过程中发生错误: ${error.message}`,
      timestamp: new Date()
    };
    messages.value.push(errorMessage);
  }
}

// 测试连接
async function testConnection() {
  const webhookUrl = N8N_WEBHOOK_URL;
  if (!webhookUrl) return;
  
  debugInfo.value = '正在测试连接...';
  
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 60000); // 60秒超时
    
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        poem: "静夜思\\n床前明月光，疑是地上霜。\\n举头望明月，低头思故乡。",
        test: true,
        timestamp: new Date().toISOString()
      }),
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    
    debugInfo.value = `连接测试成功: ${response.status} ${response.statusText}`;
    
    // 添加测试成功的消息到聊天记录
    const successMessage: Message = {
      role: 'assistant',
      content: `✅ 连接测试成功！服务器响应: ${response.status} ${response.statusText}`,
      timestamp: new Date()
    };
    messages.value.push(successMessage);
    
    // 如果是404或405错误，可能是URL路径问题
    if (response.status === 404) {
      const pathMessage: Message = {
        role: 'assistant',
        content: '⚠️ 收到404错误，检查webhook路径是否正确',
        timestamp: new Date()
      };
      messages.value.push(pathMessage);
    } else if (response.status === 405) {
      const methodMessage: Message = {
        role: 'assistant',
        content: '⚠️ 收到405错误，服务器不支持POST方法，请检查webhook配置',
        timestamp: new Date()
      };
      messages.value.push(methodMessage);
    }
  } catch (error: any) {
    console.error('连接测试失败:', error);
    let errorMessage = '连接测试失败: ';
    
    if (error.name === 'AbortError') {
      errorMessage += '请求超时';
      debugInfo.value = '连接测试失败: 请求超时';
    } else if (error.message.includes('Failed to fetch')) {
      errorMessage += '网络连接失败，可能原因:\n1. URL地址错误\n2. 网络连接问题\n3. 跨域问题(CORS)\n4. 防火墙阻止';
      debugInfo.value = '连接测试失败: 网络连接问题';
      
      // 添加更多诊断信息
      const diagnosticMessage: Message = {
        role: 'assistant',
        content: '💡 详细诊断信息:\n- 检查n8n服务器是否正在运行\n- 确认URL路径是否正确\n- 尝试在浏览器中直接访问该URL\n- 检查网络防火墙设置',
        timestamp: new Date()
      };
      messages.value.push(diagnosticMessage);
    } else {
      errorMessage += error.message;
      debugInfo.value = `连接测试失败: ${error.message}`;
    }
    
    // 添加测试失败的消息到聊天记录
    const failMessage: Message = {
      role: 'assistant',
      content: `❌ ${errorMessage}`,
      timestamp: new Date()
    };
    messages.value.push(failMessage);
    
    // 提供解决建议
    const suggestionMessage: Message = {
      role: 'assistant',
      content: '💡 解决建议:\n1. 确认n8n服务正在运行\n2. 尝试在浏览器中直接访问该URL\n3. 检查是否有防火墙或安全软件阻止连接\n4. 联系系统管理员确认服务状态',
      timestamp: new Date()
    };
    messages.value.push(suggestionMessage);
  } finally {
    // 3秒后清除调试信息
    setTimeout(() => {
      debugInfo.value = '';
    }, 3000);
  }
}

// 发送消息
async function sendMessage() {
  const message = currentMessage.value.trim();
  if (!message || loading.value || !isWebhookConfigured.value) return;

  // 添加用户消息
  const userMessage: Message = {
    role: 'user',
    content: message,
    timestamp: new Date()
  };
  messages.value.push(userMessage);
  currentMessage.value = '';
  
  loading.value = true;
  scrollToBottom();

  try {
    // 调用n8n工作流
    const response = await callN8nWorkflow(message);
    
    // 添加AI回复
    const aiMessage: Message = {
      role: 'assistant',
      content: response,
      timestamp: new Date()
    };
    messages.value.push(aiMessage);
  } catch (error: any) {
    // 添加错误消息
    let errorMessage = '抱歉，消息发送失败，请稍后重试。';
    
    // 提供更具体的错误信息和解决建议
    if (error.message) {
      if (error.message.includes('Failed to fetch')) {
        errorMessage = '网络连接失败，请检查：\n1. 网络连接是否正常\n2. Webhook URL是否正确\n3. 目标服务器是否可访问\n4. 是否存在跨域问题';
      } else if (error.message.includes('500')) {
        errorMessage = '服务器内部错误，请检查：\n1. n8n工作流是否正确配置\n2. 工作流中是否有节点配置错误\n3. AI服务（如OpenAI）是否正常\n4. n8n服务器资源是否充足';
      } else {
        errorMessage += ` 错误详情: ${error.message}`;
      }
    }
    
    const errorMess: Message = {
      role: 'assistant',
      content: errorMessage,
      timestamp: new Date()
    };
    messages.value.push(errorMess);
  } finally {
    loading.value = false;
    scrollToBottom();
  }
}

// 调用n8n工作流
async function callN8nWorkflow(message: string): Promise<string> {
  const webhookUrl = N8N_WEBHOOK_URL;
  
  if (!webhookUrl) {
    throw new Error('未配置n8n webhook URL');
  }
  
  try {
    debugInfo.value = '正在发送请求...';
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 60000); // 60秒超时
    
    // 使用 {"chatInput": "..."} 格式
    const requestBody = {
      chatInput: message,
      timestamp: new Date().toISOString()
    };
    
    // 记录请求信息用于调试
    console.log('发送到n8n的请求URL:', webhookUrl);
    console.log('发送到n8n的请求方法: POST');
    console.log('发送到n8n的请求头:', {
      'Content-Type': 'application/json'
    });
    console.log('发送到n8n的请求体:', requestBody);
    
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    debugInfo.value = `收到响应: ${response.status} ${response.statusText}`;
    
    // 记录响应信息用于调试
    console.log('收到n8n的响应状态:', response.status, response.statusText);
    console.log('收到n8n的响应头:', [...response.headers.entries()]);
    
    // 更详细地处理HTTP错误
    if (!response.ok) {
      let errorMessage = `HTTP错误: ${response.status}`;
      switch(response.status) {
        case 400:
          errorMessage += ' (请求参数错误)';
          break;
        case 401:
          errorMessage += ' (未授权访问)';
          break;
        case 403:
          errorMessage += ' (禁止访问)';
          break;
        case 404:
          errorMessage += ' (未找到资源)';
          break;
        case 500:
          errorMessage += ' (服务器内部错误)';
          break;
        case 502:
          errorMessage += ' (网关错误)';
          break;
        case 503:
          errorMessage += ' (服务不可用)';
          break;
        default:
          errorMessage += ` (${response.statusText})`;
      }
      
      // 尝试读取错误响应体以获取更多详细信息
      try {
        const errorText = await response.text();
        console.log('错误响应体:', errorText);
        if (errorText) {
          errorMessage += ` 详细信息: ${errorText.substring(0, 200)}`;
        }
      } catch (e) {
        console.log('无法读取错误响应体:', e);
      }
      
      throw new Error(errorMessage);
    }
    
    // 检查响应内容是否为空
    const contentLength = response.headers.get('content-length');
    console.log('响应Content-Length:', contentLength);
    if (contentLength && parseInt(contentLength) === 0) {
      console.log('响应体为空');
      return '收到消息，但服务器未返回具体内容';
    }
    
    const contentType = response.headers.get('content-type');
    console.log('响应Content-Type:', contentType);
    if (!contentType || !contentType.includes('application/json')) {
      const text = await response.text();
      console.log('非JSON响应内容:', text);
      if (!text) {
        return '收到消息，但服务器未返回具体内容';
      }
      return `服务器返回非JSON响应: ${text.substring(0, 100)}...`;
    }
    
    const data = await response.json();
    console.log('响应JSON数据:', data);
    
    // 检查是否为错误响应但包装在200响应中
    if (data.error) {
      const errorMessage = data.message || data.error || '服务器返回错误';
      throw new Error(`服务器错误: ${errorMessage}`);
    }
    
    // 根据n8n工作流的响应格式调整这里
    // 支持 { success: true, analysis: "..." } 格式
    if (data.success === true && data.analysis) {
      console.log('成功获取分析结果');
      return data.analysis;
    }
    
    // 检查是否为失败的响应
    if (data.success === false) {
      const errorMessage = data.message || data.error || '操作失败';
      throw new Error(`操作失败: ${errorMessage}`);
    }
    
    // 兼容之前的格式
    const result = data.response || data.result || data.answer || data.text || JSON.stringify(data);
    if (result) {
      console.log('使用兼容格式返回结果');
      return result;
    }
    
    console.log('未识别的响应格式');
    return '收到消息，但服务器未返回具体内容';
  } catch (error: any) {
    console.error('调用n8n工作流失败:', error);
    debugInfo.value = `请求失败: ${error.message}`;
    
    // 提供更具体的错误信息
    if (error.name === 'AbortError') {
      // 检查是否是超时导致的abort
      if (error.message.includes('timeout')) {
        throw new Error('请求超时，请检查网络连接或稍后重试');
      }
      // 检查是否是其他原因导致的abort
      throw new Error('请求被取消，可能是网络问题或浏览器限制');
    }
    throw error;
  } finally {
    // 3秒后清除调试信息
    setTimeout(() => {
      debugInfo.value = '';
    }, 3000);
  }
}

</script>

<style scoped>
.n8n-chat-plugin {
  position: fixed;
  bottom: 20px;
  right: 20px;
  z-index: 1000;
  width: 350px;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  background: white;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.chat-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px;
  background: var(--primary);
  color: white;
  border-radius: 12px 12px 0 0;
  cursor: pointer;
}

.header-icon {
  font-size: 1.2rem;
  margin-right: 8px;
}

.header-text {
  flex: 1;
  font-weight: 500;
  font-size: 1rem;
}

.toggle-icon {
  font-size: 1.2rem;
  font-weight: bold;
}

.chat-body {
  display: flex;
  flex-direction: column;
  height: 400px;
  border: 1px solid #e2e8f0;
  border-top: none;
  border-radius: 0 0 12px 12px;
}

.chat-messages {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
  background: #f8fafc;
}

.welcome-message {
  text-align: center;
  color: #64748b;
  padding: 20px 10px;
  font-size: 0.9rem;
}

.setup-tip {
  background: #fffbeb;
  border: 1px solid #fbbf24;
  border-radius: 6px;
  padding: 10px;
  margin: 10px 0;
  color: #92400e;
}

.test-buttons {
  display: flex;
  gap: 10px;
  justify-content: center;
  margin-top: 15px;
}

.test-btn, .diagnose-btn {
  color: white;
  border: none;
  border-radius: 6px;
  padding: 8px 16px;
  cursor: pointer;
  font-size: 0.9rem;
}

.test-btn {
  background: #10b981;
}

.test-btn:hover {
  background: #059669;
}

.diagnose-btn {
  background: #3b82f6;
}

.diagnose-btn:hover {
  background: #2563eb;
}

.message-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.message {
  display: flex;
  max-width: 80%;
}

.user-message {
  align-self: flex-end;
}

.ai-message {
  align-self: flex-start;
}

.message-content {
  padding: 10px 14px;
  border-radius: 18px;
  font-size: 0.9rem;
  line-height: 1.4;
}

.user-message .message-content {
  background: var(--primary);
  color: white;
  border-bottom-right-radius: 4px;
}

.ai-message .message-content {
  background: white;
  border: 1px solid #e2e8f0;
  border-bottom-left-radius: 4px;
}

.message-time {
  font-size: 0.7rem;
  color: #94a3b8;
  margin-top: 4px;
  text-align: right;
}

.typing-indicator {
  display: flex;
  gap: 4px;
  padding: 10px 14px;
}

.typing-indicator span {
  width: 8px;
  height: 8px;
  background: #94a3b8;
  border-radius: 50%;
  animation: typing 1.4s infinite ease-in-out;
}

.typing-indicator span:nth-child(1) { animation-delay: -0.32s; }
.typing-indicator span:nth-child(2) { animation-delay: -0.16s; }

@keyframes typing {
  0%, 80%, 100% { transform: scale(0.8); opacity: 0.5; }
  40% { transform: scale(1); opacity: 1; }
}

.chat-input {
  border-top: 1px solid #e2e8f0;
  padding: 12px;
  background: white;
}

.input-wrapper {
  display: flex;
  gap: 8px;
}

.message-input {
  flex: 1;
  padding: 10px 14px;
  border: 1px solid #e2e8f0;
  border-radius: 20px;
  font-size: 0.9rem;
  outline: none;
}

.message-input:focus {
  border-color: var(--primary);
}

.message-input:disabled {
  background: #f1f5f9;
}

.send-btn {
  background: var(--primary);
  color: white;
  border: none;
  border-radius: 20px;
  padding: 10px 16px;
  cursor: pointer;
  font-size: 0.9rem;
  transition: background 0.2s;
}

.send-btn:hover:not(:disabled) {
  background: #1d4ed8;
}

.send-btn:disabled {
  background: #cbd5e1;
  cursor: not-allowed;
}

.input-hint {
  text-align: center;
  color: #ef4444;
  font-size: 0.8rem;
  margin-top: 4px;
}

.debug-info {
  text-align: center;
  color: #64748b;
  font-size: 0.7rem;
  margin-top: 4px;
  padding: 4px;
  background: #f1f5f9;
  border-radius: 4px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .n8n-chat-plugin {
    width: calc(100% - 40px);
    bottom: 10px;
    right: 10px;
  }
  
  .chat-body {
    height: 300px;
  }
  
  .test-buttons {
    flex-direction: column;
  }
}

/* 修复缺少的结束标签 */
</style>