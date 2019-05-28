import axios from '@/utils/request'

/*
 * 日志管理模块
 */

// 分页查询
export const findPage = (data) => {
  return axios({
    url: '/log/findPage',
    method: 'post',
    data
  })
}
