import request from '@/utils/request'

/*
获取菜单列表
* */
export function getMenuList(queryParams) {
  return request({
    url: '/menu/getMenuList',
    method: 'get',
    params: queryParams
  })
}
/*
增加菜品
* */
export function addMenu(menuForm) {
  // 使用formdata的方式，后端读取MultipartFile
  let format = new window.FormData()
  format.append('file', menuForm.menuImage)
  return request({
    url: '/menu/addMenu',
    method: 'post',
    params: menuForm,
    data: format
  })
}
/*
更新菜品
* */
export function updateMenu(userForm) {
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
删除菜品
* */
export function deleteMenu(menuId) {
  return request({
    url: '/menu/deleteMenuById',
    method: 'delete',
    params: { 'foodId': menuId }
  })
}

