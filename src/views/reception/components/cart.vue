<template>
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
          <div class="checkout btn" @click="checkOut()"><em>确认下单 - ￥<span>{{ totalMoney }}</span></em></div>
        </div>
      </div>
    </div>  <!--.cd-cart-->
  </div>  <!--cd-cart-container -->

</template>

<script>

  export default {
    name: "Cart",
    data() {
      return {
        cart: {
          isOpen: false,
          isEmpty: true,
        },
      }
    },
    props: {
      cartFoodList: {
        type: Array,
        required: true
      },
      baseUrl: {
        type: String,
        default: window.location.host
      }
    },
    computed: {
      // 购物车总价
      totalMoney: function() {
        let sum = 0
        for (const foodItem of this.cartFoodList) {
          sum += Number(Number(foodItem.menu.menuPrice) * Number(foodItem.odAmount))
        }
        return sum.toFixed(2)
      }
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
      }
    },
    methods: {
      // 打开/关闭购物车
      cartTrigger() {
        this.cart.isOpen = !this.cart.isOpen
      },
      // 购物车删除已加入的菜品
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
      // 购物车下单
      checkOut() {
        this.$emit('event')
      }
    }
  }
</script>

<style lang="scss" scoped>
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
  ul {
    padding: 0;
    margin: 0;
    list-style: none;
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
