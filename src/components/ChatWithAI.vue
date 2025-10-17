<template>
  <section class="chat-with-ai">
    <div class="chat-header">
      <h3 class="chat-title">💬 问诗友</h3>
      <div class="chat-subtitle">与AI交流，深入了解这首诗词</div>
    </div>

    <div class="chat-container">
      <!-- 消息列表 -->
      <div class="messages" ref="messagesContainer">
        <div v-if="messages.length === 0" class="welcome-message">
          <div class="welcome-icon">🤖</div>
          <p>您好！我是您的诗词助手，可以问我关于这首诗词的任何问题。</p>
          <div class="suggestions">
            <span class="suggestion" @click="useSuggestion('这首诗的主题是什么？')">主题分析</span>
            <span class="suggestion" @click="useSuggestion('作者想表达什么情感？')">情感解读</span>
            <span class="suggestion" @click="useSuggestion('请赏析这首诗的艺术特色')">艺术特色</span>
          </div>
        </div>
        
        <div v-else class="message-list">
          <div
            v-for="message in messages"
            :key="message.id"
            class="message"
            :class="{ 'user-message': message.role === 'user', 'ai-message': message.role === 'assistant' }"
          >
            <div class="message-avatar">
              <span v-if="message.role === 'user'">👤</span>
              <span v-else>🤖</span>
            </div>
            <div class="message-content">
              <div class="message-text" v-html="formatMessage(message.content)"></div>
              <div class="message-time">{{ formatTime(message.timestamp) }}</div>
            </div>
          </div>
          
          <div v-if="loading" class="message ai-message typing">
            <div class="message-avatar">🤖</div>
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

      <!-- 输入区域 -->
      <div class="input-area">
        <form @submit.prevent="sendMessage" class="message-form">
          <div class="input-wrapper">
            <textarea
              v-model="currentQuestion"
              placeholder="输入您的问题..."
              class="message-input"
              :disabled="loading"
              @keydown="handleKeydown"
            ></textarea>
            <button
              type="submit"
              class="send-btn"
              :disabled="loading || !currentQuestion.trim()"
              :class="{ loading: loading }"
            >
              <span v-if="loading" class="send-spinner"></span>
              <span v-else>📤</span>
            </button>
          </div>
        </form>
        
        <div class="input-hint">
          <span>按 Enter 发送，Shift + Enter 换行</span>
        </div>
      </div>
    </div>

    <!-- 错误提示 -->
    <div v-if="error" class="error-banner">
      <div class="error-content">
        <span class="error-icon">⚠️</span>
        <span class="error-text">{{ error }}</span>
        <button class="error-close" @click="clearError">✕</button>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, nextTick, onMounted, onUnmounted } from 'vue';
import { askPoemFriend } from '@/services/ai';

const props = defineProps<{
  poemId: number;
  title: string;
  author: string;
  poemContent: string;
}>();

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

const currentQuestion = ref('');
const messages = ref<ChatMessage[]>([]);
const loading = ref(false);
const error = ref<string | null>(null);
const messagesContainer = ref<HTMLElement>();

function generateId() {
  return Date.now().toString() + Math.random().toString(36).substr(2, 9);
}

function formatMessage(content: string) {
  return content.replace(/\n/g, '<br>');
}

function formatTime(date: Date) {
  return date.toLocaleTimeString('zh-CN', { 
    hour: '2-digit', 
    minute: '2-digit' 
  });
}

function scrollToBottom() {
  nextTick(() => {
    if (messagesContainer.value) {
      messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight;
    }
  });
}

function useSuggestion(question: string) {
  currentQuestion.value = question;
  sendMessage();
}

// 处理键盘事件
function handleKeydown(event: KeyboardEvent) {
  if (event.key === 'Enter') {
    if (event.shiftKey) {
      // Shift+Enter 换行 - 允许默认行为
      return;
    } else {
      // Enter 发送消息
      event.preventDefault();
      sendMessage();
    }
  }
}

async function sendMessage() {
  const question = currentQuestion.value.trim();
  if (!question || loading.value) return;

  // 添加用户消息
  const userMessage: ChatMessage = {
    id: generateId(),
    role: 'user',
    content: question,
    timestamp: new Date()
  };
  messages.value.push(userMessage);
  currentQuestion.value = '';
  
  loading.value = true;
  error.value = null;
  scrollToBottom();

  try {
    const answer = await askPoemFriend({
      poem_id: props.poemId,
      title: props.title,
      author: props.author,
      poem_content: props.poemContent,
      question: question
    });

    // 添加AI回复
    const aiMessage: ChatMessage = {
      id: generateId(),
      role: 'assistant',
      content: answer,
      timestamp: new Date()
    };
    messages.value.push(aiMessage);
    
  } catch (e: any) {
    error.value = e?.message || 'AI服务暂时不可用，请稍后重试';
    
    // 添加错误消息
    const errorMessage: ChatMessage = {
      id: generateId(),
      role: 'assistant',
      content: '抱歉，我暂时无法回答这个问题。请检查网络连接或稍后重试。',
      timestamp: new Date()
    };
    messages.value.push(errorMessage);
  } finally {
    loading.value = false;
    scrollToBottom();
  }
}

function clearError() {
  error.value = null;
}

// 自动滚动到底部
onMounted(() => {
  scrollToBottom();
});
</script>

<style scoped>
.chat-with-ai {
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 24px;
  margin-bottom: 24px;
}

.chat-header {
  margin-bottom: 20px;
}

.chat-title {
  color: #1e293b;
  font-size: 1.3rem;
  font-weight: 600;
  margin: 0 0 4px 0;
}

.chat-subtitle {
  color: #64748b;
  font-size: 0.9rem;
}

.chat-container {
  display: flex;
  flex-direction: column;
  height: 400px;
}

.messages {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
  background: #f8fafc;
  border-radius: 8px;
  margin-bottom: 16px;
}

.welcome-message {
  text-align: center;
  color: #64748b;
  padding: 40px 20px;
}

.welcome-icon {
  font-size: 3rem;
  margin-bottom: 12px;
}

.suggestions {
  display: flex;
  gap: 8px;
  justify-content: center;
  margin-top: 16px;
  flex-wrap: wrap;
}

.suggestion {
  background: #f1f5f9;
  color: #475569;
  padding: 6px 12px;
  border-radius: 16px;
  font-size: 0.8rem;
  cursor: pointer;
  transition: all 0.2s;
}

.suggestion:hover {
  background: #e2e8f0;
  color: #334155;
}

.message {
  display: flex;
  margin-bottom: 16px;
  gap: 12px;
}

.message-avatar {
  font-size: 1.2rem;
}

.message-content {
  flex: 1;
}

.message-text {
  background: white;
  padding: 12px 16px;
  border-radius: 12px;
  line-height: 1.6;
  font-size: 0.95rem;
}

.user-message .message-text {
  background: var(--primary);
  color: white;
}

.ai-message .message-text {
  background: white;
  border: 1px solid #e2e8f0;
}

.message-time {
  color: #94a3b8;
  font-size: 0.75rem;
  margin-top: 4px;
  margin-left: 16px;
}

.typing .message-text {
  background: transparent;
  border: none;
  padding: 0;
}

.typing-indicator {
  display: flex;
  gap: 4px;
  padding: 12px 16px;
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

.input-area {
  border-top: 1px solid #e2e8f0;
  padding-top: 16px;
}

.message-form {
  margin-bottom: 8px;
}

.input-wrapper {
  display: flex;
  gap: 8px;
  align-items: flex-end;
}

.message-input {
  flex: 1;
  padding: 12px 16px;
  border: 1px solid #e2e8f0;
  border-radius: 24px;
  font-size: 0.95rem;
  resize: none;
  min-height: 44px;
  max-height: 120px;
}

.message-input:focus {
  outline: none;
  border-color: var(--primary);
}

.message-input:disabled {
  background: #f8fafc;
  color: #94a3b8;
}

.send-btn {
  background: var(--primary);
  color: white;
  border: none;
  border-radius: 50%;
  width: 44px;
  height: 44px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.send-btn:hover:not(:disabled) {
  background: #1d4ed8;
  transform: scale(1.05);
}

.send-btn:disabled {
  background: #cbd5e1;
  cursor: not-allowed;
}

.send-spinner {
  width: 16px;
  height: 16px;
  border: 2px solid transparent;
  border-top: 2px solid white;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

.input-hint {
  text-align: center;
  color: #94a3b8;
  font-size: 0.75rem;
}

.error-banner {
  background: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 8px;
  padding: 12px 16px;
  margin-top: 16px;
}

.error-content {
  display: flex;
  align-items: center;
  gap: 8px;
}

.error-icon {
  color: #ef4444;
}

.error-text {
  color: #dc2626;
  font-size: 0.9rem;
  flex: 1;
}

.error-close {
  background: none;
  border: none;
  color: #94a3b8;
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
}

.error-close:hover {
  background: #fecaca;
  color: #ef4444;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* 响应式设计 */
@media (max-width: 768px) {
  .chat-with-ai {
    padding: 20px;
  }
  
  .chat-container {
    height: 350px;
  }
  
  .messages {
    padding: 12px;
  }
  
  .suggestions {
    flex-direction: column;
    align-items: center;
  }
}

@media (max-width: 480px) {
  .chat-with-ai {
    padding: 16px;
  }
  
  .message {
    gap: 8px;
  }
  
  .message-text {
    padding: 10px 12px;
    font-size: 0.9rem;
  }
}
</style>