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
/*
增加桌位
* */
export function addSeat(seatForm) {
  return request({
    url: '/table/addTable',
    method: 'post',
    data: seatForm
  })
}
/*
更新桌位信息
* */
export function updateSeat(seatForm) {
  return request({
    url: '/table/updateTable',
    method: 'put',
    data: seatForm
  })
}

/*
删除菜品
* */
export function deleteSeat(tableId) {
  return request({
    url: '/table/deleteTableById',
    method: 'delete',
    params: { 'tableId': tableId }
  })
}

