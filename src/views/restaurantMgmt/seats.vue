<template>
  <div class="app-container">
    <div class="filter-container">
      <el-input
        placeholder="包间/桌号"
        v-model="listQuery.tableName"
        clearable style="width: 200px;"
        class="filter-item"
        @keyup.enter.native="handleFilter"/>

      <el-select v-model="listQuery.tableUse"
                 placeholder="状态"
                 clearable style="width: 90px"
                 class="filter-item">
        <el-option v-for="item in tableCategory"
                   :key="item.value"
                   :label="item.label"
                   :value="item.value"/>
      </el-select>
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
      <el-table-column label="包间/桌号" width="240px" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.tableName }}</span>
        </template>
      </el-table-column>
      <el-table-column label="状态" align="center" width="140px">
        <template slot-scope="scope">
          <el-tag>{{ scope.row.tableUse | typeFilter }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="描述" min-width="300px" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.tableDescription }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" min-width="200px" class-name="small-padding fixed-width">
        <template slot-scope="scope">
          <el-button type="primary" size="mini" @click="handleUpdate(scope.row)">编辑</el-button>
          <el-button type="danger" size="mini"  @click="handleDelete(scope.row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>
    <!--\Table-->

    <!--分页插件-->
    <pagination v-show="total>0" :total="total" :page.sync="listQuery.currentPage" :limit.sync="listQuery.pageSize" @pagination="getList" />

    <!--Dialog-->
    <el-dialog :title="textMap[dialogStatus]" :visible.sync="dialogFormVisible" width="35%">
      <el-form ref="dataForm" :rules="rules" :model="seatForm" label-position="left" label-width="90px" style="width: 400px; margin-left:50px;">
        <el-form-item label="包间/桌号" prop="tableName">
          <el-input v-model="seatForm.tableName"/>
        </el-form-item>
        <el-form-item label="描述" prop="description">
          <el-input
            type="textarea"
            placeholder="请输入内容"
            v-model="seatForm.tableDescription"
            maxlength="50"
            :rows="5"
            show-word-limit
          >
          </el-input>
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
  import { getTableList, addSeat, updateSeat, deleteSeat } from '@/api/seat'
  import waves from '@/directive/waves' // Waves directive
  import { parseTime } from '@/utils'
  import Pagination from '@/components/Pagination' // Secondary package based on el-pagination

  // 定义类别列表
  const tableCategory = [{
    value: 0,
    label: '空闲'
  },{
    value: 1,
    label: '使用'
  }]

  // arr to obj ,such as { 'admin' : "管理员", 'waiter' : "服务员" }
  const tableTypeKeyValue = tableCategory.reduce((acc, cur) => {
    acc[cur.value] = cur.label
    return acc
  }, {})

  export default {
    name: 'SeatsMgmt',
    components: { Pagination },
    directives: { waves },
    filters: {
      // 桌号显示名字
      typeFilter(attType) {
        if (attType == 0 || attType == 1)
          return tableTypeKeyValue[attType]
        else
          return 'Other'
      }
    },
    data() {
      // 图片上传校验规则
      const descriptionValidate = (rule, value, callback) => {
        if (this.seatForm.tableDescription == null)
          callback('description is required')
        else
          callback()
      }

      return {
        tableKey: 0,
        list: null,
        total: 0,
        listLoading: true,
        tableCategory,
        // 查询数据和分页数据
        listQuery: {
          currentPage: 1,
          pageSize: 10,
          tableId: undefined,
          tableName: undefined,
          tableUse: undefined
        },
        showReviewer: false,
        // Dialog中数据
        seatForm: {
          tableId: undefined,
          tableName: undefined,
          tableUse: undefined,
          tableDescription: undefined
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
          tableName: [{ required: true, message: '请输入包间或桌号', trigger: 'blur' }],
          description: [{ required: true, message: '请输入描述', trigger: 'blur', validator: descriptionValidate }]
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
        getTableList(this.listQuery).then(res => {
          this.list = res.data.data.records
          this.total = res.data.data.total
          // Just to simulate the time of the request
          setTimeout(() => {
            this.listLoading = false
          }, 1 * 1000)
        })
      },
      // 查询
      handleFilter() {
        this.listQuery.currentPage = 1
        this.getList()
      },
      // 重置表单
      resetForm() {
        this.seatForm = {
          tableId: undefined,
          tableName: undefined,
          tableUse: undefined,
          tableDescription: undefined
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
            addSeat(this.seatForm).then(res => {
              if (res.data.code === 200) {
                this.list.unshift(res.data.data)
                this.dialogFormVisible = false
                this.$notify({
                  title: '成功',
                  message: '创建成功',
                  type: 'success',
                  duration: 2000
                })
                this.total += 1 //记录条数+1
              } else
                this.$message.error(res.data.message);
            })
          }
        })
      },
      // 修改按钮事件
      handleUpdate(row) {
        this.seatForm = Object.assign({}, row) // copy obj
        this.dialogStatus = 'update'
        this.dialogFormVisible = true
        this.$nextTick(() => {
          this.$refs['dataForm'].clearValidate()
        })
      },
      // Dialog更新事件
      updateData() {
        this.$refs['dataForm'].validate((valid) => {
          if (valid) {
            const tempData = Object.assign({}, this.seatForm)
            updateSeat(tempData).then(res => {
              if (res.data.code === 200) {
                for (const v of this.list) {
                  if (v.tableId === this.seatForm.tableId) {
                    const index = this.list.indexOf(v)
                    this.list.splice(index, 1, tempData)
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
              } else
                this.$message.error(res.data.message)
            })
          }
        })
      },
      // 删除按钮事件
      handleDelete(row) {
        this.$confirm('此操作将删除该包间/桌位, 是否继续?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          deleteSeat(row.tableId).then(res => {
            if (res.data.code === 200) {
              this.$notify({
                title: '成功',
                message: '删除成功',
                type: 'success',
                duration: 2000
              })
              const index = this.list.indexOf(row)
              this.list.splice(index, 1)
              this.total -= 1 //记录条数-1
            } else
              this.$message.error(res.data.message)
          })
        }).catch(() => {})
      }
    }
  }
</script>
