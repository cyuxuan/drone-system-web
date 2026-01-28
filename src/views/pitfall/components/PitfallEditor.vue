<template>
  <el-dialog
    :model-value="visible"
    :title="form.id ? '编辑避坑指南' : '新增避坑指南'"
    class="pitfall-editor-dialog"
    width="95%"
    @close="handleClose"
    destroy-on-close
    append-to-body
    :close-on-click-modal="false"
  >
    <el-form ref="formRef" :model="form" :rules="rules" label-width="80px" v-loading="loading">
      <el-row>
        <el-col :span="24">
          <el-form-item label="标题" prop="title">
            <el-input v-model="form.title" placeholder="请输入标题" maxlength="255" show-word-limit />
          </el-form-item>
        </el-col>
      </el-row>
      
      <el-row>
         <el-col :span="24">
           <el-form-item label="封面" prop="coverUrl">
             <el-upload
               class="avatar-uploader"
               action="#"
               :show-file-list="false"
               :http-request="handleCoverUpload"
               accept="image/*"
               v-loading="uploadLoading"
             >
               <img v-if="form.coverUrl" :src="form.coverUrl" class="avatar" />
               <el-icon v-else class="avatar-uploader-icon"><Plus /></el-icon>
             </el-upload>
             <div class="el-upload__tip">只能上传jpg/png文件，且不超过2MB</div>
           </el-form-item>
         </el-col>
      </el-row>

      <el-row>
        <el-col :span="24">
          <el-form-item label="摘要" prop="summary">
            <el-input 
              v-model="form.summary" 
              type="textarea" 
              :rows="3" 
              placeholder="请输入摘要" 
              maxlength="500"
              show-word-limit
            />
          </el-form-item>
        </el-col>
      </el-row>

      <el-row>
        <el-col :span="24">
          <el-form-item label="内容" prop="content">
            <div style="border: 1px solid #dcdfe6; width: 100%;">
              <Toolbar
                style="border-bottom: 1px solid #dcdfe6"
                :editor="editorRef"
                :defaultConfig="toolbarConfig"
                :mode="mode"
              />
              <Editor
                style="height: 420px; overflow-y: hidden;"
                v-model="form.content"
                :defaultConfig="editorConfig"
                :mode="mode"
                @onCreated="handleCreated"
              />
            </div>
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>
    <template #footer>
      <div class="dialog-footer">
        <el-button @click="handleClose">取 消</el-button>
        <el-button type="primary" @click="handleSubmit" :loading="loading">确 定</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, reactive, shallowRef, onBeforeUnmount, watch } from 'vue'
import { Editor, Toolbar } from '@wangeditor/editor-for-vue'
import '@wangeditor/editor/dist/css/style.css'
import { add, update, uploadFile } from '@/api/pitfall'
import { ElMessage } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'

const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  },
  data: {
    type: Object,
    default: () => ({})
  }
})

const emit = defineEmits(['update:visible', 'success'])

const formRef = ref(null)
const loading = ref(false)
const uploadLoading = ref(false)
const form = reactive({
  id: null,
  title: '',
  summary: '',
  content: '',
  coverUrl: ''
})

const rules = {
  title: [{ required: true, message: '请输入标题', trigger: 'blur' }],
  content: [{ required: true, message: '请输入内容', trigger: 'blur' }]
}

// Editor instance
const editorRef = shallowRef()
const mode = 'default'
const toolbarConfig = {
    excludeKeys: [
        'group-video'
    ]
}
const editorConfig = { 
  placeholder: '请输入内容...',
  MENU_CONF: {
    uploadImage: {
      async customUpload(file, insertFn) {
        try {
          const res = await uploadFile(file)
          if (res.code === 200) {
            insertFn(res.data.url, res.data.fileName, res.data.url)
          } else {
            ElMessage.error(res.msg || '上传失败')
          }
        } catch (error) {
          ElMessage.error('上传出错')
        }
      }
    }
  }
}

const handleCreated = (editor) => {
  editorRef.value = editor
}

watch(() => props.visible, (val) => {
  if (val) {
    if (props.data && props.data.id) {
      Object.assign(form, props.data)
    } else {
      resetForm()
    }
  }
})

const resetForm = () => {
  form.id = null
  form.title = ''
  form.summary = ''
  form.content = ''
  form.coverUrl = ''
  if (formRef.value) {
      formRef.value.resetFields()
  }
}

const handleClose = () => {
  emit('update:visible', false)
}

const handleCoverUpload = async (options) => {
  const isImage = options.file.type.startsWith('image/')
  const isLt2M = options.file.size / 1024 / 1024 < 2

  if (!isImage) {
    ElMessage.error('上传头像图片只能是图片格式!')
    return
  }
  if (!isLt2M) {
    ElMessage.error('上传头像图片大小不能超过 2MB!')
    return
  }
  
  uploadLoading.value = true
  try {
    const res = await uploadFile(options.file)
    if (res.code === 200) {
      form.coverUrl = res.data.url
    } else {
        ElMessage.error(res.msg || '上传失败')
    }
  } catch (error) {
    console.error(error)
    ElMessage.error('上传出错')
  } finally {
      uploadLoading.value = false
  }
}

const handleSubmit = async () => {
  if (!formRef.value) return
  await formRef.value.validate(async (valid) => {
    if (valid) {
      loading.value = true
      try {
        if (form.id) {
          await update(form)
        } else {
          await add(form)
        }
        ElMessage.success('操作成功')
        emit('success')
        handleClose()
      } finally {
        loading.value = false
      }
    }
  })
}

onBeforeUnmount(() => {
  const editor = editorRef.value
  if (editor == null) return
  editor.destroy()
})
</script>

<style scoped>
.avatar-uploader .avatar {
  width: 178px;
  height: 178px;
  display: block;
  object-fit: cover;
}

:deep(.avatar-uploader .el-upload) {
  border: 1px dashed var(--el-border-color);
  border-radius: 6px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  transition: var(--el-transition-duration-fast);
}

:deep(.avatar-uploader .el-upload:hover) {
  border-color: var(--el-color-primary);
}

.avatar-uploader-icon {
  font-size: 28px;
  color: #8c939d;
  width: 178px;
  height: 178px;
  text-align: center;
  line-height: 178px;
}

:deep(.pitfall-editor-dialog) {
  max-width: 1000px;
}
</style>
