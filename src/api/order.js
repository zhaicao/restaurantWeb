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

/**
 * 订单结账
 * @param orderId
 * @returns {*}
 */
export function checkOut(orderId) {
  return request({
    url: '/order/updateOrderstakong',
    method: 'put',
    params: { orderId: orderId }
  })
}

/**
 * 撤销订单
 * @param orderId
 */
export function cancelOrder(orderId) {
  return request({
    url: '/order/deleteOrderbyorderid',
    method: 'delete',
    params: { orderId: orderId }
  })
}

