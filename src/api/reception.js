import request from '@/utils/request'

/*
获取用户列表
* */
export function getList(queryParams) {
  let role = -1
  // 处理页面role为null或undefined时，设置为-1
  if (queryParams.role !== '' && queryParams.role !== null && typeof queryParams.role !== 'undefined')
    role = queryParams.role
  return request({
    url: '/user/getUserList',
    method: 'get',
    params: {
      'currentPage': queryParams.currentPage,
      'pageSize': queryParams.pageSize,
      'userId': queryParams.userId,
      'loginName': queryParams.loginName,
      'realName': queryParams.realName,
      'role': role,
      'phone': queryParams.phone
    }
  })
}

/*
通过Id获取用户信息
* */
export function getUserInfo(uid) {
  return request({
    url: '/user/getUserById',
    method: 'get',
    params: { 'userId': uid }
  })
}
/*
添加用户
* */
export function addUser(userForm) {
  userForm['password'] = '123456' // 默认密码
  return request({
    url: '/user/addUser',
    method: 'post',
    data: userForm
  })
}
/*
更新用户信息
* */
export function updateUser(userForm) {
  return request({
    url: '/user/updateUser/' + userForm.uid,
    method: 'put',
    data: userForm, // 若body使用formData，需要使用transformRequest
    transformRequest: [data => {
      let ret = ''
      for (let item in data) {
        ret += encodeURIComponent(item) + '=' + encodeURIComponent(data[item]) + '&'
      }
      return ret
    }]
  })
}
/*
通过Id删除用户信息
* */
export function deleteUser(userId) {
  return request({
    url: '/user/deleteUserById/' + userId,
    method: 'delete'
  })
}

/*
通过userId重置用户密码
* */
export function resetPwd(userId) {
  return request({
    url: '/user/resetUserPassword/' + userId,
    method: 'put'
  })
}

