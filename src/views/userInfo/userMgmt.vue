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
      <el-select v-model="listQuery.role"
                 placeholder="角色"
                 clearable style="width: 90px"
                 class="filter-item">
        <el-option v-for="item in userRoles"
                   :key="item.value"
                   :label="item.label"
                   :value="item.value"/>
      </el-select>
      <el-input
        placeholder="联系电话"
        v-model="listQuery.phone"
        style="width: 200px;"
        class="filter-item"
        @keyup.enter.native="handleFilter"/>
      <el-button v-waves class="filter-item" type="primary" icon="el-icon-search" @click="handleFilter">查询</el-button>
      <el-button class="filter-item" style="margin-right: 10px; float: right;" type="primary" icon="el-icon-edit" @click="handleCreate">添加</el-button>
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
          <span>{{ scope.row.loginName }}</span>
        </template>
      </el-table-column>
      <el-table-column label="姓名" width="245px" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.realName }}</span>
        </template>
      </el-table-column>
      <el-table-column label="角色" align="center" width="200px">
        <template slot-scope="scope">
          <el-tag>{{ scope.row.role | roleFilter }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="联系电话" align="center" min-width="150px">
        <template slot-scope="scope">
          <span>{{ scope.row.phone }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" width="300px" class-name="small-padding fixed-width">
        <template slot-scope="scope">
          <div class="operation-column">
            <el-button type="primary" size="mini" @click="handleUpdate(scope.row)">编辑</el-button>
            <el-button type="danger" size="mini"  @click="handleDelete(scope.row)">删除</el-button>
            <el-button type="warning" size="small"  @click="handleResetPwd(scope.row)" v-if="scope.row.uid != userId">重置密码</el-button>
          </div>
        </template>
      </el-table-column>
    </el-table>
    <!--\Table-->

    <!--分页插件-->
    <pagination v-show="total>0" :total="total" :page.sync="listQuery.currentPage" :limit.sync="listQuery.pageSize" @pagination="getList" />

    <!--Dialog-->
    <el-dialog :title="textMap[dialogStatus]" :visible.sync="dialogFormVisible">
      <el-form ref="dataForm" :rules="rules" :model="userForm" label-position="left" label-width="70px" style="width: 400px; margin-left:50px;">
        <el-form-item label="角色" prop="role">
          <el-select v-model="userForm.role" class="filter-item" placeholder="Please select">
            <template v-for="item in userRoles">
              <el-option :key="item.value" :label="item.label" :value="item.value" v-if="item.value != -1"/>
            </template>
          </el-select>
        </el-form-item>
        <el-form-item label="用户名" prop="loginName" v-if="dialogStatus==='create'">
          <el-input v-model="userForm.loginName"/>
        </el-form-item>
        <el-form-item label="姓名" prop="realName">
          <el-input v-model="userForm.realName"/>
        </el-form-item>
        <el-form-item label="电话" prop="phone">
          <el-input v-model="userForm.phone"/>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false">{{ $t('table.cancel') }}</el-button>
        <el-button type="primary" @click="dialogStatus==='create'?createData():updateData()">{{ $t('table.confirm') }}</el-button>
      </div>
    </el-dialog>
    <!--\Dialog-->
  </div>
</template>

<script>
import { getUserList, addUser, updateUser, deleteUser, resetPwd } from '@/api/user'
import waves from '@/directive/waves' // Waves directive
import { parseTime } from '@/utils'
import Pagination from '@/components/Pagination'

// 定义角色对应列表
const userRoles = [{
  value: -1,
  label: '全部'
  },{
  value: 0,
  label: '管理员'
  },{
  value: 1,
  label: '服务员'
  },{
  value: 2,
  label: '厨师'
  }]

// arr to obj ,such as { 0 : "管理员", 1 : "服务员" }
const userRolesTypeKeyValue = userRoles.reduce((acc, cur) => {
  acc[cur.value] = cur.label
  return acc
}, {})

export default {
  name: 'UserMgmt',
  components: { Pagination },
  directives: { waves },
  filters: {
    // 角色根据role显示名字
    roleFilter(roleVal) {
      return userRolesTypeKeyValue[roleVal]
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
        userId: undefined,
        loginName: undefined,
        realName: undefined,
        role: -1,
        phone: undefined
      },
      // 角色
      userRoles,
      userId: this.$store.state.user.userId,
      // Dialog数据
      userForm: {
        id: undefined,
        role: 0,
        loginName: undefined,
        realName: undefined,
        phone: undefined
      },
      // 默认Dialog表单不可见
      dialogFormVisible: false,
      dialogStatus: '',
      // Dialog的Title
      textMap: {
        update: '编辑',
        create: '添加'
      },
      // 表单rules
      rules: {
        role: [{ required: true, message: '请选择角色', trigger: 'change' }],
        loginName: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
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
    // 获取数据
    getList() {
      this.listLoading = true
      getUserList(this.listQuery).then(response => {
        this.list = response.data.data.records
        this.total = response.data.data.total
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
    // 修改操作状态
    handleModifyStatus(row, status) {
      this.$message({
        message: '操作成功',
        type: 'success'
      })
      row.status = status
    },
    // 重置表单
    resetForm() {
      this.userForm = {
        id: undefined,
        role: 0,
        loginName: undefined,
        realName: undefined,
        phone: undefined
      }
    },
    // 添加按钮事件
    handleCreate() {
      this.resetForm()
      this.dialogStatus = 'create'
      this.dialogFormVisible = true
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
    },
    // Dialog-添加事件
    createData() {
      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
          // 增加用户API
          addUser(this.userForm).then(res => {
            if (res.data.code === 200) {
              this.list.unshift(this.userForm)
              this.dialogFormVisible = false
              this.$notify({
                title: '成功',
                message: '创建成功',
                type: 'success',
                duration: 2000
              })
            } else
                this.$message.error(res.data.message);
          })
        }
      })
    },
    // 修改按钮事件
    handleUpdate(row) {
      this.userForm = Object.assign({}, row) // copy obj
      this.dialogStatus = 'update'
      this.dialogFormVisible = true
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
    },
    // Dialog更新用户
    updateData() {
      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
          const tempData = Object.assign({}, this.userForm)
          updateUser(tempData).then(res => {
            // 页面更新
            for (const v of this.list) {
              if (v.uid === this.userForm.uid) {
                const index = this.list.indexOf(v)
                this.list.splice(index, 1, this.userForm)
                break
              }
            }
            this.dialogFormVisible = false
            this.$notify({
              title: '成功',
              message: '更新成功',
              type: 'success',
              duration: 2000
            })
          })
        }
      })
    },
    // 删除按钮事件
    handleDelete(row) {
      this.$confirm('此操作将删除该用户, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        deleteUser(row.uid).then(res => {
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
            this.$message.error(res.data.message);
        })
      }).catch(() => {});
    },
    // 格式化Json
    formatJson(filterVal, jsonData) {
      return jsonData.map(v => filterVal.map(j => {
        if (j === 'timestamp') {
          return parseTime(v[j])
        } else {
          return v[j]
        }
      }))
    },
    // 重置密码
    handleResetPwd(row) {
      this.$confirm('此操作将重置该用户登录密码, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        resetPwd(row.uid).then(res => {
          if (res.data.code === 200)
            this.$message.success('该用户密码重置成功')
          else
            this.$message.error('重置失败，请联系管理员')
        })
      }).catch(() => {})
    }
  }
}
</script>

<style scoped>
  .operation-column {
    text-align: left;
    margin-left: 10%;
  }

</style>
