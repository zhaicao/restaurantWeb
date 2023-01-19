import request from '@/utils/request'

/*
获取新下单菜品列表
* */
export function getNewFoodList(foodForm) {
  return request({
    url: '/order/getNewFoodList',
    method: 'get',
    params: foodForm
  })
}

/*
上菜
* */
export function serveFoods(foodList) {
  return request({
    url: '/order/serveFoodsByList',
    method: 'put',
    data: foodList
  })
}

