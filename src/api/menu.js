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
  const format = new window.FormData()
  format.append('file', menuForm.menuImg[0].raw)
  return request({
    url: '/menu/addMenu',
    method: 'post',
    params: { // 不可直接传menuForm，因为menuImg是array且有file对象，会导致跨域错误
      'menuName': menuForm.menuName,
      'menuType': menuForm.menuType,
      'menuPrice': menuForm.menuPrice
    },
    data: format
  })
}
/*
更新菜品
* */
export function updateMenu(menuForm) {
  const format = new window.FormData()
  // 判断是否更新图片，若选择文件则有raw属性
  if (menuForm.menuImg[0].hasOwnProperty('raw'))
    format.append('file', menuForm.menuImg[0].raw)
  else
    // 若无raw则传一个空File，后端会处理不更新文件
    format.append('file', new File([''], ''))
  return request({
    url: '/menu/updateMenu',
    method: 'put',
    params: { // 不可直接传menuForm，因为menuImg是array且有file对象，会导致跨域错误
      'foodId': menuForm.foodId,
      'menuName': menuForm.menuName,
      'menuType': menuForm.menuType,
      'menuPrice': menuForm.menuPrice
    },
    data: format
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

