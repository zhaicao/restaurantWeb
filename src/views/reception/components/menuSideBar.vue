<template>
  <div class="bar__index">
    <div class="bar__side-bar-bg" :style="{ right: true }"></div>
    <div :style="{ right: true }">
      <div
        @mouseover="sideMouseOver"
        @mouseout="sideMouseOut"
        prop="btnInfo"
      >
        <el-button
          size="medium"
          @click="isShow = true"
          class="bar__btn">
          <!--            style="position: absolute; z-index: 998; margin-top: 400px;"-->
          {{ btnName }}
          <i class="el-icon-s-order"></i>
        </el-button>
      </div>
    </div>
    <el-drawer
      :title="drawerTitle"
      :visible.sync="drawerShow"
      :before-close="handleClose"
      size="25%"
      direction="ltr">
      <div class="bar__main">
        <div class="bar__main__content" style="height: 90%;">
          <el-table :data="orderFoodList"
                    show-summary
                    :summary-method="getSummaries"
          >
            <el-table-column label="#" align="center" width="30">
              <template slot-scope="scope">
                <span>{{ scope.$index+1 }}</span>
              </template>
            </el-table-column>
            <el-table-column label="图片" width="100" align="center">
              <template slot-scope="scope">
                <img class="bar__main__content__cell-img" :src="baseUrl + '/' + scope.row.menu.menuImgBasicPath + '/' + scope.row.menu.menuImg">
              </template>
            </el-table-column>
            <el-table-column label="菜品" width="100" align="center">
              <template slot-scope="scope">
                <span>{{ scope.row.menu.menuName }}</span>
              </template>
            </el-table-column>
            <el-table-column label="数量" prop="odAmount" width="50" align="center">
              <template slot-scope="scope">
                <span>x{{ scope.row.odAmount }}</span>
              </template>
            </el-table-column>
            <el-table-column label="价格（元）" prop="menuPrice" align="center" width="120">
              <template slot-scope="scope">
                <span>{{ (scope.row.menu.menuPrice * scope.row.odAmount).toFixed(2) }}</span>
              </template>
            </el-table-column>
          </el-table>
        </div>
        <div class="xin-footer" style="height:10%; align-items:center; justify-content:center; display: flex;">
          <el-button type="warning" style="margin-right: 20px" @click="$router.back()">返回桌位列表</el-button>

          <el-dropdown
            @command="handleCommand"
            :disabled="!moreOpsBtnVisible">
            <el-button type="primary">
              更多操作<i class="el-icon-arrow-down el-icon--right"></i>
            </el-button>
            <el-dropdown-menu slot="dropdown">
              <el-dropdown-item command="msg">备注</el-dropdown-item>
              <el-dropdown-item command="urge">催单</el-dropdown-item>
              <el-dropdown-item command="orderCheckout">结账</el-dropdown-item>
              <el-dropdown-item command="cancelOrder">撤单</el-dropdown-item>
            </el-dropdown-menu>
          </el-dropdown>
        </div>
      </div>
      <!--        <slot :name="slotName"></slot>-->
    </el-drawer>
    <!-- 备注dialog -->
    <el-dialog title="订单备注" :visible.sync="dialogFormVisible">
      <el-form :model="msgForm">
        <el-form-item label="备注内容">
          <el-input
            type="textarea"
            placeholder="请输入内容"
            v-model="msgForm.messageContent"
            maxlength="50"
            show-word-limit
          >
          </el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false">取 消</el-button>
        <el-button type="primary" @click="sendMsg">确 定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
  export default {
    name: "MenuSideBar",
    props: {
      /*以下属性都必填*/
      orderFoodList: Array, // 订单菜品列表
      baseUrl: String,  // 基础路径
      orderId: String,  // 订单号
      msgForm: Object,  // 消息表单
      sendMsg: Function,  // 备注消息函数
      urgency: Function,  // 催单函数
      checkout: Function,  // 结账函数
      cancelOrder: Function,  // 去掉订单函数
      resetMsgForm: Function  // 重置消息表单内容
    },
    data() {
      return {
        dialogFormVisible: false,
        moreOpsBtnVisible: false, //“更多操作”按钮是否可用
        drawerTitle: '',
        drawerShow: false,
        title: "",
        drawerSize: "",
        slotName: "",
        isShow: false, //侧边栏
        barRight: "",
        btnName: ''
      }
    },
    watch: {
      orderFoodList: {
        immediate: true,
        // 若已下单，则显示“更多操作”按钮
        handler(val) {
          if (val.length !== 0) {
            this.moreOpsBtnVisible = true
            this.drawerTitle = '您的订单(' + this.orderId + ')明细'
          }
          else {
            this.moreOpsBtnVisible = false
            this.drawerTitle = '请选择菜品下单'
          }
        }
      },
      isShow: {
        handler(val) {
          this.drawerShow = val
        }
      }
    },
    methods: {
      // 侧边栏-鼠标移动样式
      sideMouseOver() {
        this.btnName = '订单详情'
      },
      // 侧边栏-鼠标移除样式
      sideMouseOut() {
        this.btnName = ''
      },
      // 侧边栏-el-drawer关闭
      handleClose(done) {
        this.isShow = false
        done()
      },
      // 订单明细合计
      getSummaries(param) {
        // 参数异常返回[]
        if (param.columns.length === 0 || param.data === null) return []
        const { columns, data } = param;
        const sums = []
        // 指定参与计算的列。
        // 由于是通过prop判断，故此处需与列的属性名一致
        const defineColumns = [
          'odAmount', 'menuPrice'
        ]
        columns.forEach((column, index) => {
          // 非指定列返回空字符
          if (defineColumns.indexOf(column.property) < 0) {
            sums[index] = ''
            return
          }
          const values = data.map(item => {
            if (column.property == defineColumns[1]) {
              return Number(item.menu[column.property] * item[defineColumns[0]]) // 计算总价，由于item嵌套一次，需要指定menu
            }
            else
              return Number(item[column.property])
          })
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
            sums[index] = sums[index].toFixed(2);
          else if(column.property == defineColumns[0])
            sums[index] = 'x' + sums[index];
          else
            sums[index] = sums[index];
        })
        return sums
      },
      // 侧边栏-更多操作下拉菜单操作
      handleCommand(command) {
        if (command === 'msg') {
          this.resetMsgForm()
          this.dialogFormVisible = true
        }
        else if (command === 'urge')
          this.urgency()
        else if (command === 'orderCheckout')
          this.checkout()
        else if (command === 'cancelOrder')
          this.cancelOrder()
        else
          console.error('Dropdown command error')
      }
    }
  }
</script>

<style lang="scss" scoped>
  /*侧边栏样式*/
  $bg-color: #666666;
  @mixin position{
    position: fixed;
    z-index: 999;
  }
  .bar {
  &__index {
  >>> .el-drawer__header > :first-child {
    text-align: center;
  }
  }
  &__side-bar-bg {
     @include position();
     height: 100%;
     width: 10px;
     background-color: $bg-color;
   }
  &__btn-list {
     @include position();
     top: 50%;
     transform: translate(0, -50%);
   }
  &__btn {
     display: flex;
     justify-content: flex-end;
     position: absolute;
     z-index: 998;
     margin-top: 400px;
     background: #666666;
     border-color: #666666;
     color: #eeeeee;
  >>> .el-button--primary {
    background-color: $bg-color;
    border-color: $bg-color;
    padding-left: 10px;
    padding-right: 15px;
  }
  }
  &__main {
     position: relative;
     height: 100%;
     overflow: hidden;
  &__content {
     overflow:auto;
     box-sizing: border-box;
  &__cell-img {
     width: 90px;
     height: 90px;
     object-fit: contain;
   }
  }
  }
  }
  .demo-drawer__footer {
    display: flex !important;
  }
  /deep/ .el-drawer__header {
    font-weight: bolder;
  }
  /* /侧边栏样式*/
</style>
