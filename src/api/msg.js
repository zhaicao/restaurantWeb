import request from '@/utils/request'

/*
获取消息列表
* */
export function getMsgList(queryParams) {
  let msgType = -1
  let isComplete = -1
  // 处理页面msgType和isComplete为null或undefined时，设置为-1
  if (queryParams.msgType !== '' && queryParams.msgType !== null && typeof queryParams.msgType !== 'undefined')
    msgType = queryParams.msgType
  if (queryParams.isComplete !== '' && queryParams.isComplete !== null && typeof queryParams.isComplete !== 'undefined')
    isComplete = queryParams.isComplete
  return request({
    url: '/message/getMessageList',
    method: 'get',
    params: {
      'currentPage': 1,
      'pageSize': 10,
      'msgOrderId': queryParams.msgOrderId,
      'msgType': msgType,
      'isComplete': isComplete,
      'startDate': queryParams.startDate,
      'endDate': queryParams.endDate
    }
  })
}

/*
根据订单号和类型获得消息列表
* */
export function getMsgListByOrderIdAndType(orderId, msgType) {
  return request({
    url: '/message/getMessageList',
    method: 'get',
    params: {
      'currentPage': 1,
      'pageSize': 100,
      'msgOrderId': orderId,
      'msgType': msgType,
      'isComplete': -1,
      'startDate': '',
      'endDate': ''
    }
  })
}

/**
 * 处理单个催单消息
 * @param msgId 消息Id
 * @returns {*} request
 */
export function completeUrgeMsg(msgIds) {
  return request({
    url: '/message/completeUrgeMsg',
    method: 'put',
    params: { 'messageIds': msgIds }
  })
}

