<template>
  <div class="dashboard-editor-container">
    <!--基础数据看板-->
    <panel-group :chart-data="groupChartData"/>
    <!--折线图-->
    <el-row style="background:#fff;padding:16px 16px 0;margin-bottom:32px;">
      <line-chart :chart-data="lineChartData" v-if="chartDataReady"/>
    </el-row>

  </div>
</template>

<script>
import PanelGroup from './components/PanelGroup'
import LineChart from '@/components/Charts/LineChart'
import { getRevenueChart, getRevenuePanelGroup } from '@/api/statistics'
import moment from 'moment'

export default {
  name: 'DashboardAdmin',
  components: {
    PanelGroup,
    LineChart
  },
  data() {
    return {
      lineChartData: undefined,
      groupChartData: {
        consumers: 5,
        orders: 17,
        urgencies: 4,
        turnover: 300
      },
      chartDataReady: false,
      dateQuery: {
        // 默认展示近15天数据
        startDate: this.getDateByDay(15),
        endDate: this.getDateByDay(0)
      },
      panelGroupQuery: {
        // 默认展示当天
        startDate: this.getDateByDay(0),
        endDate: this.getDateByDay(0)
      }
    }
  },
  created() {
    this.getChartData()
    this.getPanelGroupData()
  },
  methods: {
    // 获取图表数据
    getChartData() {
      getRevenueChart(this.dateQuery).then(res => {
        this.lineChartData = res.data.data
        this.chartDataReady = true
      })
    },
    // 获取panelGroup数据
    getPanelGroupData() {
      getRevenuePanelGroup(this.panelGroupQuery).then(res => {
        this.groupChartData = res.data.data
      })
    },
    // 获取与当前时间相隔Day天数的日期
    // Day为0，则获取当前日期
    // Day为3，则获取3天前的日期
    getDateByDay(Day) {
      // 使用moment.js
      return moment(new Date().getTime() - Day * 1000 * 24 * 60 * 60).format('YYYY-MM-DD')
    }
  }
}
</script>

<style rel="stylesheet/scss" lang="scss" scoped>
.dashboard-editor-container {
  padding: 32px;
  background-color: rgb(240, 242, 245);
  .chart-wrapper {
    background: #fff;
    padding: 16px 16px 0;
    margin-bottom: 32px;
  }
}
</style>
