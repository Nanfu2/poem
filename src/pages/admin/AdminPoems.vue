<template>
  <div class="admin-poems">
    <!-- 页面标题 -->
    <div class="page-header">
      <h1>📚 诗词管理</h1>
      <p class="page-description">管理诗词库，包括添加、编辑、删除诗词</p>
    </div>

    <!-- 操作工具栏 -->
    <div class="toolbar">
      <div class="toolbar-left">
        <button class="btn btn-primary" @click="showAddModal = true">
          <span class="btn-icon">➕</span>
          添加诗词
        </button>
        <button class="btn btn-secondary" @click="refreshData">
          <span class="btn-icon">🔄</span>
          刷新数据
        </button>
      </div>
      
      <div class="toolbar-right">
        <div class="search-box">
          <input
            v-model="searchQuery"
            type="text"
            placeholder="搜索诗词..."
            class="search-input"
          />
          <span class="search-icon">🔍</span>
        </div>
        
        <select v-model="filterBy" class="filter-select">
          <option value="all">全部诗词</option>
          <option value="published">已发布</option>
          <option value="draft">草稿</option>
        </select>
        
        <select v-model="sortBy" class="sort-select">
          <option value="newest">最新添加</option>
          <option value="oldest">最早添加</option>
          <option value="title">标题排序</option>
          <option value="author">作者排序</option>
        </select>
      </div>
    </div>

    <!-- 统计信息 -->
    <div class="stats-cards">
      <div class="stat-card">
        <div class="stat-icon">📚</div>
        <div class="stat-info">
          <div class="stat-number">{{ totalPoems }}</div>
          <div class="stat-label">总诗词数</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon">👤</div>
        <div class="stat-info">
          <div class="stat-number">{{ totalAuthors }}</div>
          <div class="stat-label">作者数量</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon">🏛️</div>
        <div class="stat-info">
          <div class="stat-number">{{ totalDynasties }}</div>
          <div class="stat-label">朝代数量</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon">👁️</div>
        <div class="stat-info">
          <div class="stat-number">{{ totalViews }}</div>
          <div class="stat-label">总阅读量</div>
        </div>
      </div>
    </div>

    <!-- 加载状态 -->
    <div v-if="loading" class="loading-state">
      <div class="spinner"></div>
      <p>正在加载诗词数据...</p>
    </div>

    <!-- 错误状态 -->
    <div v-else-if="error" class="error-state">
      <div class="error-icon">❌</div>
      <h3>加载失败</h3>
      <p class="error-message">{{ error }}</p>
      <button class="btn btn-primary" @click="refreshData">🔄 重试</button>
    </div>

    <!-- 诗词列表 -->
    <div v-else class="poems-table-container">
      <table class="poems-table">
        <thead>
          <tr>
            <th class="checkbox-col">
              <input
                type="checkbox"
                :checked="selectedAll"
                @change="toggleSelectAll"
              />
            </th>
            <th class="title-col">诗词标题</th>
            <th class="author-col">作者</th>
            <th class="dynasty-col">朝代</th>
            <th class="views-col">阅读量</th>
            <th class="likes-col">点赞数</th>
            <th class="status-col">状态</th>
            <th class="date-col">添加时间</th>
            <th class="actions-col">操作</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="poem in filteredPoems"
            :key="poem.id"
            :class="{ selected: selectedPoems.includes(poem.id) }"
          >
            <td class="checkbox-col">
              <input
                type="checkbox"
                :checked="selectedPoems.includes(poem.id)"
                @change="toggleSelectPoem(poem.id)"
              />
            </td>
            <td class="title-col">
              <div class="poem-title">
                {{ poem.title }}
                <span v-if="poem.tags" class="tags">
                  <span v-for="tag in poem.tags.slice(0, 2)" :key="tag" class="tag">
                    #{{ tag }}
                  </span>
                  <span v-if="poem.tags.length > 2" class="more-tags">
                    +{{ poem.tags.length - 2 }}
                  </span>
                </span>
              </div>
            </td>
            <td class="author-col">{{ poem.author }}</td>
            <td class="dynasty-col">{{ poem.dynasty }}</td>
            <td class="views-col">{{ poem.views || 0 }}</td>
            <td class="likes-col">{{ poem.likes || 0 }}</td>
            <td class="status-col">
              <span class="status-badge" :class="poem.status || 'published'">
                {{ poem.status === 'draft' ? '草稿' : '已发布' }}
              </span>
            </td>
            <td class="date-col">{{ formatDate(poem.createdAt) }}</td>
            <td class="actions-col">
              <div class="action-buttons">
                <button class="btn-action view" @click="viewPoem(poem)" title="查看">
                  👁️
                </button>
                <button class="btn-action edit" @click="editPoem(poem)" title="编辑">
                  ✏️
                </button>
                <button class="btn-action delete" @click="deletePoem(poem)" title="删除">
                  🗑️
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>

      <!-- 空状态 -->
      <div v-if="filteredPoems.length === 0" class="empty-state">
        <div class="empty-icon">📝</div>
        <h3>暂无诗词数据</h3>
        <p>还没有添加任何诗词，点击"添加诗词"按钮开始管理</p>
        <button class="btn btn-primary" @click="showAddModal = true">
          ➕ 添加第一首诗词
        </button>
      </div>

      <!-- 批量操作 -->
      <div v-if="selectedPoems.length > 0" class="batch-actions">
        <div class="batch-info">
          已选择 {{ selectedPoems.length }} 首诗词
        </div>
        <div class="batch-buttons">
          <button class="btn btn-secondary" @click="batchPublish">
            📤 批量发布
          </button>
          <button class="btn btn-secondary" @click="batchDraft">
            📝 批量设为草稿
          </button>
          <button class="btn btn-danger" @click="batchDelete">
            🗑️ 批量删除
          </button>
          <button class="btn btn-text" @click="clearSelection">
            ✕ 取消选择
          </button>
        </div>
      </div>

      <!-- 分页 -->
      <div v-if="totalPages > 1" class="pagination">
        <button
          class="pagination-btn"
          :disabled="currentPage === 1"
          @click="currentPage--"
        >
          上一页
        </button>
        
        <div class="pagination-pages">
          <span
            v-for="page in visiblePages"
            :key="page"
            class="page-number"
            :class="{ active: page === currentPage }"
            @click="currentPage = page"
          >
            {{ page }}
          </span>
        </div>
        
        <button
          class="pagination-btn"
          :disabled="currentPage === totalPages"
          @click="currentPage++"
        >
          下一页
        </button>
      </div>
    </div>

    <!-- 添加/编辑诗词模态框 -->
    <div v-if="showAddModal || editingPoem" class="modal-overlay" @click="closeModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h2>{{ editingPoem ? '编辑诗词' : '添加诗词' }}</h2>
          <button class="modal-close" @click="closeModal">✕</button>
        </div>
        
        <div class="modal-body">
          <form @submit.prevent="submitPoem">
            <div class="form-group">
              <label class="form-label">诗词标题 *</label>
              <input
                v-model="poemForm.title"
                type="text"
                class="form-input"
                placeholder="请输入诗词标题"
                required
              />
            </div>
            
            <div class="form-row">
              <div class="form-group">
                <label class="form-label">作者 *</label>
                <input
                  v-model="poemForm.author"
                  type="text"
                  class="form-input"
                  placeholder="请输入作者姓名"
                  required
                />
              </div>
              
              <div class="form-group">
                <label class="form-label">朝代 *</label>
                <select v-model="poemForm.dynasty" class="form-select" required>
                  <option value="">请选择朝代</option>
                  <option value="唐">唐代</option>
                  <option value="宋">宋代</option>
                  <option value="元">元代</option>
                  <option value="明">明代</option>
                  <option value="清">清代</option>
                  <option value="其他">其他</option>
                </select>
              </div>
            </div>
            
            <div class="form-group">
              <label class="form-label">诗词内容 *</label>
              <textarea
                v-model="poemForm.content"
                class="form-textarea"
                placeholder="请输入诗词内容，每行一句"
                rows="6"
                required
              ></textarea>
            </div>
            
            <div class="form-group">
              <label class="form-label">标签</label>
              <div class="tags-input">
                <input
                  v-model="newTag"
                  type="text"
                  class="form-input"
                  placeholder="输入标签后按回车添加"
                  @keyup.enter="addTag"
                />
                <div class="tags-list">
                  <span v-for="tag in poemForm.tags" :key="tag" class="tag">
                    {{ tag }}
                    <button type="button" @click="removeTag(tag)" class="tag-remove">✕</button>
                  </span>
                </div>
              </div>
            </div>
            
            <div class="form-row">
              <div class="form-group">
                <label class="form-label">状态</label>
                <select v-model="poemForm.status" class="form-select">
                  <option value="published">已发布</option>
                  <option value="draft">草稿</option>
                </select>
              </div>
              
              <div class="form-group">
                <label class="form-label">阅读量</label>
                <input
                  v-model.number="poemForm.views"
                  type="number"
                  class="form-input"
                  min="0"
                />
              </div>
            </div>
          </form>
        </div>
        
        <div class="modal-footer">
          <button class="btn btn-secondary" @click="closeModal">取消</button>
          <button class="btn btn-primary" @click="submitPoem">
            {{ editingPoem ? '更新诗词' : '添加诗词' }}
          </button>
        </div>
      </div>
    </div>

    <!-- 删除确认模态框 -->
    <div v-if="showDeleteConfirm" class="modal-overlay" @click="cancelDelete">
      <div class="modal-content confirm-modal" @click.stop>
        <div class="modal-header">
          <h2>确认删除</h2>
        </div>
        
        <div class="modal-body">
          <p>确定要删除诗词《{{ deletingPoem?.title }}》吗？此操作不可恢复。</p>
        </div>
        
        <div class="modal-footer">
          <button class="btn btn-secondary" @click="cancelDelete">取消</button>
          <button class="btn btn-danger" @click="confirmDelete">确认删除</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();

// 响应式数据
const loading = ref(true);
const error = ref<string | null>(null);
const poems = ref<any[]>([]);
const searchQuery = ref('');
const filterBy = ref('all');
const sortBy = ref('newest');
const currentPage = ref(1);
const pageSize = ref(10);
const selectedPoems = ref<number[]>([]);

// 模态框状态
const showAddModal = ref(false);
const editingPoem = ref<any>(null);
const showDeleteConfirm = ref(false);
const deletingPoem = ref<any>(null);

// 表单数据
const poemForm = ref({
  title: '',
  author: '',
  dynasty: '',
  content: '',
  tags: [] as string[],
  status: 'published',
  views: 0,
  likes: 0
});
const newTag = ref('');

// 模拟诗词数据
const mockPoems = [
  {
    id: 1,
    title: '春晓',
    author: '孟浩然',
    dynasty: '唐',
    content: `春眠不觉晓，处处闻啼鸟。
夜来风雨声，花落知多少。`,
    tags: ['春天', '自然', '抒情'],
    views: 1250,
    likes: 89,
    status: 'published',
    createdAt: '2024-01-15'
  },
  {
    id: 2,
    title: '登鹳雀楼',
    author: '王之涣',
    dynasty: '唐',
    content: `白日依山尽，黄河入海流。
欲穷千里目，更上一层楼。`,
    tags: ['登高', '励志', '哲理'],
    views: 980,
    likes: 76,
    status: 'published',
    createdAt: '2024-01-14'
  },
  {
    id: 3,
    title: '相思',
    author: '王维',
    dynasty: '唐',
    content: `红豆生南国，春来发几枝。
愿君多采撷，此物最相思。`,
    tags: ['爱情', '思念', '红豆'],
    views: 1560,
    likes: 102,
    status: 'published',
    createdAt: '2024-01-13'
  },
  {
    id: 4,
    title: '静夜思',
    author: '李白',
    dynasty: '唐',
    content: `床前明月光，疑是地上霜。
举头望明月，低头思故乡。`,
    tags: ['思乡', '月亮', '夜晚'],
    views: 2100,
    likes: 145,
    status: 'draft',
    createdAt: '2024-01-12'
  }
];

// 计算属性
const filteredPoems = computed(() => {
  let filtered = poems.value.filter(poem => {
    const matchesSearch = poem.title.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
                         poem.author.toLowerCase().includes(searchQuery.value.toLowerCase());
    
    const matchesFilter = filterBy.value === 'all' || 
                         poem.status === filterBy.value;
    
    return matchesSearch && matchesFilter;
  });

  // 排序
  switch (sortBy.value) {
    case 'oldest':
      filtered.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
      break;
    case 'title':
      filtered.sort((a, b) => a.title.localeCompare(b.title));
      break;
    case 'author':
      filtered.sort((a, b) => a.author.localeCompare(b.author));
      break;
    case 'newest':
    default:
      filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      break;
  }

  return filtered;
});

const totalPoems = computed(() => poems.value.length);
const totalAuthors = computed(() => new Set(poems.value.map(p => p.author)).size);
const totalDynasties = computed(() => new Set(poems.value.map(p => p.dynasty)).size);
const totalViews = computed(() => poems.value.reduce((sum, p) => sum + (p.views || 0), 0));
const totalPages = computed(() => Math.ceil(filteredPoems.value.length / pageSize.value));
const visiblePages = computed(() => {
  const pages = [];
  const start = Math.max(1, currentPage.value - 2);
  const end = Math.min(totalPages.value, start + 4);
  
  for (let i = start; i <= end; i++) {
    pages.push(i);
  }
  return pages;
});
const selectedAll = computed(() => {
  return filteredPoems.value.length > 0 && 
         filteredPoems.value.every(poem => selectedPoems.value.includes(poem.id));
});

// 方法
function loadPoems() {
  loading.value = true;
  error.value = null;
  
  setTimeout(() => {
    poems.value = [...mockPoems];
    loading.value = false;
  }, 1000);
}

function refreshData() {
  loadPoems();
}

function toggleSelectAll() {
  if (selectedAll.value) {
    selectedPoems.value = [];
  } else {
    selectedPoems.value = filteredPoems.value.map(poem => poem.id);
  }
}

function toggleSelectPoem(poemId: number) {
  const index = selectedPoems.value.indexOf(poemId);
  if (index > -1) {
    selectedPoems.value.splice(index, 1);
  } else {
    selectedPoems.value.push(poemId);
  }
}

function clearSelection() {
  selectedPoems.value = [];
}

function viewPoem(poem: any) {
  router.push(`/poem/${poem.id}`);
}

function editPoem(poem: any) {
  editingPoem.value = poem;
  poemForm.value = { ...poem };
  showAddModal.value = true;
}

function deletePoem(poem: any) {
  deletingPoem.value = poem;
  showDeleteConfirm.value = true;
}

function confirmDelete() {
  if (deletingPoem.value) {
    poems.value = poems.value.filter(p => p.id !== deletingPoem.value.id);
    showDeleteConfirm.value = false;
    deletingPoem.value = null;
  }
}

function cancelDelete() {
  showDeleteConfirm.value = false;
  deletingPoem.value = null;
}

function addTag() {
  if (newTag.value.trim() && !poemForm.value.tags.includes(newTag.value.trim())) {
    poemForm.value.tags.push(newTag.value.trim());
    newTag.value = '';
  }
}

function removeTag(tag: string) {
  poemForm.value.tags = poemForm.value.tags.filter(t => t !== tag);
}

function submitPoem() {
  if (editingPoem.value) {
    // 更新诗词
    const index = poems.value.findIndex(p => p.id === editingPoem.value.id);
    if (index > -1) {
      poems.value[index] = { ...poemForm.value, id: editingPoem.value.id };
    }
  } else {
    // 添加新诗词
    const newPoem = {
      ...poemForm.value,
      id: Math.max(...poems.value.map(p => p.id), 0) + 1,
      createdAt: new Date().toISOString().split('T')[0]
    };
    poems.value.unshift(newPoem);
  }
  
  closeModal();
}

function closeModal() {
  showAddModal.value = false;
  editingPoem.value = null;
  poemForm.value = {
    title: '',
    author: '',
    dynasty: '',
    content: '',
    tags: [],
    status: 'published',
    views: 0,
    likes: 0
  };
}

function batchPublish() {
  poems.value.forEach(poem => {
    if (selectedPoems.value.includes(poem.id)) {
      poem.status = 'published';
    }
  });
  clearSelection();
}

function batchDraft() {
  poems.value.forEach(poem => {
    if (selectedPoems.value.includes(poem.id)) {
      poem.status = 'draft';
    }
  });
  clearSelection();
}

function batchDelete() {
  poems.value = poems.value.filter(poem => !selectedPoems.value.includes(poem.id));
  clearSelection();
}

function formatDate(date: string) {
  return new Date(date).toLocaleDateString('zh-CN');
}

// 生命周期
onMounted(() => {
  loadPoems();
});
</script>

<style scoped>
.admin-poems {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.page-header {
  margin-bottom: 32px;
}

.page-header h1 {
  color: #1e293b;
  font-size: 2rem;
  font-weight: 700;
  margin: 0 0 8px 0;
}

.page-description {
  color: #64748b;
  font-size: 1.1rem;
  margin: 0;
}

/* 工具栏 */
.toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  gap: 16px;
  flex-wrap: wrap;
}

.toolbar-left,
.toolbar-right {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

/* 按钮样式 */
.btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 0.9rem;
  transition: all 0.2s;
  text-decoration: none;
}

.btn-primary {
  background: var(--primary);
  color: white;
}

.btn-primary:hover {
  background: #1d4ed8;
}

.btn-secondary {
  background: #f1f5f9;
  color: #475569;
  border: 1px solid #e2e8f0;
}

.btn-secondary:hover {
  background: #e2e8f0;
}

.btn-danger {
  background: #ef4444;
  color: white;
}

.btn-danger:hover {
  background: #dc2626;
}

.btn-text {
  background: transparent;
  color: #64748b;
}

.btn-text:hover {
  color: #475569;
}

/* 搜索框 */
.search-box {
  position: relative;
}

.search-input {
  padding: 8px 12px 8px 32px;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  font-size: 0.9rem;
  width: 200px;
}

.search-icon {
  position: absolute;
  left: 10px;
  top: 50%;
  transform: translateY(-50%);
  color: #64748b;
}

/* 选择框 */
.filter-select,
.sort-select {
  padding: 8px 12px;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  font-size: 0.9rem;
  background: white;
}

/* 统计卡片 */
.stats-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
  margin-bottom: 24px;
}

.stat-card {
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 20px;
  text-align: center;
  transition: transform 0.2s;
}

.stat-card:hover {
  transform: translateY(-2px);
}

.stat-icon {
  font-size: 2rem;
  margin-bottom: 12px;
}

.stat-number {
  color: #1e293b;
  font-size: 1.5rem;
  font-weight: 600;
  margin-bottom: 4px;
}

.stat-label {
  color: #64748b;
  font-size: 0.9rem;
}

/* 表格样式 */
.poems-table-container {
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  overflow: hidden;
}

.poems-table {
  width: 100%;
  border-collapse: collapse;
}

.poems-table th,
.poems-table td {
  padding: 12px;
  text-align: left;
  border-bottom: 1px solid #f1f5f9;
}

.poems-table th {
  background: #f8fafc;
  color: #475569;
  font-weight: 600;
  font-size: 0.9rem;
}

.poems-table tbody tr:hover {
  background: #f8fafc;
}

.poems-table tbody tr.selected {
  background: #f0f9ff;
}

/* 列宽 */
.checkbox-col { width: 40px; }
.title-col { width: 25%; }
.author-col { width: 15%; }
.dynasty-col { width: 10%; }
.views-col, .likes-col { width: 8%; }
.status-col { width: 10%; }
.date-col { width: 12%; }
.actions-col { width: 120px; }

/* 诗词标题 */
.poem-title {
  font-weight: 600;
  color: #1e293b;
}

.tags {
  display: flex;
  gap: 4px;
  margin-top: 4px;
}

.tag {
  background: #f1f5f9;
  color: #475569;
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 0.8rem;
}

.more-tags {
  color: #94a3b8;
  font-size: 0.8rem;
}

/* 状态徽章 */
.status-badge {
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: 600;
}

.status-badge.published {
  background: #f0f9ff;
  color: #0369a1;
}

.status-badge.draft {
  background: #fef3c7;
  color: #92400e;
}

/* 操作按钮 */
.action-buttons {
  display: flex;
  gap: 4px;
}

.btn-action {
  background: none;
  border: none;
  cursor: pointer;
  padding: 6px;
  border-radius: 4px;
  font-size: 1rem;
  transition: background-color 0.2s;
}

.btn-action:hover {
  background: #f1f5f9;
}

.btn-action.delete:hover {
  background: #fef2f2;
  color: #ef4444;
}

/* 批量操作 */
.batch-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  background: #f8fafc;
  border-top: 1px solid #e2e8f0;
}

.batch-info {
  color: #475569;
  font-weight: 600;
}

.batch-buttons {
  display: flex;
  gap: 8px;
}

/* 分页 */
.pagination {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 20px;
  border-top: 1px solid #f1f5f9;
}

.pagination-btn {
  background: white;
  color: #475569;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  padding: 8px 16px;
  cursor: pointer;
  font-size: 0.9rem;
  transition: all 0.2s;
}

.pagination-btn:hover:not(:disabled) {
  background: #f1f5f9;
  border-color: #cbd5e1;
}

.pagination-btn:disabled {
  color: #cbd5e1;
  cursor: not-allowed;
}

.pagination-pages {
  display: flex;
  gap: 4px;
}

.page-number {
  padding: 8px 12px;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.9rem;
  transition: all 0.2s;
}

.page-number:hover {
  background: #f1f5f9;
}

.page-number.active {
  background: var(--primary);
  color: white;
  border-color: var(--primary);
}

/* 模态框 */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  border-radius: 12px;
  max-width: 600px;
  width: 90%;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  border-bottom: 1px solid #e2e8f0;
}

.modal-header h2 {
  margin: 0;
  color: #1e293b;
}

.modal-close {
  background: none;
  border: none;
  font-size: 1.2rem;
  cursor: pointer;
  color: #64748b;
}

.modal-close:hover {
  color: #475569;
}

.modal-body {
  padding: 20px;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 20px;
  border-top: 1px solid #e2e8f0;
}

/* 表单样式 */
.form-group {
  margin-bottom: 20px;
}

.form-label {
  display: block;
  margin-bottom: 6px;
  color: #475569;
  font-weight: 600;
  font-size: 0.9rem;
}

.form-input,
.form-select,
.form-textarea {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  font-size: 0.9rem;
  transition: border-color 0.2s;
}

.form-input:focus,
.form-select:focus,
.form-textarea:focus {
  outline: none;
  border-color: var(--primary);
}

.form-textarea {
  resize: vertical;
  min-height: 120px;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

/* 标签输入 */
.tags-input {
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  padding: 8px 12px;
}

.tags-list {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 8px;
}

.tag-remove {
  background: none;
  border: none;
  cursor: pointer;
  color: #94a3b8;
  font-size: 0.8rem;
  margin-left: 4px;
}

.tag-remove:hover {
  color: #ef4444;
}

/* 确认模态框 */
.confirm-modal {
  max-width: 400px;
}

/* 加载和错误状态 */
.loading-state,
.error-state,
.empty-state {
  text-align: center;
  padding: 60px 20px;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #f1f5f9;
  border-top: 4px solid var(--primary);
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 16px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.error-icon,
.empty-icon {
  font-size: 3rem;
  margin-bottom: 16px;
}

.error-state h3,
.empty-state h3 {
  color: #1e293b;
  margin: 0 0 12px 0;
}

.error-message {
  color: #ef4444;
  margin-bottom: 20px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .admin-poems {
    padding: 16px;
  }
  
  .toolbar {
    flex-direction: column;
    align-items: stretch;
    gap: 16px;
  }
  
  .toolbar-left,
  .toolbar-right {
    justify-content: center;
  }
  
  .stats-cards {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .poems-table {
    font-size: 0.8rem;
  }
  
  .poems-table th,
  .poems-table td {
    padding: 8px;
  }
  
  .form-row {
    grid-template-columns: 1fr;
    gap: 0;
  }
  
  .batch-actions {
    flex-direction: column;
    gap: 12px;
  }
  
  .batch-buttons {
    flex-wrap: wrap;
    justify-content: center;
  }
}

@media (max-width: 480px) {
  .stats-cards {
    grid-template-columns: 1fr;
  }
  
  .pagination {
    flex-wrap: wrap;
  }
  
  .modal-content {
    width: 95%;
    margin: 20px;
  }
}
</style>