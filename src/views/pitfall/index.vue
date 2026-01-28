<template>
  <div class="app-container">
    <el-form :model="queryParams" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="标题" prop="keyword">
        <el-input
          v-model="queryParams.keyword"
          placeholder="请输入标题关键词"
          clearable
          style="width: 240px"
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" :icon="Search" @click="handleQuery">搜索</el-button>
        <el-button :icon="Refresh" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <el-row :gutter="10" class="mb8">
      <el-col :span="16">
        <el-space>
          <el-button type="primary" plain :icon="Plus" @click="handleAdd">新增</el-button>
          <el-button type="success" plain :icon="Edit" :disabled="single" @click="handleUpdate">修改</el-button>
          <el-button type="danger" plain :icon="Delete" :disabled="multiple" @click="handleDelete">删除</el-button>
        </el-space>
      </el-col>
      <el-col :span="8" class="toolbar-right">
        <el-space>
          <el-button circle :icon="Search" @click="toggleSearch" />
          <el-button circle :icon="Refresh" @click="getList" />
        </el-space>
      </el-col>
    </el-row>

    <el-table v-loading="loading" :data="pitfallList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="ID" align="center" prop="id" width="80" />
      <el-table-column label="标题" align="center" prop="title" :show-overflow-tooltip="true" />
      <el-table-column label="封面" align="center" prop="coverUrl" width="100">
        <template #default="scope">
          <el-image
            style="width: 50px; height: 50px"
            :src="scope.row.coverUrl"
            :preview-src-list="[scope.row.coverUrl]"
            fit="cover"
            v-if="scope.row.coverUrl"
          />
        </template>
      </el-table-column>
      <el-table-column label="摘要" align="center" prop="summary" :show-overflow-tooltip="true" />
      <el-table-column label="创建时间" align="center" prop="createTime" width="180" />
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template #default="scope">
          <el-button link type="primary" @click="handleView(scope.row)">查看</el-button>
          <el-button link type="primary" :icon="Edit" @click="handleUpdate(scope.row)">修改</el-button>
          <el-button link type="danger" :icon="Delete" @click="handleDelete(scope.row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <div class="pagination-container">
        <el-pagination
        v-show="total > 0"
        v-model:current-page="queryParams.page"
        v-model:page-size="queryParams.size"
        :page-sizes="[10, 20, 30, 50]"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        />
    </div>

    <PitfallEditor 
      v-model:visible="editorVisible"
      :data="currentData"
      @success="handleQuery"
    />

    <el-drawer v-model="detailVisible" :title="detailData?.title || '详情'" size="55%" destroy-on-close>
      <el-descriptions :column="1" border>
        <el-descriptions-item label="标题">{{ detailData?.title }}</el-descriptions-item>
        <el-descriptions-item label="摘要">{{ detailData?.summary }}</el-descriptions-item>
        <el-descriptions-item label="创建时间">{{ detailData?.createTime }}</el-descriptions-item>
        <el-descriptions-item label="封面">
          <el-image
            v-if="detailData?.coverUrl"
            style="width: 160px; height: 160px"
            :src="detailData.coverUrl"
            :preview-src-list="[detailData.coverUrl]"
            fit="cover"
          />
        </el-descriptions-item>
      </el-descriptions>
      <div class="detail-content" v-loading="detailLoading" v-html="detailData?.content"></div>
    </el-drawer>
  </div>
</template>

<script setup name="Pitfall">
import { ref, reactive, toRefs, onMounted } from 'vue'
import { page, detail, del } from '@/api/pitfall'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Search, Refresh, Plus, Edit, Delete } from '@element-plus/icons-vue'
import PitfallEditor from './components/PitfallEditor.vue'

const loading = ref(true)
const ids = ref([])
const single = ref(true)
const multiple = ref(true)
const showSearch = ref(true)
const total = ref(0)
const pitfallList = ref([])
const editorVisible = ref(false)
const currentData = ref({})
const detailVisible = ref(false)
const detailLoading = ref(false)
const detailData = ref(null)

const data = reactive({
  queryParams: {
    page: 1,
    size: 10,
    keyword: undefined
  }
})

const { queryParams } = toRefs(data)

/** 查询列表 */
async function getList() {
  loading.value = true
  try {
    const response = await page(queryParams.value)
    pitfallList.value = response.data.records
    total.value = response.data.total
  } catch (e) {
    pitfallList.value = []
    total.value = 0
  } finally {
    loading.value = false
  }
}

/** 搜索按钮操作 */
function handleQuery() {
  queryParams.value.page = 1
  getList()
}

/** 重置按钮操作 */
function resetQuery() {
  queryParams.value.keyword = undefined
  handleQuery()
}

function toggleSearch() {
  showSearch.value = !showSearch.value
}

/** 多选框选中数据 */
function handleSelectionChange(selection) {
  ids.value = selection.map(item => item.id)
  single.value = selection.length != 1
  multiple.value = !selection.length
}

/** 新增按钮操作 */
function handleAdd() {
  currentData.value = {}
  editorVisible.value = true
}

/** 修改按钮操作 */
async function handleUpdate(row) {
  const id = row?.id || ids.value[0]
  if (!id) return
  try {
    const res = await detail(id)
    currentData.value = JSON.parse(JSON.stringify(res.data || {}))
    editorVisible.value = true
  } catch (e) {
  }
}

async function handleView(row) {
  const id = row?.id
  if (!id) return
  detailVisible.value = true
  detailLoading.value = true
  try {
    const res = await detail(id)
    detailData.value = res.data
  } catch (e) {
    detailVisible.value = false
  } finally {
    detailLoading.value = false
  }
}

/** 删除按钮操作 */
function handleDelete(row) {
  const deleteIds = row.id ? [row.id] : ids.value
  ElMessageBox.confirm('是否确认删除选中的数据项？', '系统提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    try {
      for (const id of deleteIds) {
        await del(id)
      }
      ElMessage.success('删除成功')
      getList()
    } catch (e) {
    }
  }).catch(() => {})
}

/** 分页大小改变 */
function handleSizeChange(val) {
  queryParams.value.size = val
  getList()
}

/** 当前页改变 */
function handleCurrentChange(val) {
  queryParams.value.page = val
  getList()
}

onMounted(() => {
  getList()
})
</script>

<style scoped>
.app-container {
  padding: 0;
}
.mb8 {
  margin-bottom: 8px;
}
.toolbar-right {
  display: flex;
  justify-content: flex-end;
}
.pagination-container {
    margin-top: 20px;
    display: flex;
    justify-content: flex-end;
}
.detail-content {
  margin-top: 16px;
  padding: 12px;
  background: #fff;
  border: 1px solid #ebeef5;
  border-radius: 4px;
  min-height: 120px;
}
</style>
