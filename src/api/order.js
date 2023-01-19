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

