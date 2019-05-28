/*
 * 接口统一集成模块
 */
// import * as login from './sys/login'
import * as user from './sys/user'
import * as dept from './sys/dept'
import * as role from './sys/role'
import * as menu from './sys/menu'
import * as dict from './sys/dict'
import * as log from './sys/log'

// 默认全部导出
export default {
  // login,
  user,
  dept,
  role,
  menu,
  dict,
  log
}
