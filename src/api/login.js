import request from '@/utils/request'

/*
登录接口
* */
export function loginByUsername(username, password) {
  const data = {
    'loginName': username,
    'password': password
  }
  return request({
    url: '/user/login',
    method: 'get',
    params: data
  })
}

/*
退出接口（模拟）
* */
export function logout() {
  return request({
    url: '/login/logout',
    method: 'post'
  })
}
