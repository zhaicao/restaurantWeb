<template>
  <div class="app-container">
    <div class="filter-container">
      <el-input
        placeholder="用户名/工号"
        v-model="listQuery.title"
        style="width: 200px;"
        class="filter-item"
        @keyup.enter.native="handleFilter"/>

      <el-input
        placeholder="姓名"
        v-model="listQuery.title"
        style="width: 200px;"
        class="filter-item"
        @keyup.enter.native="handleFilter"/>
      <el-select v-model="listQuery.roles"
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
    </div>

    <!--Table-->
    <el-table
      v-loading="listLoading"
      :key="tableKey"
      :data="list"
      border
      fit
      highlight-current-row
      style="width: 100%;"
      @sort-change="sortChange">
      <el-table-column label="序号" prop="id" sortable="custom" align="center" width="65">
        <template slot-scope="scope">
          <span>{{ scope.row.id }}</span>
        </template>
      </el-table-column>
      <el-table-column label="用户名/工号" width="200px" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.userName }}</span>
        </template>
      </el-table-column>
      <el-table-column label="姓名" width="200px" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.realName }}</span>
        </template>
      </el-table-column>
      <el-table-column label="类型" align="center" width="140px">
        <template slot-scope="scope">
          <el-tag>{{ scope.row.role | typeFilter }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="上班时间" align="center" width="245px">
        <template slot-scope="scope">
          <span>{{ scope.row.display_time }}</span>
        </template>
      </el-table-column>
      <el-table-column label="下班时间" align="center" width="245px">
        <template slot-scope="scope">
          <span>{{ scope.row.display_time }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" min-width="200px" class-name="small-padding fixed-width">
        <template slot-scope="scope">
          <el-button type="danger" size="mini"  @click="handleModifyStatus(scope.row,'deleted')">删除</el-button>
        </template>
      </el-table-column>
    </el-table>
    <!--\Table-->

    <!--分页插件-->
    <pagination v-show="total>0" :total="total" :page.sync="listQuery.page" :limit.sync="listQuery.limit" @pagination="getList" />

    <!--Dialog-->
    <el-dialog :title="dialogStatus" :visible.sync="dialogFormVisible">
        <TakePhotos ref="takePhotos"></TakePhotos>
      <div slot="footer" class="dialog-footer">
        <el-button @click="cancelCloseDialog()">取消</el-button>
        <el-button type="primary" @click="dialogStatus==='签到'?punchInData():punchOutData()">{{dialogStatus}}</el-button>
      </div>
    </el-dialog>
    <!--\Dialog-->

  </div>
</template>

<script>
  import { fetchList, fetchPv, createArticle, updateArticle } from '@/api/article'
  import waves from '@/directive/waves' // Waves directive
  import Pagination from '@/components/Pagination' // Secondary package based on el-pagination
  import TakePhotos from '@/views/userInfo/component/takePhoto'

  // 定义角色对应列表
  const attendanceType = [{
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
    name: 'UserMgmt',
    components: { Pagination, TakePhotos },
    directives: { waves },
    filters: {
      statusFilter(status) {
        const statusMap = {
          published: 'success',
          draft: 'info',
          deleted: 'danger'
        }
        return statusMap[status]
      },
      // 角色根据ID显示名字
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
          page: 1,
          limit: 10,
          role: undefined,
          title: undefined,
          type: undefined,
          sort: '+id'
        },
        attendanceType,
        sortOptions: [{ label: 'ID Ascending', key: '+id' }, { label: 'ID Descending', key: '-id' }],
        statusOptions: ['published', 'draft', 'deleted'],
        showReviewer: false,
        // Dialog中数据
        userForm: {
          id: undefined,
          role: 0,
          userName: '',
          realName: '',
          phone: ''
        },
        // 默认Dialog表单不可见
        dialogFormVisible: false,
        dialogStatus: '',
        // Dialog的Title
        textMap: {
          punchIn: '签到',
          punchOut: '签退'
        },
        dialogPvVisible: false,
        pvData: [],
        // 表单rules
        rules: {
          role: [{ required: true, message: '请选择角色', trigger: 'change' }],
          userName: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
          realName: [{ required: true, message: '请输入真实姓名', trigger: 'blur' }],
          phone: [{ required: true, message: '请输入联系电话', trigger: 'blur' }],
        },
        downloadLoading: false
      }
    },
    created() {
      this.getList()
    },
    methods: {
      // Dialog取消
      cancelCloseDialog(){
        this.dialogFormVisible = false;
        this.$nextTick(() => {
          this.$refs.takePhotos.cancelCloseVideo()
        })
      },
      // 获取数据
      getList() {
        this.listLoading = true
        fetchList(this.listQuery).then(response => {
          this.list = response.data.items
          this.total = response.data.total
          // Just to simulate the time of the request
          setTimeout(() => {
            this.listLoading = false
          }, 1 * 1000)
        })
      },
      // 过滤
      handleFilter() {
        this.listQuery.page = 1
        this.getList()
      },
      // 修改操作状态
      handleModifyStatus(row, status) {
        this.$message({
          message: '操作成功',
          type: 'success'
        })
        row.status = status
      },
      sortChange(data) {
        const { prop, order } = data
        if (prop === 'id') {
          this.sortByID(order)
        }
      },
      sortByID(order) {
        if (order === 'ascending') {
          this.listQuery.sort = '+id'
        } else {
          this.listQuery.sort = '-id'
        }
        this.handleFilter()
      },
      // 重置表单
      resetForm() {
        this.userForm = {
          id: undefined,
          role: 0,
          userName: '',
          realName: '',
          phone: ''
        }
      },
      // 添加按钮事件
      handleAttendence(type) {
        this.dialogStatus = this.textMap[type]
        // 渲染完毕后开启摄像头
        this.$nextTick(() => {
          this.$refs.takePhotos.getVideo()
        })
        this.dialogFormVisible = true
      },
      // Dialog-添加事件
      punchInData() {
        this.$notify({
                    title: '签到',
                    message: '签到成功',
                    type: 'success',
                    duration: 2000
                  })
        this.cancelCloseDialog()

        // this.$refs['dataForm'].validate((valid) => {
        //   if (valid) {
        //     //调用API
        //     createArticle(this.userForm).then(() => {
        //       this.list.unshift(this.userForm)
        //       this.dialogFormVisible = false
        //       this.$notify({
        //         title: '成功',
        //         message: '创建成功',
        //         type: 'success',
        //         duration: 2000
        //       })
        //       console.info(this.list)
        //     })
        //   }
        // })
      },
      // Dialog更新事件
      punchOutData() {
        this.$notify({
          title: '签退',
          message: '签退成功',
          type: 'success',
          duration: 2000
        })
        this.cancelCloseDialog()
      },
      // 删除按钮事件
      handleDelete(row) {
        this.$notify({
          title: '成功',
          message: '删除成功',
          type: 'success',
          duration: 2000
        })
        const index = this.list.indexOf(row)
        this.list.splice(userMgmt, 1)
      }
    }
  }
</script>
