import request from '@/utils/request'

/*
获取考勤列表
* */
export function getAttendanceList(queryParams) {
  let type = -1
  // 处理页面role为null或undefined时，设置为-1
  if (queryParams.attendanceType !== '' && queryParams.attendanceType !== null && typeof queryParams.attendanceType !== 'undefined')
    type = queryParams.attendanceType
  return request({
    url: '/attendance/getAttendanceList',
    method: 'get',
    params: {
      'currentPage': queryParams.currentPage,
      'pageSize': queryParams.pageSize,
      'loginName': queryParams.loginName,
      'realName': queryParams.realName,
      'userId': queryParams.userId,
      'attendanceType': type
    }
  })
}
/*
上班打卡
* */
export function addAttendance(attendanceForm) {
  return request({
    url: '/attendance/addAttendance',
    method: 'post',
    data: attendanceForm
  })
}
/*
下班打卡
* */
export function updateFinish(attendanceForm) {
  return request({
    url: '/attendance/updateFinish',
    method: 'put',
    params: attendanceForm
  })
}

/*
请假
* */
export function addLeave(attendanceForm) {
  return request({
    url: '/attendance/addLeave',
    method: 'post',
    data: attendanceForm
  })
}

/*
通过Id删除考勤
* */
export function deleteAttendance(attendanceId) {
  return request({
    url: '/attendance/deleteAttendance',
    method: 'delete',
    params: { 'attendanceId': attendanceId }
  })
}

