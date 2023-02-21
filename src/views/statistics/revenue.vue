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
    </div>

    <!--Line Chat-->
    <el-row style="background:#fff;padding:16px 16px 0;margin-bottom:32px;">
      <line-chart :chartData="lineChartData" v-if="chartDataReady"/>
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
      <el-table-column label="总价（元）" prop="orderTotalPrice" align="center" min-width="300px">
        <template slot-scope="scope">
          <span>{{ scope.row.orderTotalPrice.toFixed(2) }}</span>
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
  import { getRevenueOrderList, getRevenueChart } from '@/api/statistics'

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
        expands: [],
        chartDataReady: false
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
        getRevenueOrderList(this.listQuery).then(res => {
          this.list = res.data.data.records
          this.total = res.data.data.total
          setTimeout(() => {
            this.listLoading = false
          }, 1 * 1000)
        })
      },
      // 获取图表数据
      getChartData() {
        getRevenueChart(this.listQuery).then(res => {
          this.lineChartData = res.data.data
          this.chartDataReady = true
        })
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
          'orderList', 'orderTotalPrice'
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

