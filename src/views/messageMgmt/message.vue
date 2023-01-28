<template>
  <div class="app-container">
    <div class="filter-container">
      <el-input
        placeholder="订单号"
        v-model="listQuery.msgOrderId"
        style="width: 200px;"
        class="filter-item"
        @keyup.enter.native="handleFilter"/>

      <el-select v-model="listQuery.msgType"
                 placeholder="消息类型"
                 clearable style="width: 110px"
                 class="filter-item">
        <el-option v-for="item in msgMapping"
                   :key="item.value"
                   :label="item.label"
                   :value="item.value"/>
      </el-select>

      <el-select v-model="listQuery.isComplete"
                 placeholder="是否处理"
                 clearable style="width: 110px"
                 class="filter-item">
        <el-option v-for="(val, key) in isCompleteMapping"
                   :key="key"
                   :label="val"
                   :value="key"/>
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
      <el-button class="filter-item" style="margin-right: 10px; float: right;" type="primary" @click="handleUrgeFoods()">处理催单</el-button>
    </div>

    <!--Table-->
    <el-table
      v-loading="listLoading"
      :key="tableKey"
      :data="list"
      ref="msgTable"
      border
      fit
      highlight-current-row
      style="width: 100%;"
      :header-cell-style="{background: '#F5F5F5'}"
      @selection-change="handleSelectionChange">
      <el-table-column align="center"
                       type="selection"
                       width="55"
                       :selectable="checkSelectable">
      </el-table-column>
      <el-table-column label="序号" prop="id" align="center" width="65">
        <template slot-scope="scope">
          <span>{{ scope.$index+1 }}</span>
        </template>
      </el-table-column>
      <el-table-column label="订单号" align="center" width="270px" :show-overflow-tooltip="true">
        <template slot-scope="scope">
          <span>{{ scope.row.messageOrderId }}</span>
        </template>
      </el-table-column>
      <el-table-column label="消息类型" align="center" width="90px">
        <template slot-scope="scope">
          <el-tag
            :type="scope.row.messageType === 1?'warning':''">{{ scope.row.messageType | typeFilter }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="内容" align="center" width="450px" :show-overflow-tooltip="true">
        <template slot-scope="scope">
            <span>{{ scope.row.messageContent }}</span>
        </template>
      </el-table-column>
      <el-table-column label="发送时间" align="center" width="200px">
        <template slot-scope="scope">
          <span>{{ scope.row.messageCreateDate }}</span>
        </template>
      </el-table-column>
      <el-table-column label="是否处理" align="center" width="90px">
        <template slot-scope="scope">
          <!-- 仅催单显示 -->
          <el-tag :type="scope.row.messageComplete === 0?'warning':''"
                  v-if="scope.row.messageType === 1">{{ scope.row.messageComplete | statusFilter }}
          </el-tag>
          <span v-else>-</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" min-width="200px" class-name="small-padding fixed-width">
        <template slot-scope="scope">
          <el-button type="danger" size="mini"
                     @click="handleUrgeFoods(scope.row)"
                     v-if="scope.row.messageType === 1 && scope.row.messageComplete === 0">处理
          </el-button>
          <span v-else>-</span>
        </template>
      </el-table-column>
    </el-table>
    <!--\Table-->

    <!--分页插件-->
    <pagination v-show="total>0" :total="total" :page.sync="listQuery.currentPage" :limit.sync="listQuery.pageSize" @pagination="getList" />

    <!--Dialog-->
    <el-dialog :title="dialogStatus" :visible.sync="dialogFormVisible" width="35%">
      <div>
        <span>Test</span>
      </div>
      <div slot="footer" class="dialog-footer">
        <el-button @click="cancelCloseDialog()">取消</el-button>
        <el-button type="primary" @click="punchOutData()">{{dialogStatus}}</el-button>
      </div>
    </el-dialog>
    <!--\Dialog-->

  </div>
</template>

<script>
  import { getMsgList } from '@/api/msg'
  import waves from '@/directive/waves' // Waves directive
  import Pagination from '@/components/Pagination' // Secondary package based on el-pagination

  // 定义角色对应列表
  const msgMapping = [{
    value: 1,
    label: '催单'
  },{
    value: 2,
    label: '消息'
  }]

  const isCompleteMapping = {
    0: '未处理',
    1: '已处理'
  }

  // arr to obj ,such as { 0 : "管理员", 1 : "服务员" }
  const msgMappingKeyValue = msgMapping.reduce((acc, cur) => {
    acc[cur.value] = cur.label
    return acc
  }, {})

  export default {
    name: 'Message',
    components: { Pagination },
    directives: { waves },
    filters: {
      // 消息类型显示名字
      typeFilter(msgType) {
        if (msgType == 1 || msgType == 2)
          return msgMappingKeyValue[msgType]
        else
          return 'Other'
      },
      // 消息类型显示名字
      statusFilter(msgStatus) {
        if (msgStatus == 0 || msgStatus == 1)
          return isCompleteMapping[msgStatus]
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
          currentPage: 1,
          pageSize: 10,
          msgOrderId: undefined,
          msgType: undefined,
          isComplete: undefined,
          startDate: undefined,
          endDate: undefined
        },
        msgMapping,
        isCompleteMapping,
        urgeFoodsSelection: [],
        // 默认Dialog表单不可见
        dialogFormVisible: false,
        dialogStatus: '',
        // 时间控件-禁止选择未来时间
        datePickerOptions: {
          disabledDate(time) {
            // 禁止选择未来日期（可以选择今天）
            return time.getTime() > Date.now();
          }
        },
      }
    },
    created() {
      this.getList()
    },
    methods: {
      // 获取数据
      getList() {
        this.listLoading = true
        getMsgList(this.listQuery).then(res => {
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
      // 处理催单（含批量）
      handleUrgeFoods(row) {
        // 单个处理
        if (row != null || row != undefined) {
          this.urgeFoodsSelection = []
          this.urgeFoodsSelection.push(row)
        }
        // 批量选择
        if (this.urgeFoodsSelection.length === 0) {
          this.$message.warning('请选择催单消息')
          return
        }
        // 页面更新
        for (let val of this.urgeFoodsSelection) {
          for (let item of this.list ) {
            if (item.messageId === val.messageId) {
              let index = this.list.indexOf(val)
              val.messageComplete = 1 // 催单设置已完成
              this.list.splice(index, 1, val)
            }
          }
        }
        // 清空选项
        this.$refs.msgTable.clearSelection()
        this.$notify({
          title: '成功',
          message: '催单处理成功',
          type: 'success',
          duration: 2000
        })
      },
      // 复选框检查-消息类型为1且未处理的催单可选中
      checkSelectable(row) {
        return row.messageType === 1 && row.messageComplete === 0
      },
      // 复选框选择事件
      handleSelectionChange(val) {
        this.urgeFoodsSelection = val;
      },
    }
  }
</script>

<style scoped>
</style>
