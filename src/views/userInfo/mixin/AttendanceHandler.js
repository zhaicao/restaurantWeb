import { addAttendance, updateFinish, addLeave } from '@/api/attendance'
import { mapGetters } from "vuex";

export default {
  data() {
    return {
      // 默认Dialog表单不可见
      dialogFormVisible: false,
      dialogStatus: '',
      // Dialog的Title
      textMap: {
        punchIn: '签到',
        punchOut: '签退'
      },
      // Dialog中数据
      attendanceForm: {
        userId: undefined,
        attendanceType: undefined
      }
    }
  },
  computed: {
    ...mapGetters([
      'userId'
    ])
  },
  created() {
    this.attendanceForm.userId = this.userId
  },
  methods: {
    // 签到/签退按钮
    handleAttendence(type) {
      this.dialogStatus = this.textMap[type]
      // 渲染完毕后开启摄像头
      this.$nextTick(() => {
        this.$refs.takePhotos.getVideo()
      })
      this.dialogFormVisible = true
    },
    // Dialog-签到事件
    punchInData() {
      addAttendance(this.attendanceForm).then(res => {
        if (res.data.code === 200) {
          this.$notify({
            title: '签到',
            message: '签到成功',
            type: 'success',
            duration: 2000
          })
          this.cancelCloseDialog()
        }
        else
          this.$message.error(res.data.message)
      })
    },
    // 签退事件
    punchOutData() {
      updateFinish(this.attendanceForm).then(res => {
        if (res.data.code === 200) {
          this.$notify({
            title: '签退',
            message: '签退成功',
            type: 'success',
            duration: 2000
          })
          this.cancelCloseDialog()
        } else
          this.$message.error(res.data.message)
      })
    },
    handleLeave() {
      this.$confirm('确定请假?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        addLeave(this.attendanceForm).then(res => {
          if (res.data.code === 200) {
            this.$message.success('请假成功')
          } else
            this.$message.error(res.data.message)
        })
      }).catch(() => {})
    },
    // Dialog取消
    cancelCloseDialog() {
      this.dialogFormVisible = false
      // 等Dom更新完后执行回调函数
      this.$nextTick(() => {
        this.$refs.takePhotos.cancelCloseVideo()
      })
    }
  }
}
