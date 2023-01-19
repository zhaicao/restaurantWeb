import request from '@/utils/request'

/*
获取消息列表
* */
export function getMsgList(msgForm) {
  return request({
    url: '/message/getMessageList',
    method: 'get',
    params: {
      'currentPage': 1,
      'pageSize': 10,
      'msgOrderId': '',
      'msgType': 1,
      'startDate': '',
      'endDate': ''
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
      'startDate': '',
      'endDate': ''
    }
  })
}

/**
 * 处理催单消息
 * @param msgId 消息Id
 * @returns {*} request
 */
export function solveUrgeMsg(msgId) {
  return request({
    url: '/message/solveUrgeMsg',
    method: 'put',
    params: { 'messageId': msgId }
  })
}

