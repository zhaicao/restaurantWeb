import { loginByUsername, logout } from '@/api/login'
import { getUserInfo } from '@/api/user'
import { getToken, setToken, removeToken, setUser, getUser, removeUser } from '@/utils/auth'

const user = {
  state: {
    name: '',
    avatar: '',
    introduction: '',
    token: getToken(),
    roles: []
  },
  mutations: {
    SET_TOKEN: (state, token) => {
      state.token = token
    },
    SET_NAME: (state, name) => {
      state.name = name
    },
    SET_AVATAR: (state, avatar) => {
      state.avatar = avatar
    },
    SET_INTRODUCTION: (state, introduction) => {
      state.introduction = introduction
    },
    SET_ROLES: (state, roles) => {
      state.roles = roles
    }
  },

  actions: {
    // 登录action
    LoginByUsername({ commit }, loginUser) {
      const username = loginUser.loginName.trim()
      return new Promise((resolve, reject) => {
        loginByUsername(username, loginUser.password).then(response => {
          if (response.data.code === 200) {
            commit('SET_TOKEN', response.data.data.token)
            // 设置用户uid及token
            setToken(response.data.data.token)
            setUser(response.data.data.user.uid)
            resolve(response.data)
          } else { reject('error') }
        }).catch(error => {
          reject(error)
        })
      })
    },

    // 获取用户信息
    GetUserInfo({ commit, state }) {
      return new Promise((resolve, reject) => {
        getUserInfo(getUser()).then(res => {
          let roles = []
          if (res.data.code === 200) {
            if (res.data.data.role === 0) {
              roles.push('admin')
            } else if (res.data.data.role === 1) {
              roles.push('waiter')
            } else if (res.data.data.role === 2) {
              roles.push('chef')
            } else {
              roles.push('error')
            }
            // 设置用户信息
            commit('SET_ROLES', roles)
            commit('SET_NAME', res.data.data.loginName)
            commit('SET_AVATAR', 'https://wpimg.wallstcn.com/f778738c-e4f8-4870-b634-56703b4acafe.gif')
            commit('SET_INTRODUCTION', res.data.data.realName)
          } else {
            reject('error')
          }
          resolve(roles)
        }).catch(error => {
          reject(error)
        })
      })
    },

    // 第三方验证登录
    // LoginByThirdparty({ commit, state }, code) {
    //   return new Promise((resolve, reject) => {
    //     commit('SET_CODE', code)
    //     loginByThirdparty(state.status, state.email, state.code).then(response => {
    //       commit('SET_TOKEN', response.data.token)
    //       setToken(response.data.token)
    //       resolve()
    //     }).catch(error => {
    //       reject(error)
    //     })
    //   })
    // },

    // 登出
    LogOut({ commit, state }) {
      return new Promise((resolve, reject) => {
        logout(state.token).then(() => {
          commit('SET_TOKEN', '')
          commit('SET_ROLES', [])
          removeToken()
          removeUser()
          resolve()
        }).catch(error => {
          reject(error)
        })
      })
    },

    // 前端 登出
    FedLogOut({ commit }) {
      return new Promise(resolve => {
        commit('SET_TOKEN', '')
        removeToken()
        resolve()
      })
    },

    // 动态修改权限
    ChangeRoles({ commit, dispatch }, role) {
      return new Promise(resolve => {
        commit('SET_TOKEN', role)
        removeToken(role)
        getUserInfo(role).then(response => {
          const data = response.data
          commit('SET_ROLES', data.roles)
          commit('SET_NAME', data.name)
          commit('SET_AVATAR', data.avatar)
          commit('SET_INTRODUCTION', data.introduction)
          dispatch('GenerateRoutes', data) // 动态修改权限后 重绘侧边菜单
          resolve()
        })
      })
    }
  }
}

export default user
