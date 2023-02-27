<template>
  <div class="body">

    <!--侧边栏-->
    <!--事件方法使用props方式传入-->
    <MenuSideBar
      :order-food-list="orderFoodList"
      :base-url="baseUrl"
      :order-id="orderId"
      :msg-form="msgForm"
      :send-msg="sendMsg"
      :urgency="sendUrgeMsg"
      :checkout="orderCheckOut"
      :cancel-order="cancelOrder"
      :reset-msg-form="resetMsgForm">
    </MenuSideBar>

    <div class="header"></div>
    <div class="content">
      <div class="container_12">
        <div class="grid_12">
          <h3 class="head2">菜单</h3>
        </div>
        <div class="tabs tb gallery">
          <div class="div-nav  ">
            <div class="grid_12">
              <ul class="nav">
                <li v-for="(v, k) in this.menuCategoryMapping"
                    :class="{selected: isSelectedTab === k}"
                    @click="selectTab(k)">
                  {{ v }}
                </li>
              </ul>
            </div>
          </div>
          <div class="div-tabs">
            <div v-for="(menuList, k) in this.menuFoodList"
                 class="tab-content gallery1"
                 v-show="isSelectedTab === k">
              <div v-for="food in menuList"
                   class="grid_3"
                   @click="addToCart(food)">
                <img width="200px" height="200px" :src="baseUrl + '/' + food.menuImgBasicPath + '/' + food.menuImg">
                <div class="col2">
                  <span class="add-to-cart-info col3">{{ food.menuName }}</span>
                  <span>{{ food.menuPrice.toFixed(2) }} 元</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!--购物车-->
    <Cart
      :cart-food-list="cartFoodList"
      :base-url="baseUrl"
      @event="cartCheckOut"> <!-- $emit方式触发父组件方法 -->
    </Cart>
  </div>
</template>

<script>
  import { getMenuList } from '@/api/menu'
  import { getOrderFoodListByTableId, addOrderFood,checkOut, cancelOrder } from '@/api/order'
  import { addMsg } from '@/api/msg'
  import { mapGetters } from "vuex";
  import Cart from './components/cart'
  import MenuSideBar from "./components/menuSideBar";

  const menuCategoryMapping = {
    staple: '主食',
    snack: '小吃',
    drink: '饮料'
  }

  export default {
    name: "Menu",
    components: { MenuSideBar, Cart },
    data() {
      return {
        dialogFormVisible: false,
        baseUrl: process.env.BASE_API, // 默认URl前缀
        listQuery: {
          currentPage: 1,
          pageSize: 1000,
          menuName: undefined,
          menuType: undefined
        },
        menuCategoryMapping,
        isSelectedTab: 'staple',
        menuFoodList: [],
        cartFoodList: [],
        orderFoodList: [],
        tableId: this.$route.params.tableId, //桌位号
        orderId: undefined,
        // 消息表单
        msgForm: {
          messageUserId: undefined,
          messageOrderId: undefined,
          messageType: undefined,
          messageContent: undefined
        }
      }
    },
    computed: {
      ...mapGetters([
        'userId'
      ])
    },
    created() {
      this.getMenuFoodList()
      this.getOrderFoodList()
    },
    // 需要待数据完成后，更新userId和orderId
    updated() {
      this.msgForm.messageUserId = this.userId
      this.msgForm.messageOrderId = this.orderId
    },
    methods: {
      // 获取菜单列表
      getMenuFoodList() {
        getMenuList(this.listQuery).then(res => {
          /* 处理menuList按menuType分类，格式为
          {
          staple: [{...},{...}],
          snack: [{...},{...}],
          drink: [{...}]
          }*/
          const m = new Map()
          res.data.data.records.map( item =>{
            m.set(item.menuType, [...(m.get(item.menuType) || ''), item])
          })
          this.menuFoodList = Object.fromEntries(m.entries())
        })
      },
      // 选中菜单Tab 切换
      selectTab(category) {
        this.isSelectedTab = category
      },
      // 加入购物车
      addToCart(food) {
        // 判断List中是否存在，存在则数量+1，否则添加
        const index = this.cartFoodList.findIndex((v) => {
          return v.menu.foodId === food.foodId
        })
        if (index !== -1)
          this.cartFoodList[index].odAmount += 1
        else
          this.cartFoodList.push({menu: food, odAmount: 1})
      },
      // 购物车下单
      cartCheckOut() {
        addOrderFood(this.tableId, this.cartFoodList).then( res => {
          if (res.data.code === 200) {
            this.$message.success('下单成功')
            this.orderId = res.data.data.orderId
            // 购物车中菜品与订单中菜品的交集
            let foodInter = this.cartFoodList.filter(
              cartVal => this.orderFoodList.some(
                orderVal => orderVal.menu.foodId === cartVal.menu.foodId
              )
            )
            // 新下单菜品中存在之前已下单菜品，则增加数量
            foodInter.forEach( food => {
              // 页面更新
              for (const v of this.orderFoodList) {
                if (v.menu.foodId === food.menu.foodId) {
                  const index = this.orderFoodList.indexOf(v)
                  v.odAmount += food.odAmount  // 累加下单菜品数量
                  this.orderFoodList.splice(index, 1, v)
                  break
                }
              }
            })
            // 将新下的菜加入到订单中，不含之前已下单的菜品
            this.orderFoodList = this.orderFoodList.concat(
              // 购物车中菜品与订单中的差集
              this.cartFoodList.filter(
                cartVal => this.orderFoodList.every(
                  orderVal => orderVal.menu.foodId !== cartVal.menu.foodId
                )
              )
            )
            // 清空购物车
            this.cartFoodList = []
          } else
            this.$message.error('下单失败，请联系管理员')
        })
      },
      // 左侧边栏获取已下单的菜品列表
      getOrderFoodList() {
        getOrderFoodListByTableId(this.tableId).then( res => {
          if (res.data.code === 200) {
            this.orderId = res.data.data.orderId
            this.orderFoodList = res.data.data.orderdetail
          }
        })
      },
      // 侧边栏-发送订单备注消息
      sendMsg() {
        if (this.msgForm.messageContent == null || this.msgForm.messageContent == undefined || this.msgForm.messageContent.trim() == '') {
          this.$message.warning('请输入备注内容')
          return
        }
        this.msgForm.messageType = 2
        addMsg(this.msgForm).then(res => {
          if (res.data.code === 200) {
            this.$message.success('订单备注成功')
            this.dialogFormVisible = false
            this.resetMsgForm()
          } else
            this.$message.error(res.data.message)
        })
      },
      // 侧边栏-催单
      sendUrgeMsg() {
        this.msgForm.messageType = 1
        addMsg(this.msgForm).then(res => {
          if (res.data.code === 200) {
            this.$message.success('催单成功')
            this.resetMsgForm()
          } else
            this.$message.error(res.data.message)
        })
      },
      // 侧边栏-结账
      orderCheckOut() {
        checkOut(this.orderId).then(res => {
          if (res.data.code === 200) {
            this.$message.success('结账成功')
            this.cartFoodList = []
            this.orderFoodList = []
          } else
            this.$message.error(res.data.message)
        })
      },
      // 侧边栏-撤单
      cancelOrder() {
        cancelOrder(this.orderId).then(res => {
          if (res.data.code === 200) {
            this.$message.success('该订单已成功撤销')
            this.orderFoodList = []
          } else
            this.$message.error(res.data.message)
        })
      },
      // 侧边栏-重置消息表单
      resetMsgForm() {
        this.msgForm.messageType = undefined
        this.msgForm.messageContent = undefined
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
  /* end-侧边栏样式*/
  .body {
    background-color: #d7d7b1;
    position: relative;
    min-height: 100%;
    color: #5f5e4e;
    font: 14px/20px Arial, Helvetica, sans-serif;
  }
  .header {
    display: block;
    position: relative;
    z-index: 999;
    padding: 29px 0 21px;
  }
  .content {
    background-color: #fff;
    padding-bottom: 113px;
  }
  .container_12 {
    zoom: 1;
    margin-left: auto;
    margin-right: auto;
    width: 960px;
  }
  .container_12:before,
  .container_12:after {
    content: '.';
    display: block;
    overflow: hidden;
    visibility: hidden;
    font-size: 0;
    line-height: 0;
    width: 0;
    height: 0;
    clear: both;
  }
  .grid_12 {
    width: 940px;
    display: inline;
    float: left;
    margin-left: 10px;
    margin-right: 10px;
  }
  h3 {
    font-size: 50px;
    line-height: 50px;
    color: #5f5e4e;
    padding-top: 98px;
    margin-bottom: 49px;
    font-weight: normal;
    font-family: 'Open Sans', sans-serif;
  }
  h3.head2 {
    text-align: center;
    padding-top: 96px;
    margin-bottom: 47px;
    margin-top: 0;
  }
  .gallery {
    background: transparent;
    border: 0 none;
    font-size: 100%;
    margin: 0;
    padding: 0;
    border: 0;
    outline: 0;
    vertical-align: top;
  }
  .nav {
    font-size: 0;
    text-align: center;
    line-height: 0;
    margin-bottom: 3px;
  }
  .nav li {
    margin: 0 11px;
    display: inline-block;
    font: 18px/20px 'Open Sans', sans-serif;
    cursor:pointer;
  }
  .nav li:hover {
    color: #d9c381;
  }
  .nav li.selected {
    color: #d9c381;
  }
  ul {
    padding: 0;
    margin: 0;
    list-style: none;
  }
  .div-tabs {
    text-align: center;
  }
  .grid_3 {
    display: inline;
    float: left;
    margin-left: 10px;
    margin-right: 10px;
    cursor: pointer;
  }
  .container_12 .grid_3 {
    width: 220px;
  }
  .add-to-cart {
    cursor: pointer;
  }
  .col2 {
    color: #d9c381;
  }
  .col3 {
    color: #5f5e4e;
  }
</style>
