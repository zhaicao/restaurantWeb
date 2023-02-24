import request from '@/utils/request'

/*
获取统计金额及订单列表
* */
export function getRevenueOrderList(queryParams) {
  return request({
    url: '/statistics/getRevenueOrderList',
    method: 'get',
    params: queryParams
  })
}

/*
获取统计图数据
* */
export function getRevenueChart(queryParams) {
  return request({
    url: '/statistics/getRevenueChart',
    method: 'get',
    params: queryParams
  })
}

/*
获取主页面板数据
* */
export function getRevenuePanelGroup(queryParams) {
  return request({
    url: '/statistics/getRevenuePanelGroup',
    method: 'get',
    params: queryParams
  })
}

