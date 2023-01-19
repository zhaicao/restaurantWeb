<template>
  <div>
    <!--催单-->
    <el-popover
      placement="left"
      width="400"
      trigger="click"
      ref="msgPop"
      @show="getMsgList(rowData, 1)"
      class="urge-popover">
      <el-table :data="urgeList" :row-class-name="tableRowStyle">
        <el-table-column align="center" width="50px" label="序号">
          <template slot-scope="scope">
            <span>{{ scope.$index+1 }}</span>
          </template>
        </el-table-column>
        <el-table-column align="center" width="160" property="messageCreateDate" label="时间"></el-table-column>
        <el-table-column align="center" label="催单">
          <template slot-scope="scope">
            <el-button class="filter-item" type="primary" size="mini"
                       v-if="scope.row.messageComplete != 1"
                       @click="handleUrgeFoods(scope.row)">处理</el-button>
            <span v-else="">已处理</span>
          </template>
        </el-table-column>
      </el-table>
      <div slot="reference" class="msg-icon" v-if="rowData.urgeSum != 0">
        <el-badge :value="rowData.urgeSum">
          <i class="el-icon-message-solid"></i>
        </el-badge>
      </div>
      <div slot="reference" class="msg-icon" v-else="">
        <i class="el-icon-message-solid"></i>
      </div>
    </el-popover>
    <!--消息-->
    <el-popover
      placement="left"
      width="400"
      trigger="click"
      @show="getMsgList(rowData, 2)"
      class="msg-popver">
      <el-table :data="msgList" :row-class-name="tableRowStyle">
        <el-table-column width="50px" label="序号">
          <template slot-scope="scope">
            <span>{{ scope.$index+1 }}</span>
          </template>
        </el-table-column>
        <el-table-column align="center" width="160" property="messageCreateDate" label="时间"></el-table-column>
        <el-table-column align="center" property="messageContent" label="消息" :show-overflow-tooltip="true"></el-table-column>
      </el-table>
      <div slot="reference" class="msg-icon" v-if="rowData.msgSum != 0">
        <el-badge :value="rowData.msgSum" type="primary">
          <i class="el-icon-chat-dot-square"></i>
        </el-badge>
      </div>
      <div slot="reference" class="msg-icon" v-else="">
        <i class="el-icon-chat-dot-square"></i>
      </div>
    </el-popover>
  </div>
</template>

<script>
  import { getMsgListByOrderIdAndType, solveUrgeMsg } from '@/api/msg'

  export default {
    name: "MsgReminder",
    data(){
      return {
        // 催单消息列表
        urgeList: null,
        // 消息列表
        msgList: null
      }
    },
    /**
     * rowData中需要包含orderId、messageId、urgeSum和msgSum三个值
     */
    props: ['rowData'],
    methods: {
      tableRowStyle({row, rowIndex}) {
        return 'table-row'
      },
      // 获取消息列表
      getMsgList(row, msgType) {
        // 消息数为0不调用接口
        if (row.urgeSum === 0 && msgType === 1) {
          this.urgeList = null
          return
        }
        if (row.msgSum === 0 && msgType === 2) {
          this.msgList = null
          return
        }
        getMsgListByOrderIdAndType(row.orderId, msgType).then(res => {
          if (msgType === 1)
            this.urgeList = res.data.data.records
          else
            this.msgList = res.data.data.records
        })
      },
      // 处理催单
      handleUrgeFoods(row) {
        solveUrgeMsg(row.messageId).then(res => {
          if (res.data.code === 200) {
            for (const v of this.urgeList) {
              if (v.messageId === row.messageId) {
                const index = this.urgeList.indexOf(v)
                // 设定为已处理
                this.urgeList[index].messageComplete = 1
              }
            }
            this.$notify({
              title: '成功',
              message: '催单处理成功',
              type: 'success',
              duration: 2000
            })
          } else
            this.$message.error(res.data.message)
        })
      }
    }
  }
</script>

<style scoped>
  .msg-icon {
    margin-top: 8px;
    font-size: 30px;
  }
  /*
  element-ui的样式是全局，使用scoped会失效
  1. 去掉scoped(不建议)
  2. 加上.el-table >>> 类名
  */
  .el-table >>> .table-row {
    height: 50px;
  }
  .urge-popover {
    float: left;
    margin-left: 30px
  }
  .msg-popver {
    float: right;
    margin-right: 30px
  }
</style>
