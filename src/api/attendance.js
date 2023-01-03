import request from '@/utils/request'

/*
获取考勤列表
* */
export function getAttendanceList(queryParams) {
  return request({
    url: '/attendance/getAttendanceList',
    method: 'get',
    params: queryParams
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

