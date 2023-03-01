import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

/* Layout */
import Layout from '@/views/layout/Layout'

/* Router Modules */
// import chartsRouter from './modules/charts'

/** note: Submenu only appear when children.length>=1
 *  detail see  https://panjiachen.github.io/vue-element-admin-site/guide/essentials/router-and-nav.html
 **/

/**
* hidden: true                   if `hidden:true` will not show in the sidebar(default is false)
* alwaysShow: true               if set true, will always show the root menu, whatever its child routes length
*                                if not set alwaysShow, only more than one route under the children
*                                it will becomes nested mode, otherwise not show the root menu
* redirect: noredirect           if `redirect:noredirect` will no redirect in the breadcrumb
* name:'router-name'             the name is used by <keep-alive> (must set!!!)
* meta : {
    roles: ['admin','editor']     will control the page roles (you can set multiple roles)
    title: 'title'               the name show in submenu and breadcrumb (recommend set)
    icon: 'svg-name'             the icon show in the sidebar,
    noCache: true                if true ,the page will no be cached(default is false)
  }
**/

// 固定通用的路由
export const constantRouterMap = [
  {
    path: '/redirect',
    component: Layout,
    hidden: true,
    children: [
      {
        path: '/redirect/:path*',
        component: () => import('@/views/redirect/index')
      }
    ]
  },
  {
    path: '/login',
    component: () => import('@/views/login/index'),
    hidden: true
  },
  {
    path: '/auth-redirect',
    component: () => import('@/views/login/authredirect'),
    hidden: true
  },
  {
    path: '/404',
    component: () => import('@/views/errorPage/404'),
    hidden: true
  },
  {
    path: '/401',
    component: () => import('@/views/errorPage/401'),
    hidden: true
  },
/*  {
    path: '/documentation',
    component: Layout,
    redirect: '/documentation/index',
    hidden: true,
    children: [
      {
        path: 'index',
        component: () => import('@/views/documentation/index'),
        name: 'Documentation',
        meta: { title: 'documentation', icon: 'documentation', noCache: true }
      }
    ]
  },*/
/*  {
    path: '/guide',
    component: Layout,
    redirect: '/guide/index',
    hidden: true,
    children: [
      {
        path: 'index',
        component: () => import('@/views/guide/index'),
        name: 'Guide',
        meta: { title: 'guide', icon: 'guide', noCache: true }
      }
    ]
  }*/
]

export default new Router({
  // mode: 'history', // require service support
  scrollBehavior: () => ({ y: 0 }),
  routes: constantRouterMap
})

// 动态路由
export const asyncRouterMap = [
  {
    path: '', // 默认主页，故path为空且路由配置只有一个为空
    component: Layout,
    redirect: 'dashboard',
    meta: {
      roles: ['admin', 'chef']
    },
    children: [
      {
        path: 'dashboard',
        component: () => import('@/views/dashboard/index'),
        name: 'Dashboard',
        meta: { title: 'dashboard', icon: 'dashboard', noCache: true }
      }
    ]
  },
  {
    path: '/userInfo',
    component: Layout,
    redirect: '/userInfo/userMgmt',
    name: 'Users',
    meta: {
      title: '人员管理',
      icon: 'peoples',
      roles: ['admin', 'chef']
    },
    children: [
      {
        path: 'userMgmt',
        component: () => import('@/views/userInfo/userMgmt'),
        name: 'UserMgmt',
        meta: {
          title: '用户管理',
          roles: ['admin']
        }
      },
      {
        path: 'attendance',
        component: () => import('@/views/userInfo/attendance'),
        name: 'Attendance',
        meta: {
          title: '考勤管理',
          roles: ['admin', 'chef']
        }
      }
    ]
  },
  {
    path: '/restaurant',
    component: Layout,
    redirect: '/restaurant/menusMgmt',
    name: 'Shopping',
    meta: {
      title: '餐厅管理',
      icon: 'shopping',
      roles: ['admin']
    },
    children: [
      {
        path: 'menusMgmt',
        component: () => import('@/views/restaurantMgmt/menus'),
        name: 'MenusMgmt',
        meta: { title: '菜单管理' }
      },
      {
        path: 'seatsMgmt',
        component: () => import('@/views/restaurantMgmt/seats'),
        name: 'SeatsMgmt',
        meta: { title: '桌位/包间管理' }
      }
    ]
  },
  {
    path: '/order',
    component: Layout,
    redirect: '/order/dishMgmt',
    name: 'Orders',
    meta: {
      title: '订单管理',
      icon: 'list',
      roles: ['admin', 'chef']
    },
    children: [
      {
        path: 'dishMgmt',
        component: () => import('@/views/orderMgmt/dishMgmt'),
        name: 'DishMgmt',
        meta: {
          title: '新订单',
          roles: ['admin', 'chef']
        }
      },
      {
        path: 'orderMgmt',
        component: () => import('@/views/orderMgmt/orderMgmt'),
        name: 'OrderMgmt',
        meta: {
          title: '订单列表',
          roles: ['admin']
        }
      }
    ]
  },
  {
    path: '/message',
    component: Layout,
    redirect: 'message',
    meta: {
      title: '消息管理',
      icon: 'message',
      roles: ['admin', 'chef']
    },
    children: [
      {
        path: '',
        component: () => import('@/views/messageMgmt/message'),
        name: 'Message',
        meta: { title: '消息列表' }
      }
    ]
  },
  {
    path: '/revenue',
    component: Layout,
    redirect: 'revenue',
    meta: {
      icon: 'chart',
      roles: ['admin']
    },
    children: [
      {
        path: '',
        component: () => import('@/views/statistics/revenue'),
        name: 'Revenue',
        meta: { title: '营收情况' }
      }
    ]
  },
  {
    path: '/seats',
    component: () => import('@/views/reception/seats'),
    hidden: false,
    meta: {
      roles: ['waiter']
    }
  },
  {
    path: '/menu/:tableId',
    component: () => import('@/views/reception/menu'),
    hidden: false,
    meta: {
      roles: ['waiter']
    }
  },
  { path: '*', redirect: '/404', hidden: true }
]
