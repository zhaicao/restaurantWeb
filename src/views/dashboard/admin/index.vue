<template>
  <div class="dashboard-editor-container">
    <!--基础数据看板-->
    <panel-group/>
    <!--折线图-->
    <el-row style="background:#fff;padding:16px 16px 0;margin-bottom:32px;">
      <line-chart :chart-data="lineChartData"/>
    </el-row>

  </div>
</template>

<script>
import PanelGroup from './components/PanelGroup'
import LineChart from '@/components/Charts/LineChart'

const lineChartData = {
  // 图表的数据，后端数据结构
  data: {
    legend: ['营业额（元）', '订单数（笔）'],
    category: ['2023-01-24', '2023-01-25', '2023-01-26', '2023-01-27', '2023-01-28', '2023-01-29', '2023-01-30'],
    revenue: [12000.00, 8200.00, 9100.00, 15400.00, 16200.50, 14000.00, 9721.00],
    orderQuantity: [100, 120, 161, 134, 105, 160, 165]
  }
}

export default {
  name: 'DashboardAdmin',
  components: {
    PanelGroup,
    LineChart
  },
  data() {
    return {
      lineChartData: lineChartData.data
    }
  },
/*
  // 点击PanelGroup触发
  methods: {
    handleSetLineChartData(type) {
      this.lineChartData = lineChartData[type]
    }
  }*/
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
