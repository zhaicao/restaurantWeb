import request from '@/utils/request'

/*
前台获取排号列表
* */
export function getAllNumber() {
  return request({
    url: '/queue//getAllNumber',
    method: 'get'
  })
}

/**
 * 删除排号
 * @param
 */
export function delQueue(QueueElement) {
  return request({
    url: '/queue/delNumber',
    method: 'delete',
    data: QueueElement
  })
}

/*
叫号
* */
export function getNumber(elementUserPhone) {
  return request({
    url: '/queue/getNumber',
    method: 'post',
    data: elementUserPhone
  })
}

/*
出列/入座
* */
export function takeNumber() {
  return request({
    url: '/queue/takeNumber',
    method: 'get'
  })
}

/*
重排
* */
export function regetNumber(QueueElement) {
  return request({
    url: '/queue/regetNumber',
    method: 'post',
    data: QueueElement
  })
}
