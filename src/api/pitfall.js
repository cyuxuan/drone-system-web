import request from '@/utils/request'

// 分页查询
export function page(params) {
  return request({
    url: '/pitfall/page',
    method: 'get',
    params
  })
}

// 详情
export function detail(id) {
  return request({
    url: `/pitfall/${id}`,
    method: 'get'
  })
}

// 新增
export function add(data) {
  return request({
    url: '/pitfall/add',
    method: 'post',
    data
  })
}

// 修改
export function update(data) {
  return request({
    url: '/pitfall/update',
    method: 'post',
    data
  })
}

// 删除
export function del(id) {
  return request({
    url: `/pitfall/${id}`,
    method: 'delete'
  })
}

// 上传文件 (通常用于编辑器或封面)
export function uploadFile(file) {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('module', 'pitfall')
  return request({
    url: '/common/file/upload',
    method: 'post',
    data: formData,
    headers: { 'Content-Type': 'multipart/form-data' }
  })
}
