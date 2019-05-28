import router from './router'
import store from './store'
// import { Message } from 'element-ui'
import NProgress from 'nprogress' // progress bar
import 'nprogress/nprogress.css'// progress bar style
import { getToken } from '@/utils/auth' // getToken from cookie

NProgress.configure({ showSpinner: false })// NProgress Configuration

// permission judge function
function hasPermission(roles, permissionRoles) {
  if (roles.indexOf('admin') >= 0) return true // admin permission passed directly
  if (!permissionRoles) return true
  return roles.some(role => permissionRoles.indexOf(role) >= 0)
}

const whiteList = ['/login', '/auth-redirect']// no redirect whitelist
function handleIFrameUrl(path) {
  // 嵌套页面，保存iframeUrl到store，供IFrame组件读取展示
  console.log('list', store.state.permission.iframeUrls)
  let url = path
  const length = store.state.permission.iframeUrls.length
  for (let i = 0; i < length; i++) {
    const iframe = store.state.permission.iframeUrls[i]
    console.log(path, iframe.path)
    if (path != null && path.endsWith(iframe.path)) {
      url = iframe.url
      console.log('seturl', url)
      store.commit('setIFrameUrl', url)
      break
    }
  }
}

let gettingMenu = true
router.beforeEach((to, from, next) => {
  NProgress.start() // start progress bar

  if (getToken()) { // determine if there has token
    /* has token*/
    if (to.path === '/login') {
      next({ path: '/' })
      NProgress.done() // if current page is dashboard will not trigger	afterEach hook, so manually handle it
    } else {
      handleIFrameUrl(to.path)

      if (store.getters.token.length > 0 && gettingMenu) { // 判断当前用户是否已拉取完user_info信息
        gettingMenu = false
        // store.dispatch('GetUserInfo').then(res => { // 拉取user_info
        console.log('menuRouteLoaded', store.state.permission.menuRouteLoaded)
        if (store.state.permission.menuRouteLoaded === false) {
          // const roles = res.data.roles // note: roles must be a array! such as: ['editor','develop']
          store.dispatch('GenerateRoutes', { }).then(() => { // 根据roles权限生成可访问的路由表
            router.addRoutes(store.getters.addRouters) // 动态添加可访问路由表
          })
          console.log('动态菜单和路由.')
        }
        next({ ...to, replace: true }) // hack方法 确保addRoutes已完成 ,set the replace: true so the navigation will not leave a history record
        // }).catch((err) => {
        //   store.dispatch('FedLogOut').then(() => {
        //     Message.error(err)
        //     next({ path: '/' })
        //   })
        // })
      } else {
        // 没有动态改变权限的需求可直接next() 删除下方权限判断 ↓
        if (hasPermission(store.getters.roles, to.meta.roles)) {
          next()
        } else {
          next({ path: '/401', replace: true, query: { noGoBack: true }})
        }
        // 可删 ↑
      }
    }
  } else {
    /* has no token*/
    if (whiteList.indexOf(to.path) !== -1) { // 在免登录白名单，直接进入
      next()
    } else {
      next(`/login?redirect=${to.path}`) // 否则全部重定向到登录页
      NProgress.done() // if current page is login will not trigger afterEach hook, so manually handle it
    }
  }
})

router.afterEach(() => {
  NProgress.done() // finish progress bar
})
