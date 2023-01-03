<template>
  <div class="app-container">
    <div class="filter-container">
      <el-input
        placeholder="菜品"
        v-model="listQuery.menuName"
        style="width: 200px;"
        class="filter-item"
        @keyup.enter.native="handleFilter"/>

      <el-select v-model="listQuery.menuType"
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
      style="width: 100%;">
      <el-table-column label="序号" prop="id" sortable="custom" align="center" width="65">
        <template slot-scope="scope">
          <span>{{ scope.$index+1 }}</span>
        </template>
      </el-table-column>
      <el-table-column label="图片" width="350px" align="center">
        <template slot-scope="scope">
          <el-image
            style="width: 200px; height: 160px"
            :src="baseUrl + '/' + scope.row.menuImgBasicPath + '/' + scope.row.menuImg"
            :preview-src-list="[baseUrl + '/' + scope.row.menuImgBasicPath + '/' + scope.row.menuImg]"
          />
        </template>
      </el-table-column>
      <el-table-column label="菜品" width="340px" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.menuName }}</span>
        </template>
      </el-table-column>
      <el-table-column label="种类" align="center" width="140px">
        <template slot-scope="scope">
          <el-tag>{{ scope.row.menuType | typeFilter }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="价格（元）" width="200px" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.menuPrice.toFixed(2) }}</span>
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
    <el-dialog :title="textMap[dialogStatus]" :visible.sync="dialogFormVisible">
      <el-form ref="dataForm" :rules="rules" :model="menuForm" label-position="left" label-width="95px" style="width: 400px; margin-left:50px;">
        <el-form-item label="种类" prop="category">
          <el-select v-model="menuForm.menuType" class="filter-item" placeholder="Please select">
            <template v-for="item in menuCategory">
              <el-option :key="item.value" :label="item.label" :value="item.value" v-if="item.value!='all'"/>
            </template>
          </el-select>
        </el-form-item>
        <el-form-item label="菜品" prop="menuName">
          <el-input v-model="menuForm.menuName"/>
        </el-form-item>
        <el-form-item label="价格（元）" prop="menuPrice">
          <el-input v-model="menuForm.menuPrice"/>
        </el-form-item>
        <el-form-item label="图片" prop="menuImage">
          <UploadImages
            ref="uploadImage"
            :menuImage="menuForm.menuImage"
            :key="new Date().getTime()"
            @getImageList="getImageList">
          </UploadImages>
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
  import { getMenuList , updateMenu, addMenu, deleteMenu } from '@/api/menu'
  import waves from '@/directive/waves' // Waves directive
  import { parseTime } from '@/utils'
  import Pagination from '@/components/Pagination' // Secondary package based on el-pagination
  import UploadImages from "./component/uploadImages";

  // 定义角色对应列表
  const menuCategory = [{
    value: 'all',
    label: '全部',
  },{
    value: 'staple',
    label: '主食'
  },{
    value: 'snack',
    label: '小吃'
  },{
    value: 'drink',
    label: '饮品'
  }]

  // arr to obj ,such as { 'admin' : "管理员", 'waiter' : "服务员" }
  const menuTypeKeyValue = menuCategory.reduce((acc, cur) => {
    acc[cur.value] = cur.label
    return acc
  }, {})

  export default {
    name: 'MenusMgmt',
    components: { Pagination, UploadImages },
    directives: { waves },
    filters: {
      // 根据id显示种类名字
      typeFilter(menuCate) {
        if (menuCate === 'staple' || menuCate === 'snack' || menuCate === 'drink')
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
        baseUrl: process.env.BASE_API, // 默认URl前缀
        // 查询数据和分页数据
        listQuery: {
          currentPage: 1,
          pageSize: 10,
          menuName: undefined,
          menuType: 'all'
        },
        menuCategory,
        // Dialog中数据
        menuForm: {
          foodId: undefined,
          menuType: 'staple',
          menuName: undefined,
          menuPrice: undefined,
          menuImage: []
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
          menuName: [{ required: true, message: '请输入菜品名', trigger: 'blur' }],
          menuPrice: [{ required: true, message: '请输入价格', trigger: 'blur' }],
          //menuImage: [{ required: true, message: '请上传菜品图片', trigger: 'blur' }],
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
        getMenuList(this.listQuery).then(res => {
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
          foodId: undefined,
          menuType: 'staple',
          menuName: undefined,
          menuPrice: undefined,
          menuImage: []
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
      // Dialog-添加
      createData() {
        this.$refs['dataForm'].validate((valid) => {
          if (valid) {
            //调用API
            this.$refs.uploadImage.handleImageList() // 子组件往父组件传值
            addMenu(this.menuForm).then(res => {
              if (res.data.code === 200) {
                this.menuForm = res.data.data // 后端上传的数据赋值给表单
                this.list.unshift(this.menuForm)
                this.dialogFormVisible = false
                this.$notify({
                  title: '成功',
                  message: '创建成功',
                  type: 'success',
                  duration: 2000
                })
                this.resetForm() //重置表单内容
              } else
                this.$message.error(res.data.message)
            })
          }
        })
      },
      // 修改按钮事件
      handleUpdate(row) {
        this.menuForm = Object.assign({}, row)
        // 设置图片回显
        this.menuForm.menuImage = [{'url': this.baseUrl +
            '/' + row.menuImgBasicPath +
            '/' + row.menuImg}]
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
                  this.list.splice(index, 1, this.menuForm)
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
        this.$confirm('此操作将删除该菜品, 是否继续?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          deleteMenu(row.foodId).then(res => {
            if (res.data.code === 200) {
              this.$notify({
                title: '成功',
                message: '删除成功',
                type: 'success',
                duration: 2000
              })
              const index = this.list.indexOf(row)
              this.list.splice(index, 1)
            }
          })
        }).catch(() => {})
      },
      // 表单内容转Jason
      formatJson(filterVal, jsonData) {
        return jsonData.map(v => filterVal.map(j => {
          if (j === 'timestamp') {
            return parseTime(v[j])
          } else {
            return v[j]
          }
        }))
      },
      // 子组件调用向父组件menuImage赋值
      getImageList(data){
        this.menuForm.menuImage = data
      }
    }
  }
</script>