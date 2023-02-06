<template>
  <div class="app-container">
    <div class="filter-container">
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
      <el-button v-waves class="filter-item" type="primary" icon="el-icon-search" @click="updateChartData">Test Update</el-button>
    </div>

    <!--Line Chat-->
    <el-row style="background:#fff;padding:16px 16px 0;margin-bottom:32px;">
      <line-chart :chartData="lineChartData"/>
    </el-row>

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
      :row-key="row => row.orderDate"
      :expand-row-keys="expands"
      @row-click="handleClickRow">
      <el-table-column type="expand" width="50px">
        <template slot-scope="scope">
          <!-- childTable -->
          <el-table
            class="inline-table"
            :data="scope.row.orderList"
            :key="childTableKey"
            border
            style="width: 98%;"
            :header-cell-style="{background: '#F5F5F5'}">
            <el-table-column label="序号" align="center" width="160px">
              <template slot-scope="orderList">
                <span>{{ orderList.$index+1 }}</span>
              </template>
            </el-table-column>
            <el-table-column label="订单号" align="center" width="400px">
              <template slot-scope="orderList">
                <span>{{ orderList.row.orderId }}</span>
              </template>
            </el-table-column>
            <el-table-column label="总价（元）" align="center" width="300px">
              <template slot-scope="orderList">
                <span>{{ orderList.row.orderPrice.toFixed(2) }}</span>
              </template>
            </el-table-column>
            <el-table-column label="下单时间" align="center" min-width="200px">
              <template slot-scope="orderList">
                <span>{{ orderList.row.orderDate }}</span>
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
      <el-table-column label="日期" prop="orderDate" width="400px" align="center" :show-overflow-tooltip="true">
        <template slot-scope="scope">
          <span>{{ scope.row.orderDate }}</span>
        </template>
      </el-table-column>
      <el-table-column label="订单数（笔）" prop="orderList" width="300px" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.orderList.length }}</span>
        </template>
      </el-table-column>
      <el-table-column label="总价（元）" prop="orderTotalAmount" align="center" min-width="300px">
        <template slot-scope="scope">
          <span>{{ scope.row.orderTotalAmount.toFixed(2) }}</span>
        </template>
      </el-table-column>
    </el-table>
    <!--\Table-->

    <!--分页插件-->
    <pagination v-show="total>0" :total="total" :page.sync="listQuery.currentPage" :limit.sync="listQuery.pageSize" @pagination="getList" />

  </div>
</template>

<script>
  import waves from '@/directive/waves' // Waves directive
  import Pagination from '@/components/Pagination'
  import LineChart from '@/components/Charts/LineChart'

  export default {
    name: 'Revenue',
    components: {
      Pagination,
      LineChart
    },
    directives: { waves },
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
        lineChartData: undefined,
        expands: []
      }
    },
    created() {
      this.getList()
      this.getChartData()
    },
    methods: {
      // 获取数据
      getList() {
        this.listLoading = true
        // 列表数据结构，后端返回
        this.list = [
          {
            orderDate: '2023-01-30',
            orderTotalAmount: 10000.00,
            orderList: [
            {orderId: 'e02aa47b966911ed856902004c4f4f51', orderPrice: 91.21, orderDate: '2023-01-30 16:28:09'},
            {orderId: '29', orderPrice: 58.0, orderDate: '2023-01-30 11:27:11'}
            ]
          },
          {
            orderDate: '2023-01-29',
            orderTotalAmount: 8200.00,
            orderList: [
              {orderId: '22', orderPrice: 254.00, orderDate: '2023-01-29 17:28:09'},
              {orderId: '21', orderPrice: 158.00, orderDate: '2023-01-29 15:27:11'},
              {orderId: '20', orderPrice: 1458.00, orderDate: '2023-01-29 11:21:11'}
            ]
          },
        ]
        this.total = 2
        setTimeout(() => {
          this.listLoading = false
        }, 1 * 1000)
      },
      getChartData() {
        this.lineChartData =
          // 图表的数据，后端数据结构
          {
            legendData: ['营业额（元）', '订单数（笔）'],
            categoryData: ['2023-01-24', '2023-01-25', '2023-01-26', '2023-01-27', '2023-01-28', '2023-01-29', '2023-01-30'],
            revenueData: [12000.00, 8200.00, 9100.00, 15400.00, 16200.50, 14000.00, 9721.00],
            orderData: [100, 120, 161, 134, 105, 160, 165]
        }
      },
      updateChartData() {
        this.lineChartData =
          // 图表的数据，后端数据结构
          {
            legendData: ['营业额（元）', '订单数（笔）'],
            categoryData: ['2023-01-22', '2023-01-23', '2023-01-24', '2023-01-25', '2023-01-26', '2023-01-27', '2023-01-28', '2023-01-29', '2023-01-30'],
            revenueData: [10000.00, 11000.00, 12000.00, 8200.00, 9100.00, 15400.00, 16200.50, 14000.00, 9721.00],
            orderData: [70, 80, 100, 120, 161, 134, 105, 160, 165]
          }
      },
      // 过滤
      handleFilter() {
        this.listQuery.currentPage = 1
        this.getList()
        this.getChartData()
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
          'orderList', 'orderTotalAmount'
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
          const values = data.map(item => {
            // 判断类型，若是list直接取length
            if (typeof item[column.property] == 'object')
              return Number(item[column.property].length)
            else
              return Number(item[column.property])
          });
          // 计算累计总和
          sums[index] = values.reduce((prev, curr) => {
            const value = Number(curr);
            if (!isNaN(value)) {
              return Number(prev) + Number(curr);
            } else {
              return Number(prev);
            }
          }, 0);
          if (column.property == defineColumns[1])
            sums[index] = sums[index].toFixed(2)
          else
            sums[index] = sums[index]
        })
        return sums
      },
      // 点击展开全行
      handleClickRow(row, column, event) {
        if (this.expands.includes(row.orderDate)) {
          this.expands = this.expands.filter(val => val != row.orderDate);
        } else {
          this.expands.push(row.orderDate);
        }
      }
    }
  }
</script>

<style scoped>

</style>

