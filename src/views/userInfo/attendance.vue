<template>
  <div class="app-container">
    <div class="filter-container">
      <el-input
        placeholder="用户名/工号"
        v-model="listQuery.loginName"
        style="width: 200px;"
        class="filter-item"
        @keyup.enter.native="handleFilter"/>

      <el-input
        placeholder="姓名"
        v-model="listQuery.realName"
        style="width: 200px;"
        class="filter-item"
        @keyup.enter.native="handleFilter"/>
      <el-select v-model="listQuery.attendanceType"
                 placeholder="类型"
                 clearable style="width: 90px"
                 class="filter-item">
        <el-option v-for="item in attendanceType"
                   :key="item.value"
                   :label="item.label"
                   :value="item.value"/>
      </el-select>
      <el-button v-waves class="filter-item" type="primary" icon="el-icon-search" @click="handleFilter">查询</el-button>
      <el-button class="filter-item" style="margin-right: 10px; float: right;" type="primary" icon="el-icon-edit" @click="handleAttendence('punchOut')">签退</el-button>
      <el-button class="filter-item" style="margin-right: 10px; float: right;" type="primary" icon="el-icon-edit" @click="handleAttendence('punchIn')">签到</el-button>
      <el-button class="filter-item" style="margin-right: 10px; float: right;" type="warning" icon="el-icon-star-off" @click="handleLeave()">请假</el-button>
    </div>

    <!--Table-->
    <el-table
      v-loading="listLoading"
      :key="tableKey"
      :data="list"
      border
      fit
      highlight-current-row
      style="width: 100%;">
      <el-table-column label="序号" prop="id" sortable="custom" align="center" width="65">
        <template slot-scope="scope">
          <span>{{ scope.$index+1 }}</span>
        </template>
      </el-table-column>
      <el-table-column label="用户名/工号" width="200px" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.user.loginName }}</span>
        </template>
      </el-table-column>
      <el-table-column label="姓名" width="200px" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.user.realName }}</span>
        </template>
      </el-table-column>
      <el-table-column label="类型" align="center" width="140px">
        <template slot-scope="scope">
          <el-tag>{{ scope.row.attendanceType | typeFilter }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="上班时间" align="center" width="245px">
        <template slot-scope="scope">
          <span>{{ scope.row.attendanceDate }}</span>
        </template>
      </el-table-column>
      <el-table-column label="下班时间" align="center" width="245px">
        <template slot-scope="scope">
          <span>{{ scope.row.attendanceFinish }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" min-width="200px" class-name="small-padding fixed-width">
        <template slot-scope="scope">
          <el-button type="danger" size="mini"  @click="handleDelete(scope.row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>
    <!--\Table-->

    <!--分页插件-->
    <pagination v-show="total>0" :total="total" :page.sync="listQuery.currentPage" :limit.sync="listQuery.pageSize" @pagination="getList" />

    <!--Dialog-->
    <el-dialog :title="dialogStatus" :visible.sync="dialogFormVisible">
      <div>
        <TakePhotos ref="takePhotos"/>
      </div>
      <div slot="footer" class="dialog-footer">
        <el-button @click="cancelCloseDialog()">取消</el-button>
        <el-button type="primary" @click="dialogStatus==='签到'?punchInData():punchOutData()">{{dialogStatus}}</el-button>
      </div>
    </el-dialog>
    <!--\Dialog-->

  </div>
</template>

<script>
  import { fetchList } from '@/api/article'
  import { getAttendanceList, addAttendance, updateFinish, addLeave, deleteAttendance } from '@/api/attendance'
  import waves from '@/directive/waves' // Waves directive
  import Pagination from '@/components/Pagination' // Secondary package based on el-pagination
  import TakePhotos from '@/views/userInfo/component/takePhoto'

  // 定义角色对应列表
  const attendanceType = [{
    value: -1,
    label: '全部'
  },{
    value: 0,
    label: '正常'
  },{
    value: 1,
    label: '请假'
  }]

  // arr to obj ,such as { 0 : "管理员", 1 : "服务员" }
  const attendanceTypeKeyValue = attendanceType.reduce((acc, cur) => {
    acc[cur.value] = cur.label
    return acc
  }, {})

  export default {
    name: 'attendance',
    components: { Pagination, TakePhotos },
    directives: { waves },
    filters: {
      // 类型显示名字
      typeFilter(attType) {
        if (attType == 0 || attType == 1)
          return attendanceTypeKeyValue[attType]
        else
          return 'Other'
      }
    },
    data() {
      return {
        tableKey: 0,
        list: null,
        total: 0,
        listLoading: true,
        // 查询数据和分页数据
        listQuery: {
          currentPage: 1,
          pageSize: 10,
          loginName: undefined,
          realName: undefined,
          // 若是管理员则查看全部，非管理员仅查看自己的
          userId: this.$store.state.user.roles[0] === 'admin' ? undefined : this.$store.state.user.userId,
          attendanceType: -1
        },
        attendanceType,
        // Dialog中数据
        attendanceForm: {
          userId: this.$store.state.user.userId,
          attendanceType: undefined,
        },
        // 默认Dialog表单不可见
        dialogFormVisible: false,
        dialogStatus: '',
        // Dialog的Title
        textMap: {
          punchIn: '签到',
          punchOut: '签退'
        }
      }
    },
    created() {
      this.getList()
    },
    methods: {
      // Dialog取消
      cancelCloseDialog(){
        this.dialogFormVisible = false;
        // 等Dom更新完后执行回调函数
        this.$nextTick(() => {
          this.$refs.takePhotos.cancelCloseVideo()
        })
      },
      // 获取数据
      getList() {
        this.listLoading = true
        getAttendanceList(this.listQuery).then(res => {
          this.list = res.data.data.records
          this.total = res.data.data.total
          // Just to simulate the time of the request
          setTimeout(() => {
            this.listLoading = false
          }, 1 * 1000)
        })
      },
      // 过滤
      handleFilter() {
        this.listQuery.currentPage = 1
        this.getList()
      },
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
      // 删除按钮事件
      handleDelete(row) {
        this.$confirm('此操作将删除该考勤数据, 是否继续?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          deleteAttendance(row.attendanceId).then(res => {
            if (res.data.code === 200) {
              this.$notify({
                title: '成功',
                message: '删除成功',
                type: 'success',
                duration: 2000
              })
              const index = this.list.indexOf(row)
              this.list.splice(index, 1)
            } else
              this.$message.error(res.data.message)
        })
        }).catch(() => {})
      }
    }
  }
</script>
