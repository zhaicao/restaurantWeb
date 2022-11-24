<template>
  <div class="app-container">
    <div class="filter-container">
      <el-input
        placeholder="菜品"
        v-model="listQuery.title"
        style="width: 200px;"
        class="filter-item"
        @keyup.enter.native="handleFilter"/>

      <el-select v-model="listQuery.roles"
                 placeholder="种类"
                 clearable style="width: 90px"
                 class="filter-item">
        <el-option v-for="item in menuCategory"
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
      style="width: 100%;"
      @sort-change="sortChange">
      <el-table-column label="序号" prop="id" sortable="custom" align="center" width="65">
        <template slot-scope="scope">
          <span>{{ scope.row.id }}</span>
        </template>
      </el-table-column>
      <el-table-column label="图片" width="350px" align="center">
        <template slot-scope="scope">
          <el-image
            style="width: 200px; height: 160px"
            :src="require('@/assets/images/profile.gif')"
            :preview-src-list="require('@/assets/images/profile.gif')">
          </el-image>
        </template>
      </el-table-column>
      <el-table-column label="菜品" width="340px" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.realName }}</span>
        </template>
      </el-table-column>
      <el-table-column label="种类" align="center" width="140px">
        <template slot-scope="scope">
          <el-tag>{{ scope.row.role | typeFilter }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="价格（元）" width="200px" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.forecast }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" min-width="200px" class-name="small-padding fixed-width">
        <template slot-scope="scope">
          <el-button type="primary" size="mini" @click="handleUpdate(scope.row)">编辑</el-button>
          <el-button type="danger" size="mini"  @click="handleModifyStatus(scope.row,'deleted')">删除</el-button>
        </template>
      </el-table-column>
    </el-table>
    <!--\Table-->

    <!--分页插件-->
    <pagination v-show="total>0" :total="total" :page.sync="listQuery.page" :limit.sync="listQuery.limit" @pagination="getList" />

    <!--Dialog-->
    <el-dialog :title="textMap[dialogStatus]" :visible.sync="dialogFormVisible">
      <el-form ref="dataForm" :rules="rules" :model="menuForm" label-position="left" label-width="70px" style="width: 400px; margin-left:50px;">
        <el-form-item label="种类" prop="category">
          <el-select v-model="menuForm.category" class="filter-item" placeholder="Please select">
            <el-option v-for="item in menuCategory" :key="item.value" :label="item.label" :value="item.value"/>
          </el-select>
        </el-form-item>
        <el-form-item label="菜品" prop="dish">
          <el-input v-model="menuForm.dish"/>
        </el-form-item>
        <el-form-item label="价格" prop="price">
          <el-input v-model="menuForm.price"/>
        </el-form-item>
        <el-form-item label="图片" prop="image">
          <UploadImages/>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false">{{ $t('table.cancel') }}</el-button>
        <el-button type="primary" @click="dialogStatus==='create'?createData():updateData()">{{ $t('table.confirm') }}</el-button>
      </div>
    </el-dialog>
    <!--\Dialog-->
    <el-dialog :visible.sync="dialogPvVisible" title="Reading statistics">
      <el-table :data="pvData" border fit highlight-current-row style="width: 100%">
        <el-table-column prop="key" label="Channel"/>
        <el-table-column prop="pv" label="Pv"/>
      </el-table>
      <span slot="footer" class="dialog-footer">
        <el-button type="primary" @click="dialogPvVisible = false">{{ $t('table.confirm') }}</el-button>
      </span>
    </el-dialog>

  </div>
</template>

<script>
  import { fetchList, fetchPv, createArticle, updateArticle } from '@/api/article'
  import waves from '@/directive/waves' // Waves directive
  import { parseTime } from '@/utils'
  import Pagination from '@/components/Pagination' // Secondary package based on el-pagination
  import UploadImages from "./component/uploadImages";

  // 定义角色对应列表
  const menuCategory = [{
    value: 1,
    label: '主食'
  },{
    value: 2,
    label: '小吃'
  },{
    value: 3,
    label: '饮品'
  }]

  // arr to obj ,such as { 0 : "管理员", 1 : "服务员" }
  const menuTypeKeyValue = menuCategory.reduce((acc, cur) => {
    acc[cur.value] = cur.label
    return acc
  }, {})

  export default {
    name: 'MenusMgmt',
    components: { Pagination, UploadImages },
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
      typeFilter(menuCate) {
        if (menuCate == 1 || menuCate == 2 || menuCate == 3)
          return menuTypeKeyValue[menuCate]
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
        menuCategory,
        sortOptions: [{ label: 'ID Ascending', key: '+id' }, { label: 'ID Descending', key: '-id' }],
        statusOptions: ['published', 'draft', 'deleted'],
        showReviewer: false,
        // Dialog中数据
        menuForm: {
          id: undefined,
          category: 1,
          dish: '',
          price: '',
          image: ''
        },
        // 默认Dialog表单不可见
        dialogFormVisible: false,
        dialogStatus: '',
        // Dialog的Title
        textMap: {
          update: '编辑',
          create: '添加'
        },
        dialogPvVisible: false,
        pvData: [],
        // 表单rules
        rules: {
          dish: [{ required: true, message: '请输入菜品名', trigger: 'blur' }],
          price: [{ required: true, message: '请输入价格', trigger: 'blur' }],
          image: [{ required: true, message: '请上传菜品图片', trigger: 'blur' }],
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
        this.menuForm = {
          id: undefined,
          category: 1,
          dish: '',
          price: '',
          image: ''
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
            //调用API
            createArticle(this.menuForm).then(() => {
              this.list.unshift(this.menuForm)
              this.dialogFormVisible = false
              this.$notify({
                title: '成功',
                message: '创建成功',
                type: 'success',
                duration: 2000
              })
              console.info(this.list)
            })
          }
        })
      },
      // 修改按钮事件
      handleUpdate(row) {
        console.info(row)
        this.menuForm = Object.assign({}, row) // copy obj
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
            const tempData = Object.assign({}, this.menuForm)
            tempData.timestamp = +new Date(tempData.timestamp) // change Thu Nov 30 2017 16:41:05 GMT+0800 (CST) to 1512031311464
            updateArticle(tempData).then(() => {
              for (const v of this.list) {
                if (v.id === this.menuForm.id) {
                  const index = this.list.indexOf(v)
                  this.list.splice(userMgmt, 1, this.menuForm)
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
        this.$notify({
          title: '成功',
          message: '删除成功',
          type: 'success',
          duration: 2000
        })
        const index = this.list.indexOf(row)
        this.list.splice(userMgmt, 1)
      },
      /*    handleFetchPv(pv) {
            fetchPv(pv).then(response => {
              this.pvData = response.data.pvData
              this.dialogPvVisible = true
            })
          },*/
      // 表单内容转Jason
      formatJson(filterVal, jsonData) {
        return jsonData.map(v => filterVal.map(j => {
          if (j === 'timestamp') {
            return parseTime(v[j])
          } else {
            return v[j]
          }
        }))
      }
    }
  }
</script>
