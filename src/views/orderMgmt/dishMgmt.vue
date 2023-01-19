<template>
  <div class="app-container">
    <div class="filter-container">
      <el-input
        placeholder="菜品名"
        v-model="listQuery.menuName"
        clearable style="width: 200px;"
        class="filter-item"
        @keyup.enter.native="handleFilter"/>
      <el-select v-model="listQuery.menuType"
                 placeholder="菜品"
                 clearable style="width: 110px"
                 class="filter-item">
        <el-option v-for="item in menuCategory"
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
      <el-button class="filter-item" type="primary" style="margin-right: 10px; float: right;" icon="el-icon-check" @click="handleServeFoods()">上菜</el-button>
    </div>

    <!--Table-->
    <el-table
      ref="foodList"
      v-loading="listLoading"
      :key="tableKey"
      :data="list"
      border
      fit
      highlight-current-row
      style="width: 100%;"
      :header-cell-style="{background: '#F5F5F5'}"
      @selection-change="handleSelectionChange">
      <el-table-column align="center" type="selection" width="55">
      </el-table-column>
      <el-table-column label="桌号" align="center" width="200px">
        <template slot-scope="scope">
          <span>{{ scope.row.tableName }}</span>
        </template>
      </el-table-column>
      <el-table-column label="菜品" width="200px" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.foodName }}</span>
        </template>
      </el-table-column>
      <el-table-column label="种类" align="center" width="100px">
        <template slot-scope="scope">
          <el-tag>{{ scope.row.foodType | foodTypeFilter }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="数量" align="center" width="60px">
        <template slot-scope="scope">
          <span>x{{ scope.row.foodAmount }}</span>
        </template>
      </el-table-column>
      <el-table-column label="状态" align="center" width="140px">
        <template slot-scope="scope">
          <el-tag type="danger">{{ scope.row.foodStatus | foodStatusFilter }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="订单号" align="center" width="140px" :show-overflow-tooltip="true">
        <template slot-scope="scope">
          <span>{{ scope.row.orderId }}</span>
        </template>
      </el-table-column>
      <el-table-column label="下单时间" align="center" width="200px">
        <template slot-scope="scope">
          <span>{{ scope.row.orderDate }}</span>
        </template>
      </el-table-column>
      <el-table-column label="消息" align="center" width="180px">
        <template slot-scope="scope">
          <MsgReminder :rowData="scope.row"></MsgReminder>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" min-width="100px" class-name="small-padding fixed-width">
        <template slot-scope="scope">
          <el-button type="primary" size="mini" @click="serveFoods(scope.row)">上菜</el-button>
        </template>
      </el-table-column>
    </el-table>
    <!--\Table-->

    <!--分页插件-->
    <pagination v-show="total>0" :total="total" :page.sync="listQuery.currentPage" :limit.sync="listQuery.pageSize" @pagination="getList" />

    <!--菜品列表Dialog-->
    <el-dialog title="菜品列表" :visible.sync="dialogFormVisible" width="35%">
      <el-table
        :data="foodsSelection"
        border
        fit
        highlight-current-row
        style="width: 100%;"
        :header-cell-style="{background: '#F5F5F5'}">
        <el-table-column label="序号" align="center" width="50px">
          <template slot-scope="scope">
            <span>{{ scope.$index+1 }}</span>
          </template>
        </el-table-column>
        <el-table-column label="包间/桌位" align="center">
          <template slot-scope="scope">
            <span>{{ scope.row.tableName }}</span>
          </template>
        </el-table-column>
        <el-table-column label="种类" align="center" width="100px">
          <template slot-scope="scope">
            <el-tag>{{ scope.row.foodType | foodTypeFilter }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="菜品" align="center">
          <template slot-scope="scope">
            <span>{{ scope.row.foodName }}</span>
          </template>
        </el-table-column>
        <el-table-column label="数量" align="center" width="70px">
          <template slot-scope="scope">
            <span>x{{ scope.row.foodAmount }}</span>
          </template>
        </el-table-column>
      </el-table>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false">{{ $t('table.cancel') }}</el-button>
        <el-button type="primary" @click="serveFoods()">{{ $t('table.confirm') }}</el-button>
      </div>
    </el-dialog>
    <!--\Dialog-->

  </div>
</template>

<script>
  import { getNewFoodList, serveFoods } from '@/api/food'
  import MsgReminder from './component/msgReminder'
  import waves from '@/directive/waves' // Waves directive
  import Pagination from '@/components/Pagination' // Secondary package based on el-pagination

  // 定义类别列表
  const menuCategory = [{
    value: 'staple',
    label: '主食'
  },{
    value: 'snack',
    label: '小吃'
  },{
    value: 'drink',
    label: '饮品'
  }]

  const foodStatusMap = {
    0: '未上菜',
    1: '已上菜'
  }

  // arr to obj ,such as { 'admin' : "管理员", 'waiter' : "服务员" }
  const menuTypeKeyValue = menuCategory.reduce((acc, cur) => {
    acc[cur.value] = cur.label
    return acc
  }, {})

  export default {
    name: 'DishMgmt',
    components: { Pagination, MsgReminder },
    directives: { waves },
    filters: {
      // 菜品种类
      foodTypeFilter(menuCate) {
        if (menuCate === 'staple' || menuCate === 'snack' || menuCate === 'drink')
          return menuTypeKeyValue[menuCate]
        else
          return 'Other'
      },
      // 菜品种类
      foodStatusFilter(foodStatusVal) {
        if (foodStatusVal === 0 || foodStatusVal === 1)
          return foodStatusMap[foodStatusVal]
        else
          return 'Other'
      }
    },
    data() {
      return {
        tableKey: 0,
        // 新订单列表
        list: null,
        total: 0,
        listLoading: true,
        // 查询数据和分页数据
        listQuery: {
          currentPage: 1,
          pageSize: 10,
          menuType: undefined,
          menuName: undefined,
          startDate: undefined,
          endDate: undefined
        },
        menuCategory,
        // 默认Dialog表单不可见
        dialogFormVisible: false,
        dialogStatus: '',
        // 已选择的菜品
        foodsSelection: [],
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
        getNewFoodList(this.listQuery).then(res => {
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
      // dialog-上菜列表
      handleServeFoods() {
        if (this.foodsSelection.length === 0) {
          this.$message.warning('请选择菜品')
          return
        }
        this.dialogStatus = '上菜'
        this.dialogFormVisible = true
      },
      // 批量上菜
      serveFoods(row) {
        // 单个上菜
        if (row != null || row != undefined) {
          this.foodsSelection = []
          this.foodsSelection.push(row)
        }
        serveFoods(this.foodsSelection).then(res => {
          if (res.data.code === 200) {
            this.$notify({
              title: '成功',
              message: '上菜操作成功',
              type: 'success',
              duration: 2000
            })
            this.dialogFormVisible = false
            // 页面更新-删除已上菜的item
            for (let val of this.foodsSelection) {
              for (let item of this.list ) {
                if (item.mdId === val.mdId) {
                  let index = this.list.indexOf(val)
                  this.list.splice(index, 1)
                  this.total -= 1
                }
              }
            }
            // 如果列表为空，则重新加载List
            if (this.list.length === 0)
              this.getList()
            // 清空所选项
            this.foodsSelection = []
          }
          else
            this.$message.error(res.data.message);
        })
      },
      // 复选框选择事件
      handleSelectionChange(val) {
        this.foodsSelection = val;
      },
    }
  }
</script>
<style scoped>

</style>
