import request from '@/utils/request'

export function loginByUsername(username, password) {
  const data = {
    // username,
    // password
    'loginName': username,
    'password': password
  }
  return request({
    url: '/user/login',
    method: 'get',
    params: data
  })
}

export function logout() {
  return request({
    url: '/login/logout',
    method: 'post'
  })
}

export function getUserInfo(token) {
  return request({
    url: '/user/info',
    method: 'get',
    params: { token }
  })
}

