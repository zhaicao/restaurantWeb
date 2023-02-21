<template>
  <div :class="className" :style="{height:height,width:width}"/>
</template>

<script>
import echarts from 'echarts'
require('echarts/theme/macarons') // echarts theme
import { debounce } from '@/utils'

const chartColors = ['#409EFF', '#BA55D3'];

export default {
  props: {
    className: {
      type: String,
      default: 'RevenueChart'
    },
    width: {
      type: String,
      default: '100%'
    },
    height: {
      type: String,
      default: '350px'
    },
    autoResize: {
      type: Boolean,
      default: true
    },
    chartData: {
      type: Object,
      required: true
    }
  },
  data() {
    return {
      chart: null,
      sidebarElm: null,
      chartColors
    }
  },
  watch: {
    // 检测到chartData发生变化，则调用此函数，将新值传入，更新chart
    chartData: {
      deep: true,
      handler(val) {
        this.setOptions(val)
      }
    }
  },
  mounted() {
    this.initChart()
    if (this.autoResize) {
      this.__resizeHandler = debounce(() => {
        if (this.chart) {
          this.chart.resize()
        }
      }, 100)
      window.addEventListener('resize', this.__resizeHandler)
    }

    // 监听侧边栏的变化
    this.sidebarElm = document.getElementsByClassName('sidebar-container')[0]
    this.sidebarElm && this.sidebarElm.addEventListener('transitionend', this.sidebarResizeHandler)
  },
  beforeDestroy() {
    if (!this.chart) {
      return
    }
    if (this.autoResize) {
      window.removeEventListener('resize', this.__resizeHandler)
    }

    this.sidebarElm && this.sidebarElm.removeEventListener('transitionend', this.sidebarResizeHandler)

    this.chart.dispose()
    this.chart = null
  },
  methods: {
    sidebarResizeHandler(e) {
      if (e.propertyName === 'width') {
        this.__resizeHandler()
      }
    },
    setOptions({ legend, category, orderQuantity, revenue } = {}) {
      this.chart.setOption({
        xAxis: {
          data: category,
          boundaryGap: true,
          axisTick: {
            show: false
          }
        },
        grid: {
          left: 10,
          right: 20,
          bottom: 20,
          top: 30,
          containLabel: true
        },
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'cross'
          },
          padding: [5, 10],
          formatter: params => {
            let html = params[0].name + '<br>'
            for (let i = 0; i< params.length; i++) {
              html+="<div style='display:flex;justify-content:space-between;margin-bottom: 5px;'>"
              html+="<div style='margin-right: 20px;'>"
              html+='<span style="display:inline-block;margin-right:5px;border-radius:10px;width:10px;height:10px;background-color:'+params[i].color+';"></span>'
              html+=params[i].seriesName;
              html+="</div>"
              html+="<div style='font-weight: 550;'>"
              if (params[i].seriesName.indexOf('元') != -1)
                html+=params[i].value.toFixed(2)+" 元<br>"+"</div>";
              else
                html+=params[i].value+" 笔<br>"+"</div>";
              html+="</div>"
            }
            return html
          }
        },
        yAxis: [
          {
            name: legend[0],
            type: 'value',
            axisLabel: {
              textStyle: {fontsize: 20},
              formatter: value => value.toFixed(2)
            },
            axisTick: {
              show: false
            },
            axisLine: {
              show: true,
              lineStyle: {
                color: chartColors[1]
              }
            },
          },
          {
            name: legend[1],
            type: 'value',
            position: 'right',
            axisLabel: {
              textStyle: {fontsize: 20}
            },
            axisTick: {
              show: false
            },
            axisLine: {
              show: true,
              lineStyle: {
                color: chartColors[0]
              }
            },
          }
        ],
        legend: {
          data: legend
        },
        series: [{
          name: legend[0],
          smooth: true,
          type: 'line',
          itemStyle: {
            normal: {
              color: chartColors[1],
              lineStyle: {
                color: chartColors[1],
                width: 2
              }
            }
          },
          data: revenue,
          animationDuration: 2000,
          animationEasing: 'quadraticOut',
        },{
            name: legend[1],
            itemStyle: {
              normal: {
                color: chartColors[0],
                lineStyle: {
                  color: chartColors[0],
                  width: 2
                }
              }
            },
            smooth: true,
            type: 'bar',
            data: orderQuantity,
            animationDuration: 2000,
            animationEasing: 'cubicInOut',
            yAxisIndex: 1
          }]
      }, true)
    },
    initChart() {
      // this.$el 指向当前组件template模板中的根标签
      this.chart = echarts.init(this.$el, 'macarons')
      this.setOptions(this.chartData)
    }
  }
}
</script>
