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
      ref="orderTable"
      border
      fit
      show-summary
      :summary-method="getSummaries"
      highlight-current-row
      style="width: 100%;"
      :header-cell-style="{background: '#F5F5F5'}"
      :row-key="row => row.orderId"
      :expand-row-keys="expands"
      @row-click="handleClickRow">
      <el-table-column type="expand" width="50px">
        <template slot-scope="scope">
        <!-- childTable -->
        <el-table
          class="inline-table"
          :data="scope.row.orderdetail"
          :key="childTableKey"
          border
          style="width: 98%;"
          :header-cell-style="{background: '#F5F5F5'}">
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
              <span>x{{ detail.row.odAmount }}</span>
            </template>
          </el-table-column>
          <el-table-column label="总价(元)" align="center" width="200px">
            <template slot-scope="detail">
              <span>{{ detail.row.odPrice.toFixed(2) }}</span>
            </template>
          </el-table-column>
          <el-table-column label="状态" align="center">
            <template slot-scope="detail">
              <el-tag :type="getMenuTagStatus(detail.row.odStatus)">{{ detail.row.odStatus | menuStatusFilter }}</el-tag>
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
      <el-table-column label="订单号" prop="orderId" width="260px" align="center" :show-overflow-tooltip="true">
        <template slot-scope="scope">
          <span>{{ scope.row.orderId }}</span>
        </template>
      </el-table-column>
      <el-table-column label="菜品种类数" prop="menuAmount" width="300px" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.orderdetail.length }}</span>
        </template>
      </el-table-column>
      <el-table-column label="状态" prop="orderStatus" width="120px" align="center">
        <template slot-scope="scope">
          <el-tag :type="getOrderTagStatus(scope.row.orderStatus)">{{ scope.row.orderStatus | orderStatusFilter }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="总价(元)" prop="orderPrice" align="center" width="200px">
        <template slot-scope="scope">
          <span>{{ scope.row.orderPrice.toFixed(2) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="下单时间" prop="orderDate" align="center" min-width="170px">
        <template slot-scope="scope">
          <span>{{ scope.row.orderDate }}</span>
        </template>
      </el-table-column>
      <el-table-column label="消息" align="center" width="180px" property="msgComponent">
        <template slot-scope="scope">
          <MsgReminder :rowData="scope.row"></MsgReminder>
        </template>
      </el-table-column>
    </el-table>
    <!--\Table-->

    <!--分页插件-->
    <pagination v-show="total>0" :total="total" :page.sync="listQuery.currentPage" :limit.sync="listQuery.pageSize" @pagination="getList" />

  </div>
</template>

<script>
import { getOrderList } from '@/api/order'
import waves from '@/directive/waves' // Waves directive
import Pagination from '@/components/Pagination'
import MsgReminder from './component/msgReminder'

// 定义订单状态-List
const orderStatus = [{
  value: '未上菜',
  label: '新下单'
  },{
  value: '上菜中',
  label: '上菜中'
  },{
  value: '已上菜',
  label: '已上菜'
  },{
  value: '已付款',
  label: '已付款'
  }]

// 定义订单Tag显示状态
const orderTagStatus = {
  '未上菜': 'danger',
  '上菜中': 'warning',
  '已上菜': 'success',
  '已付款': ''
}

// 定义菜品状态-Object
const menuStatus = {
  0: '未上菜',
  1: '已上菜'
}

// 定义菜品Tag显示状态
const menuTagStatus = {
  0: 'danger',
  1: 'success'
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
  components: { Pagination, MsgReminder },
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
      childTableKey: 1,
      // 使用:row-key时，list不能为null
      list: [],
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
      downloadLoading: false,
      datePickerOptions: {
        disabledDate(time) {
          // 禁止选择未来日期（可以选择今天）
          return time.getTime() > Date.now();
        }
      },
      expands: []
    }
  },
  created() {
    this.getList()
  },
/*  /!**
   * 使用生命周期钩子updated
   * 用于解决数据表设定固定列样式后，首次加载可能格式错误
   * doLayout()重绘表格
   *!/
  updated() {
    this.$nextTick(() => {
      this.$refs.orderTable.doLayout()
    })
  },*/
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
      })
    },
    // 过滤
    handleFilter() {
      this.listQuery.currentPage = 1
      this.getList()
    },
    getMenuTagStatus(val) {
      return menuTagStatus[val]
    },
    getOrderTagStatus(val) {
      return orderTagStatus[val]
    },
    /**
     * 合计计算函数（仅当前页数据）
     * 不知为何该函数被调用3次，仅最后一次param参数正确，故增加判断
     * @param param
     * @returns sums[]
     */
    getSummaries(param){
      // 参数异常返回[]
      if (param.columns.length === 0 || param.data === null) return []
      const { columns, data } = param;
      const sums = []
      // 指定参与计算的列。prop需与列的属性名一致
      const defineColumns = [
        'orderPrice'
      ]
      columns.forEach((column, index) => {
        if (index === 0) {
          sums[index] = '合计'
          return
      }
        // 非指定列返回空字符
        if (defineColumns.indexOf(column.property) < 0) {
          sums[index] = ''
          return
        }
      const values = data.map(item => Number(item[column.property]));
      // 计算累计总和
      sums[index] = values.reduce((prev, curr) => {
        const value = Number(curr);
        if (!isNaN(value)) {
          return Number(prev) + Number(curr);
        } else {
          return Number(prev);
        }
      }, 0);
      sums[index] = sums[index].toFixed(2) + ' 元';
      })
      return sums
    },
    // 点击展开全行
    handleClickRow(row, column, event) {
      // 消息列不做点击事件
      // 说明：el-popover阻止事件冒泡后会有其他问题，暂无法解决
      if (column.property === 'msgComponent')
        return
      if (this.expands.includes(row.orderId)) {
        this.expands = this.expands.filter(val => val !== row.orderId);
      } else {
        this.expands.push(row.orderId);
      }
    }
  }
}
</script>

<style scoped>
/*  .el-table {
    overflow: visible !important;
  }*/
</style>
