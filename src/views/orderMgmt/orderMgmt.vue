<template>
  <div class="app-container">
    <div class="filter-container">
      <el-select v-model="listQuery.orderStatus"
                 placeholder="订单状态"
                 clearable style="width: 110px"
                 class="filter-item">
        <el-option v-for="item in orderStatus"
                   :key="item.value"
                   :label="item.label"
                   :value="item.value"/>
      </el-select>
      <el-date-picker
          v-model="listQuery.startDate"
          value-format="yyyy-MM-dd"
          type="date"
          placeholder="开始日期"
          clearable style="width: 150px"
          class="filter-item"
          :picker-options="datePickerOptions">
      </el-date-picker>
      <span>-</span>
      <el-date-picker
          v-model="listQuery.endDate"
          value-format="yyyy-MM-dd"
          type="date"
          placeholder="结束日期"
          clearable style="width: 150px"
          class="filter-item"
          :picker-options="datePickerOptions">
      </el-date-picker>
      <el-button v-waves class="filter-item" type="primary" icon="el-icon-search" @click="handleFilter">查询</el-button>
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
      <el-table-column type="expand">
        <template slot-scope="scope">
        <!-- childTable -->
        <el-table
          class="inline-table"
          :data="scope.row.orderdetail"
          border
          style="width: 98%;">
            <el-table-column label="品种" align="center" width="160px">
              <template slot-scope="detail">
                <span>{{ detail.row.menu.menuType | menuCategoryFilter }}</span>
              </template>
            </el-table-column>
            <el-table-column label="菜品" align="center" width="400px">
              <template slot-scope="detail">
              <span>{{ detail.row.menu.menuName }}</span>
              </template>
            </el-table-column>
            <el-table-column label="单价(元)" align="center" width="200px">
              <template slot-scope="detail">
                <span>{{ detail.row.menu.menuPrice.toFixed(2) }}</span>
              </template>
            </el-table-column>
          <el-table-column label="数量" align="center" width="160px">
            <template slot-scope="detail">
              <span>{{ detail.row.odAmount }}</span>
            </template>
          </el-table-column>
          <el-table-column label="总价(元)" align="center" width="200px">
            <template slot-scope="detail">
              <span>{{ detail.row.odPrice.toFixed(2) }}</span>
            </template>
          </el-table-column>
          <el-table-column label="状态" align="center">
            <template slot-scope="detail">
              <el-tag :type="detail.row.odStatus === 1 ? 'success' : 'danger'">{{ detail.row.odStatus | menuStatusFilter }}</el-tag>
            </template>
          </el-table-column>
        </el-table>
        <!-- /childTable -->
        </template>
      </el-table-column>
      <el-table-column label="序号" prop="id" align="center" width="65px">
        <template slot-scope="scope">
          <span>{{ scope.$index+1 }}</span>
        </template>
      </el-table-column>
      <el-table-column label="订单号" width="260px" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.orderId }}</span>
        </template>
      </el-table-column>
      <el-table-column label="菜品种类" width="300px" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.orderdetail.length }}</span>
        </template>
      </el-table-column>
      <el-table-column label="状态" width="120px" align="center">
        <template slot-scope="scope">
          <el-tag>{{ scope.row.orderStatus | orderStatusFilter }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="总价(元)" align="center" width="200px">
        <template slot-scope="scope">
          <span>{{ scope.row.orderPrice.toFixed(2) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="下单时间" align="center" min-width="170px">
        <template slot-scope="scope">
          <span>{{ scope.row.orderDate }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" width="300px" class-name="small-padding fixed-width">
        <template slot-scope="scope">
            <el-button type="primary" size="mini" @click="handleUpdate(scope.row)">详情</el-button>
        </template>
      </el-table-column>
    </el-table>
    <!--\Table-->

    <!--分页插件-->
    <pagination v-show="total>0" :total="total" :page.sync="listQuery.currentPage" :limit.sync="listQuery.pageSize" @pagination="getList" />

    <!--Dialog-->
    <el-dialog :title="textMap[dialogStatus]" :visible.sync="dialogFormVisible" width="35%">
      <el-form ref="dataForm" :rules="rules" :model="userForm" label-position="left" label-width="70px" style="width: 400px; margin-left:50px;">
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
import { getOrderList } from '@/api/order'
import waves from '@/directive/waves' // Waves directive
import { parseTime } from '@/utils'
import Pagination from '@/components/Pagination'

// 定义订单状态-List
const orderStatus = [{
  value: '未上菜',
  label: '新下单'
  },{
  value: '已上菜',
  label: '已上菜'
  },{
  value: '已付款',
  label: '已付款'
  }]

// 定义菜品状态-Object
const menuStatus = {
  0: '未上菜',
  1: '已上菜'
}

// 定义菜品种类-Object
const menuCategory = {
  'staple': '主食',
  'drink': '饮品',
  'snack': '小吃'
}

// arr to obj ,such as { 0 : "管理员", 1 : "服务员" }
const orderStatusKeyValue = orderStatus.reduce((acc, cur) => {
  acc[cur.value] = cur.label
  return acc
}, {})

export default {
  name: 'OrderMgmt',
  components: { Pagination },
  directives: { waves },
  filters: {
    // 订单状态过滤器
    orderStatusFilter(Val) {
      return orderStatusKeyValue[Val]
    },
    // 菜品状态过滤器
    menuStatusFilter(Val) {
      return menuStatus[Val]
    },
    // 菜品状态过滤器
    menuCategoryFilter(Val) {
      return menuCategory[Val]
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
        orderStatus: undefined,
        startDate: undefined,
        endDate: undefined
      },
      // 订单状态
      orderStatus,
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
      downloadLoading: false,
      datePickerOptions: {
        disabledDate(time) {
          // 禁止选择未来日期（可以选择今天）
          return time.getTime() > Date.now();
        }
      }
    }
  },
  created() {
    this.getList()
  },
  methods: {
    // 获取数据
    getList() {
      this.listLoading = true
      getOrderList(this.listQuery).then(response => {
        this.list = response.data.data.records
        this.total = response.data.data.total
        // Just to simulate the time of the request
        setTimeout(() => {
          this.listLoading = false
        }, 1 * 1000)
        console.info(this.list)
      })
    },
    // 过滤
    handleFilter() {
      this.listQuery.currentPage = 1
      this.getList()
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
</style>
