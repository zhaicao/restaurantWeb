<template>
  <div class="seats-container">
    <div class="filter-container">
      <h2 style="text-align: center; color: #eeeeee">餐厅桌位（包间）列表</h2>
      <el-row style="float: right;">
        <el-button type="primary">上班打卡</el-button>
        <el-button type="primary">下班打卡</el-button>
        <el-button type="primary">请假</el-button>
        <el-button type="primary" style="margin-right: 10px;" @click="logout">退出</el-button>
      </el-row>
    </div>

    <div style="margin-top: 30px">
      <el-row :gutter="20">
        <el-col :span="6" v-for="(seat, index) in seatList" :key="index">
          <div class="seat-content" :class="seat.tableUse===1 ? 'bg-used' : 'bg-free'" @click="enterMenu(seat.tableId)">
              <h2>{{ seat.tableName }}</h2>
              <div v-if="seat.tableUse === 1">
                <span>{{ seat.tableDescription }}</span>
                <span>下单时间:2023-01-28 18:52:02</span>
              </div>
              <div v-else="">
                <span>空闲</span>
              </div>
          </div>
        </el-col>
      </el-row>
    </div>
  </div>
</template>

<script>
  import { mapGetters } from "vuex";
  import { getTableList } from '@/api/seat'

  export default {
    name: "Seats",
    data() {
      return {
        seatList: null,
        seatQuery: {
          currentPage: 1,
          pageSize: 10,
          tableId: undefined,
          tableName: undefined,
          tableUse: undefined
        }
      }
    },
    computed: {
      ...mapGetters([
        'userId'
      ])
    },
    created() {
      console.info(this.userId)
      this.getSeatList()
    },
    methods: {
      getSeatList() {
        getTableList(this.seatQuery).then(res => {
          this.seatList = res.data.data.records
          console.info(this.seatList)
        })
      },
      enterMenu(seatId) {
        console.info('进入菜单' + seatId)
        this.$router.push('/menu/' + seatId)
      },
      logout() {
        console.info('logout')
        this.$store.dispatch('LogOut').then(() => {
          location.reload()// In order to re-instantiate the vue-router object to avoid bugs
        })
      }
    }
  }
</script>

<style rel="stylesheet/scss" lang="scss" scoped>
  $bg:#2d3a4b;
  $bg_hover:#4b8fb1;
  $used_bg:#ff4d51;
  $free_bg:#d3dce6;

  .seats-container {
    position: fixed;
    height: 100%;
    width: 100%;
    background-color: $bg;
  }
  .bg-used {
    background-color: $used_bg;
  }
  .bg-free {
    background: $free_bg;
  }
  .el-row {
    margin-bottom: 20px;
    margin-left: 0px !important;
    margin-right: 0px !important;
    &:last-child {
     margin-bottom: 0;
   }
  }
  .el-col {
    border-radius: 4px;
    margin-top: 30px;
  }
  .bg-purple-dark {
    background: #99a9bf;
  }

  .bg-purple-light {
    background: #e5e9f2;
  }
  .seat-content {
    border-radius: 4px;
    min-height: 120px;
    text-align: center;
    overflow: hidden;
    cursor:pointer;   /*鼠标滑过显示小手*/
    h2 {
      margin: 10px 0 20px;
    }
    span {
      display: block;
      margin-bottom: 10px;
    }
  }
  .seat-content:hover {
    background: $bg_hover;
  }
  .row-bg {
    padding: 10px 0;
    background-color: #f9fafc;
  }
</style>
