import request from '@/utils/request'

/*
获取订单列表
* */
export function getOrderList(queryParams) {
  return request({
    url: '/order/getOrderList',
    method: 'get',
    params: queryParams
  })
}

export function getOrderFoodListByTableId(tableId) {
  return request({
    url: '/order/getOrderByTableId',
    method: 'get',
    params: {
      tableId: tableId
    }
  })
}

/**
 *
 * @param order
 * @returns {*}
 */
export function addOrderFood(tableId, foodList) {
  return request({
    url: '/order/addOrder',
    method: 'post',
    data: {
      tableNo: tableId,
      foodList: foodList,
    }
  })
}

