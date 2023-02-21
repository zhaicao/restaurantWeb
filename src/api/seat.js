import request from '@/utils/request'

/*
后台获取桌位列表
* */
export function getTableList(queryParams) {
  let tableUse = -1
  // 处理页面role为null或undefined时，设置为-1
  if (queryParams.tableUse !== '' && queryParams.tableUse !== null && typeof queryParams.tableUse !== 'undefined')
    tableUse = queryParams.tableUse
  return request({
    url: '/table/getTableList',
    method: 'get',
    params: {
      'currentPage': queryParams.currentPage,
      'pageSize': queryParams.pageSize,
      'tableId': queryParams.tableId,
      'tableName': queryParams.tableName,
      'tableUse': tableUse
    }
  })
}

/*
前台获取桌位列表
* */
export function getTableListAll() {
  return request({
    url: '/table/getTableListAll',
    method: 'get'
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

