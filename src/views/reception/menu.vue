<template>
  <div class="body">

    <!--侧边栏-->
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

        <div class="xin-main">
          <div class="xin-content" style="height: 90%;">
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
                  <img class="cart_img" :src="baseUrl + '/' + scope.row.menu.menuImgBasicPath + '/' + scope.row.menu.menuImg">
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
    </div>  <!--/侧边栏-->


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
    <div class="cd-cart-container"
         :class="{
              'empty': cart.isEmpty,
              'cart-open': cart.isOpen
         }">
      <div class="cd-cart-trigger" @click="cartTrigger()">
        <ul class="count">  <!--cart items count-->
          <li>{{ cartFoodList.length }}</li>
          <li>0</li>
        </ul>
      </div>

      <div class="cd-cart">
        <div class="wrapper">
          <header>
            <h2><span class="cart-userName"></span>您已选择如下菜品:</h2>
          </header>

          <div class="body" style="background-color: #ffffff;">
            <ul>
              <li class="product" v-for="food in this.cartFoodList">
                <div class="product-image">
                  <img class="cart_img" :src="baseUrl + '/' + food.menu.menuImgBasicPath + '/' + food.menu.menuImg">
                </div>
                <div class="product-details">
                  <h3>
                    <div class="cart_a">{{ food.menu.menuName }}</div>
                  </h3>
                  <span class="price">¥{{ (food.menu.menuPrice * food.odAmount).toFixed(2) }}</span>
                  <div class="actions">
                    <div class="delete-item" @click="deleteCartItem(food)">
                      删除
                    </div>
                    <div class="quantity">
                      <label>数量</label>
                      <el-input-number v-model="food.odAmount" size="small" :min="1" :max="10" style="width: 100px"></el-input-number>
                    </div>
                  </div>
                </div>
              </li>
              <!-- products added to the cart will be inserted here using JavaScript -->
            </ul>
          </div>

          <div class="footer">
            <div class="checkout btn" @click="cartCheckOut()"><em>确认下单 - ￥<span>{{ totalMoney }}</span></em></div>
          </div>
        </div>
      </div>  <!--.cd-cart-->
    </div>  <!--cd-cart-container -->

    <!-- 备注dialog -->
    <el-dialog title="订单备注" :visible.sync="dialogFormVisible">
      <el-form :model="form">
        <el-form-item label="备注内容">
          <el-input
            type="textarea"
            placeholder="请输入内容"
            v-model="form.msg"
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
  import { getMenuList } from '@/api/menu'
  import { getOrderFoodListByTableId, addOrderFood } from '@/api/order'
  import { mapGetters } from "vuex";

  const menuCategoryMapping = {
    staple: '主食',
    snack: '小吃',
    drink: '饮料'
  }

  export default {
    name: "Menu",
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
        moreOpsBtnVisible: false, //“更多操作”按钮是否可用
        drawerTitle: '',
        cart: {
          isOpen: false,
          isEmpty: true,
        },
        /*侧边栏数据*/
        drawerShow: false,
        title: "",
        drawerSize: "",
        slotName: "",
        isShow: false, //侧边栏
        barRight: "",
        btnName: '',
        form: {
          msg: undefined
        }
      }
    },
    computed: {
      totalMoney: function() {
        let sum = 0
        for (const foodItem of this.cartFoodList) {
          sum += Number(Number(foodItem.menu.menuPrice) * Number(foodItem.odAmount))
        }
        return sum.toFixed(2)
      }
    },
    created() {
      this.getMenuFoodList()
      this.getOrderFoodList()
    },
    watch: {
      cartFoodList: {
        immediate: true,
        // 判断购物车是否为空，改变其样式
        handler(val) {
          if (val.length !== 0)
            this.cart.isEmpty = false
          else {
            this.cart.isOpen = false
            this.cart.isEmpty = true
            }
        }
      },
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
      sideMouseOver() {
        this.btnName = '订单详情'
      },
      sideMouseOut() {
        this.btnName = ''
      },
      handleClose(done) {
        this.isShow = false
        done()
      },
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
      getOrderFoodList() {
        getOrderFoodListByTableId(this.tableId).then( res => {
          if (res.data.code === 200) {
            this.orderId = res.data.data.orderId
            this.orderFoodList = res.data.data.orderdetail
          }
        })
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
      // 打开/关闭购物车
      cartTrigger() {
        this.cart.isOpen = !this.cart.isOpen
      },
      deleteCartItem(item) {
        const index = this.cartFoodList.findIndex((v) => {
          return v.foodId === item.foodId
        })
        if (index !== -1)
          this.cartFoodList.splice(index, 1)
      },
      // 清空购物车
      clearCart() {
        this.cartFoodList = []
      },
      // 选中Tab
      selectTab(category) {
        this.isSelectedTab = category
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
            this.cart.isEmpty = true
          } else
            this.$message.error('下单失败，请联系管理员')
        })



      },
      // 下拉菜单操作
      handleCommand(command) {
        if (command === 'msg')
          this.dialogFormVisible = true
        else if (command === 'urge')
          this.sendUrgeMsg()
        else if (command === 'orderCheckout')
          this.orderCheckOut()
        else if (command === 'cancelOrder')
          this.cancelOrder()
        else
          console.error('Dropdown command error')
      },
      sendMsg(orderId) {
        console.info('sendMsg:' + this.form.msg)
        this.form.msg = undefined
        this.dialogFormVisible = false
      },
      sendUrgeMsg(orderId) {
        this.$message.success('催单成功')
      },
      orderCheckOut(orderId) {
        this.$message.success('结账成功')
      },
      cancelOrder(orderId) {
        this.$message.success('该订单已成功撤销')
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
  }
  .xin-main{
    position: relative;
    height: 100%;
    overflow: hidden;
  }
  .xin-content{
    overflow:auto;
    box-sizing: border-box;
  }
  .demo-drawer__content {
    display: flex;
    flex-direction: column;
    height: 100%;
  }
  .demo-drawer__footer {
    display: flex !important;
  }
  /deep/ .el-drawer__header {
    font-weight: bolder;
  }
  /* /侧边栏样式*/
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

  /*购物车样式*/
  /* --------------------------------

  Primary style

  -------------------------------- */

  /* 购物车弹出层样式 */
  .cd-cart h3,.cd-cart ul {
    margin: 0;
    padding: 0;
    border: 0;
    font-size: 100%;
    font: inherit;
    vertical-align: baseline;
  }
  .cd-cart ol, .cd-cart ul {
    list-style: none;
  }
  *, *::after, *::before {
    box-sizing: border-box;
  }

  html {
    font-size: 62.5%;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }

  .cart_a {
    color: #2c97de;
    text-decoration: none;
  }


  .cart_img {
    width: 90px;
    height: 90px;
    object-fit: contain;
  }

  .cd-add-to-cart {
    display: inline-block;
    padding: 1.2em 1.8em;
    background: #2c97de;
    border-radius: 50em;
    text-transform: uppercase;
    color: #ffffff;
    font-weight: 700;
    letter-spacing: .1em;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
    -webkit-transition: all .2s;
    transition: all .2s;
  }
  .cd-add-to-cart:hover {
    background: #42a2e1;
  }
  .cd-add-to-cart:active {
    -webkit-transform: scale(0.9);
    -ms-transform: scale(0.9);
    transform: scale(0.9);
  }

  /* --------------------------------

  Main Components

  -------------------------------- */
  .cd-cart-container::before {
    /* dark bg layer visible when the cart is open */
    content: '';
    position: fixed;
    z-index: 1;
    height: 100vh;
    width: 100vw;
    top: 0;
    left: 0;
    background: rgba(0, 0, 0, 0.5);
    opacity: 0;
    visibility: hidden;
    -webkit-transition: opacity .4s, visibility .4s;
    transition: opacity .4s, visibility .4s;
  }

  .cd-cart-container.cart-open::before {
    opacity: 1;
    visibility: visible;
  }

  .cd-cart-trigger,
  .cd-cart {
    position: fixed;
    bottom: 20px;
    right: 5%;
    -webkit-transition: -webkit-transform .2s;
    transition: -webkit-transform .2s;
    transition: transform .2s;
    transition: transform .2s, -webkit-transform .2s;
    /* Force Hardware Acceleration in WebKit */
    -webkit-transform: translateZ(0);
    transform: translateZ(0);
    -webkit-backface-visibility: hidden;
    will-change: transform;
    backface-visibility: hidden;
  }
  .empty .cd-cart-trigger, .empty
  .cd-cart {
    /* hide cart */
    -webkit-transform: translateY(150px);
    -ms-transform: translateY(150px);
    transform: translateY(150px);
  }
  @media only screen and (min-width: 1170px) {
    .cd-cart-trigger,
    .cd-cart {
      bottom: 40px;
    }
  }

  .cd-cart-trigger {
    /* button that triggers the cart content */
    z-index: 3;
    height: 72px;
    width: 72px;
    /* replace text with image */
    text-indent: 100%;
    color: transparent;
    white-space: nowrap;
    cursor: pointer;
  }
  .cd-cart-trigger::after, .cd-cart-trigger::before {
    /* used to create the cart/'X' icon */
    content: '.';
    position: absolute;
    left: 50%;
    top: 50%;
    bottom: auto;
    right: auto;
    -webkit-transform: translateX(-50%) translateY(-50%);
    -ms-transform: translateX(-50%) translateY(-50%);
    transform: translateX(-50%) translateY(-50%);
    height: 100%;
    width: 100%;
    background: url("/static/images/cd-icon-cart-close.svg") no-repeat 0 0;
    -webkit-transition: opacity .2s, -webkit-transform .2s;
    transition: opacity .2s, -webkit-transform .2s;
    transition: opacity .2s, transform .2s;
    transition: opacity .2s, transform .2s, -webkit-transform .2s;
  }
  .cd-cart-trigger::after {
    /* 'X' icon */
    background-position: -72px 0;
    opacity: 0;
    -webkit-transform: translateX(-50%) translateY(-50%) rotate(90deg);
    -ms-transform: translateX(-50%) translateY(-50%) rotate(90deg);
    transform: translateX(-50%) translateY(-50%) rotate(90deg);
  }
  .cart-open .cd-cart-trigger::before {
    opacity: 0;
  }
  .cart-open .cd-cart-trigger::after {
    opacity: 1;
    -webkit-transform: translateX(-50%) translateY(-50%);
    -ms-transform: translateX(-50%) translateY(-50%);
    transform: translateX(-50%) translateY(-50%);
  }
  .cd-cart-trigger .count {
    /* number of items indicator */
    position: absolute;
    top: -10px;
    right: -10px;
    height: 28px;
    width: 28px;
    background: #e94b35;
    color: #ffffff;
    font-size: 1rem;
    font-weight: bold;
    border-radius: 50%;
    text-indent: 0;
    -webkit-transition: -webkit-transform .2s .5s;
    transition: -webkit-transform .2s .5s;
    transition: transform .2s .5s;
    transition: transform .2s .5s, -webkit-transform .2s .5s;
  }
  .cd-cart-trigger .count li {
    /* this is the number of items in the cart */
    position: absolute;
    -webkit-transform: translateZ(0);
    transform: translateZ(0);
    left: 50%;
    top: 50%;
    bottom: auto;
    right: auto;
    -webkit-transform: translateX(-50%) translateY(-50%);
    -ms-transform: translateX(-50%) translateY(-50%);
    transform: translateX(-50%) translateY(-50%);
  }
  .cd-cart-trigger .count li:last-of-type {
    visibility: hidden;
  }
  .cd-cart-trigger .count.update-count li:last-of-type {
    -webkit-animation: cd-qty-enter .15s;
    animation: cd-qty-enter .15s;
    -webkit-animation-direction: forwards;
    animation-direction: forwards;
  }
  .cd-cart-trigger .count.update-count li:first-of-type {
    -webkit-animation: cd-qty-leave .15s;
    animation: cd-qty-leave .15s;
    -webkit-animation-direction: forwards;
    animation-direction: forwards;
  }
  .cart-open .cd-cart-trigger .count {
    -webkit-transition: -webkit-transform .2s 0s;
    transition: -webkit-transform .2s 0s;
    transition: transform .2s 0s;
    transition: transform .2s 0s, -webkit-transform .2s 0s;
    -webkit-transform: scale(0);
    -ms-transform: scale(0);
    transform: scale(0);
  }
  .empty .cd-cart-trigger .count {
    /* fix bug - when cart is empty, do not animate count */
    -webkit-transform: scale(1);
    -ms-transform: scale(1);
    transform: scale(1);
  }
  .cd-cart-trigger:hover + div .wrapper {
    box-shadow: 0 6px 40px rgba(0, 0, 0, 0.3);
  }
  .cart-open .cd-cart-trigger:hover + div .wrapper {
    box-shadow: 0 4px 30px rgba(0, 0, 0, 0.17);
  }

  .cd-cart {
    /* cart content */
    z-index: 2;
    width: 90%;
    max-width: 440px;
    height: 400px;
    max-height: 90%;
    pointer-events: none;
  }
  .cd-cart .wrapper {
    position: absolute;
    bottom: 0;
    right: 0;
    z-index: 2;
    overflow: hidden;
    height: 72px;
    width: 72px;
    border-radius: 6px;
    -webkit-transition: height .4s .1s, width  .4s .1s, box-shadow .3s;
    transition: height .4s .1s, width  .4s .1s, box-shadow .3s;
    -webkit-transition-timing-function: cubic-bezier(0.67, 0.17, 0.32, 0.95);
    transition-timing-function: cubic-bezier(0.67, 0.17, 0.32, 0.95);
    background: #ffffff;
    box-shadow: 0 4px 30px rgba(0, 0, 0, 0.17);
    pointer-events: auto;
  }
  .cd-cart header{
    position: absolute;
    z-index: 2;
    left: 0;
    width: 100%;
  }
  .cd-cart header, .cd-cart .body {
    opacity: 0;
  }
  .cd-cart header {
    top: 0;
    border-radius: 6px 6px 0 0;
    padding: 0 1.4em;
    height: 40px;
    line-height: 40px;
    background-color: #ffffff;
    -webkit-transition: opacity .2s 0s;
    transition: opacity .2s 0s;
    border-bottom: 1px solid #e6e6e6;
  }
  .cd-cart header::after {
    clear: both;
    content: "";
    display: block;
  }
  .footer {
    position: absolute;
    z-index: 2;
    left: 0;
    width: 100%;
    bottom: 0;
    border-radius: 0 0 6px 6px;
    box-shadow: 0 -2px 20px rgba(0, 0, 0, 0.15);
    background: #ffffff;
  }
  .cd-cart h2 {
    text-transform: uppercase;
    display: inline-block;
    font-size: 14px;
    font-weight: 700 !important;
    letter-spacing: .1em;
    margin: 0;
    font-weight: normal;
    font-family: 'Open Sans', sans-serif;
    color: #009fb3;
  }
  .cd-cart .undo {
    float: right;
    font-size: 1.2rem;
    opacity: 0;
    visibility: hidden;
    -webkit-transition: opacity .2s, visibility .2s;
    transition: opacity .2s, visibility .2s;
    color: #808b97;
  }
  .cd-cart .undo a {
    text-decoration: underline;
    color: #2b3e51;
  }
  .cd-cart .undo a:hover {
    color: #2c97de;
  }
  .cd-cart .undo.visible {
    opacity: 1;
    visibility: visible;
  }
  .cd-cart .checkout {
    display: block;
    height: 72px;
    line-height: 72px;
    margin-right: 72px;
    background: #2c97de;
    color: rgba(255, 255, 255, 0);
    text-align: center;
    font-size: 10px;
    font-weight: 600;
    -webkit-transition: all .2s 0s;
    transition: all .2s 0s;
  }
  .cd-cart .checkout:hover {
    background: #399ee0;
  }
  .cd-cart .checkout em {
    position: relative;
    display: inline-block;
    -webkit-transform: translateX(40px);
    -ms-transform: translateX(40px);
    transform: translateX(40px);
    -webkit-transition: -webkit-transform 0s .2s;
    transition: -webkit-transform 0s .2s;
    transition: transform 0s .2s;
    transition: transform 0s .2s, -webkit-transform 0s .2s;
  }
  .cd-cart .checkout em::after {
    position: absolute;
    top: 50%;
    bottom: auto;
    -webkit-transform: translateY(-50%);
    -ms-transform: translateY(-50%);
    transform: translateY(-50%);
    right: 0;
    content: '';
    height: 24px;
    width: 24px;
    background: url("/static/images/cd-icon-arrow-next.svg") no-repeat center center;
    opacity: 0;
    -webkit-transition: opacity .2s;
    transition: opacity .2s;
  }
  .cd-cart .body {
    position: relative;
    z-index: 1;
    height: calc(100% - 40px);
    padding: 10px 0 30px;
    margin: 40px 0;
    overflow: auto;
    -webkit-overflow-scrolling: touch;
    -webkit-transition: opacity .2s;
    transition: opacity .2s;
  }
  .cd-cart .body ul {
    overflow: hidden;
    padding: 0 1.4em;
    position: relative;
    padding-bottom: 90px;
  }
  .cd-cart .body li {
    position: relative;
    opacity: 0;
    -webkit-transform: translateX(80px);
    -ms-transform: translateX(80px);
    transform: translateX(80px);
    -webkit-transition: opacity 0s .2s, -webkit-transform 0s .2s;
    transition: opacity 0s .2s, -webkit-transform 0s .2s;
    transition: opacity 0s .2s, transform 0s .2s;
    transition: opacity 0s .2s, transform 0s .2s, -webkit-transform 0s .2s;
  }
  .cd-cart .body li::after {
    clear: both;
    content: "";
    display: block;
  }
  .cd-cart .body li:not(:last-of-type) {
    margin-bottom: 20px;
  }
  .cd-cart .body li.deleted {
    /* this class is added to an item when it is removed form the cart */
    position: absolute;
    left: 1.4em;
    width: calc(100% - 2.8em);
    opacity: 0;
    -webkit-animation: cd-item-slide-out .3s forwards;
    animation: cd-item-slide-out .3s forwards;
  }
  .cd-cart .body li.deleted.undo-deleted {
    /* used to reinsert an item deleted from the cart when user clicks 'Undo' */
    -webkit-animation: cd-item-slide-in .3s forwards;
    animation: cd-item-slide-in .3s forwards;
  }
  .cd-cart .body li.deleted + li {
    -webkit-animation: cd-item-move-up-mobile .3s;
    animation: cd-item-move-up-mobile .3s;
    -webkit-animation-fill-mode: forwards;
    animation-fill-mode: forwards;
  }
  .cd-cart .body li.undo-deleted + li {
    -webkit-animation: cd-item-move-down-mobile .3s;
    animation: cd-item-move-down-mobile .3s;
    -webkit-animation-fill-mode: forwards;
    animation-fill-mode: forwards;
  }
  .cd-cart .product-image {
    display: inline-block;
    float: left;
    /* the image height determines the height of the list item - in this case height = width */
    width: 50px;
  }
  .cd-cart .product-image img {
    display: block;
  }
  .cd-cart .product-details {
    position: relative;
    display: inline-block;
    float: right;
    width: calc( 100% - 50px);
    padding: 0.3em 0 0 0.5em;
  }
  .cd-cart .product-details::after {
    margin-bottom: 10px;
    clear: both;
    content: "";
    display: block;
  }
  .cd-cart h3, .cd-cart .price {
    font-weight: bold;
  }
  .cd-cart h3 {
    width: 70%;
    float: left;
    /* truncate title with dots if too long */
    white-space: nowrap;
    text-overflow: ellipsis;
    overflow: hidden;
  }
  .cd-cart h3 a {
    color: #2b3e51;
  }
  .cd-cart h3 a:hover {
    color: #2c97de;
  }
  .cd-cart .price {
    float: right;
    width: 30%;
    text-align: right;
  }
  .cd-cart .actions {
    font-size: 1rem;
    height: 1em;
    line-height: 1em;
  }
  .cd-cart .actions::after {
    clear: both;
    content: "";
    display: block;
  }
  .cd-cart .delete-item, .cd-cart .quantity {
    float: left;
    color: #808b97;
    -webkit-backface-visibility: hidden;
    backface-visibility: hidden;
  }
  .cd-cart .delete-item {
    margin-right: 1em;
    margin-top: 10px;
  }
  .cd-cart .delete-item:hover {
    color: #e94b35;
  }
  .delete-item {
    cursor: pointer;
  }
  .cd-cart .quantity label {
    display: inline-block;
    margin-right: .3em;
    margin-top: 10px;
  }
  .cd-cart .select {
    position: relative;
  }
  .cd-cart .select::after {
    /* switcher arrow for select element */
    content: '';
    position: absolute;
    z-index: 1;
    right: 0;
    top: 50%;
    -webkit-transform: translateY(-50%);
    -ms-transform: translateY(-50%);
    transform: translateY(-50%);
    display: block;
    width: 12px;
    height: 12px;
    background: url("/static/images/cd-icon-select.svg") no-repeat center center;
    pointer-events: none;
  }
  .cd-cart select {
    position: relative;
    padding: 0 1em 0 0;
    cursor: pointer;
    -webkit-appearance: none;
    -moz-appearance: none;
    appearance: none;
    background: transparent;
    border: none;
    border-radius: 0;
    font-size: 1rem;
    margin: 0;
    color: #808b97;
  }
  .cd-cart select:focus {
    outline: none;
    color: #2b3e51;
    box-shadow: 0 1px 0 currentColor;
  }
  .cd-cart select::-ms-expand {
    /* hide default select arrow on IE */
    display: none;
  }
  .cart-open .cd-cart .wrapper {
    height: 100%;
    width: 100%;
    -webkit-transition-delay: 0s;
    transition-delay: 0s;
  }
  .cart-open .cd-cart header, .cart-open .cd-cart .body {
    opacity: 1;
  }
  .cart-open .cd-cart header {
    -webkit-transition: opacity .2s .2s;
    transition: opacity .2s .2s;
  }
  .cart-open .cd-cart .body {
    -webkit-transition: opacity 0s;
    transition: opacity 0s;
  }
  .cart-open .cd-cart .body li {
    -webkit-transition: opacity .3s .2s, -webkit-transform .3s .2s;
    transition: opacity .3s .2s, -webkit-transform .3s .2s;
    transition: transform .3s .2s, opacity .3s .2s;
    transition: transform .3s .2s, opacity .3s .2s, -webkit-transform .3s .2s;
    opacity: 1;
    -webkit-transform: translateX(0);
    -ms-transform: translateX(0);
    transform: translateX(0);
  }
  .cart-open .cd-cart .body li:nth-of-type(2) {
    -webkit-transition-duration: .4s;
    transition-duration: .4s;
  }
  .cart-open .cd-cart .body li:nth-of-type(3) {
    -webkit-transition-duration: .5s;
    transition-duration: .5s;
  }
  .cart-open .cd-cart .body li:nth-of-type(4), .cart-open .cd-cart .body li:nth-of-type(5) {
    -webkit-transition-duration: .55s;
    transition-duration: .55s;
  }
  .cart-open .cd-cart .checkout {
    color: #ffffff;
    -webkit-transition: color .2s .3s;
    transition: color .2s .3s;
  }
  .cart-open .cd-cart .checkout em {
    -webkit-transform: translateX(0);
    -ms-transform: translateX(0);
    transform: translateX(0);
    -webkit-transition: padding .2s 0s, -webkit-transform .2s .3s;
    transition: padding .2s 0s, -webkit-transform .2s .3s;
    transition: transform .2s .3s, padding .2s 0s;
    transition: transform .2s .3s, padding .2s 0s, -webkit-transform .2s .3s;
  }
  .cart-open .cd-cart .checkout:hover em {
    padding-right: 30px;
  }
  .cart-open .cd-cart .checkout:hover em::after {
    opacity: 1;
  }
  @media only screen and (min-width: 768px) {
    .cd-cart .body li:not(:last-of-type) {
      margin-bottom: 14px;
    }
    .cd-cart .body li.deleted + li {
      -webkit-animation: cd-item-move-up .3s;
      animation: cd-item-move-up .3s;
    }
    .cd-cart .body li.undo-deleted + li {
      -webkit-animation: cd-item-move-down .3s;
      animation: cd-item-move-down .3s;
    }
    .cd-cart .checkout {
      font-size: 2rem;
      cursor: pointer;
    }
    .cd-cart .product-image {
      width: 90px;
    }
    .cd-cart .product-details {
      padding: 1.4em 0 0 1em;
      width: calc( 100% - 90px);
    }
    .cd-cart h3, .cd-cart .price {
      font-size: 1.2rem !important;
    }
  }

  @-webkit-keyframes cd-qty-enter {
    0% {
      opacity: 0;
      visibility: hidden;
      -webkit-transform: translateX(-50%) translateY(0);
      transform: translateX(-50%) translateY(0);
    }
    100% {
      opacity: 1;
      visibility: visible;
      -webkit-transform: translateX(-50%) translateY(-50%);
      transform: translateX(-50%) translateY(-50%);
    }
  }

  @keyframes cd-qty-enter {
    0% {
      opacity: 0;
      visibility: hidden;
      -webkit-transform: translateX(-50%) translateY(0);
      transform: translateX(-50%) translateY(0);
    }
    100% {
      opacity: 1;
      visibility: visible;
      -webkit-transform: translateX(-50%) translateY(-50%);
      transform: translateX(-50%) translateY(-50%);
    }
  }
  @-webkit-keyframes cd-qty-leave {
    0% {
      opacity: 1;
      visibility: visible;
      -webkit-transform: translateX(-50%) translateY(-50%);
      transform: translateX(-50%) translateY(-50%);
    }
    100% {
      opacity: 0;
      visibility: hidden;
      -webkit-transform: translateX(-50%) translateY(-100%);
      transform: translateX(-50%) translateY(-100%);
    }
  }
  @keyframes cd-qty-leave {
    0% {
      opacity: 1;
      visibility: visible;
      -webkit-transform: translateX(-50%) translateY(-50%);
      transform: translateX(-50%) translateY(-50%);
    }
    100% {
      opacity: 0;
      visibility: hidden;
      -webkit-transform: translateX(-50%) translateY(-100%);
      transform: translateX(-50%) translateY(-100%);
    }
  }
  @-webkit-keyframes cd-item-move-up-mobile {
    0% {
      padding-top: 70px;
    }
    100% {
      padding-top: 0px;
    }
  }
  @keyframes cd-item-move-up-mobile {
    0% {
      padding-top: 70px;
    }
    100% {
      padding-top: 0px;
    }
  }
  @-webkit-keyframes cd-item-move-up {
    0% {
      padding-top: 104px;
    }
    100% {
      padding-top: 0px;
    }
  }
  @keyframes cd-item-move-up {
    0% {
      padding-top: 104px;
    }
    100% {
      padding-top: 0px;
    }
  }
  @-webkit-keyframes cd-item-move-down-mobile {
    0% {
      padding-top: 0px;
    }
    100% {
      padding-top: 70px;
    }
  }
  @keyframes cd-item-move-down-mobile {
    0% {
      padding-top: 0px;
    }
    100% {
      padding-top: 70px;
    }
  }
  @-webkit-keyframes cd-item-move-down {
    0% {
      padding-top: 0px;
    }
    100% {
      padding-top: 104px;
    }
  }
  @keyframes cd-item-move-down {
    0% {
      padding-top: 0px;
    }
    100% {
      padding-top: 104px;
    }
  }
  @-webkit-keyframes cd-item-slide-out {
    0% {
      -webkit-transform: translateX(0);
      transform: translateX(0);
      opacity: 1;
    }
    100% {
      -webkit-transform: translateX(80px);
      transform: translateX(80px);
      opacity: 0;
    }
  }
  @keyframes cd-item-slide-out {
    0% {
      -webkit-transform: translateX(0);
      transform: translateX(0);
      opacity: 1;
    }
    100% {
      -webkit-transform: translateX(80px);
      transform: translateX(80px);
      opacity: 0;
    }
  }
  @-webkit-keyframes cd-item-slide-in {
    100% {
      -webkit-transform: translateX(0);
      transform: translateX(0);
      opacity: 1;
    }
    0% {
      -webkit-transform: translateX(80px);
      transform: translateX(80px);
      opacity: 0;
    }
  }
</style>
