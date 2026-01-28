import axios from 'axios'
import { ElMessage } from 'element-plus'

const service = axios.create({
  baseURL: '/api', // Proxy will handle this or set absolute URL
  timeout: 10000
})

// Request interceptor
service.interceptors.request.use(
  config => {
    // Add token if needed, e.g. config.headers['Authorization'] = ...
    return config
  },
  error => {
    return Promise.reject(error)
  }
)

// Response interceptor
service.interceptors.response.use(
  response => {
    const res = response.data
    if (res.code !== 200) {
      ElMessage({
        message: res.msg || 'Error',
        type: 'error',
        duration: 5 * 1000
      })
      return Promise.reject(new Error(res.msg || 'Error'))
    } else {
      return res
    }
  },
  error => {
    const message =
      error?.response?.data?.msg ||
      error?.response?.data?.message ||
      error?.message ||
      'Request Error'
    ElMessage({
      message,
      type: 'error',
      duration: 5 * 1000
    })
    return Promise.reject(new Error(message))
  }
)

export default service
