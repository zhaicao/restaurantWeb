<template>
  <div class="seats-container">
    <div class="filter-container">
      <h2 style="text-align: center; color: #eeeeee">餐厅桌位（包间）列表</h2>
      <el-row style="float: right;">
        <el-button type="primary" icon="el-icon-edit" @click="handleAttendence('punchIn')">签到</el-button>
        <el-button type="primary" icon="el-icon-edit" @click="handleAttendence('punchOut')">签退</el-button>
        <el-button type="warning" icon="el-icon-star-off" @click="handleLeave()">请假</el-button>
        <el-button type="info" style="margin-right: 10px;" @click="logout">退出</el-button>
      </el-row>
    </div>

    <div style="margin-top: 30px">
      <el-row :gutter="20">
        <el-col :span="6" v-for="(seat, index) in seatList" :key="index">
          <div class="seat-content" :class="seat.tableUse===1 ? 'bg-used' : 'bg-free'" @click="enterMenu(seat.tableId)">
              <h2>{{ seat.tableName }}</h2>
              <span>{{ seat.tableDescription }}</span>
              <div v-if="seat.tableUse === 1">
                <span>下单时间: {{ seat.orderDate }}</span>
              </div>
              <div v-else="">
                <span>空闲</span>
              </div>
          </div>
        </el-col>
      </el-row>
    </div>

    <!--Dialog-->
    <!--增加:append-to-body="true"，使用dialog显示在阴影上-->
    <el-dialog
      :title="dialogStatus"
      :visible.sync="dialogFormVisible"
      :append-to-body="true"
      @closed="cancelCloseDialog()"
      width="35%">
      <div>
        <TakePhotos ref="takePhotos"/>
      </div>
      <div slot="footer" class="dialog-footer">
        <el-button @click="cancelCloseDialog()">取消</el-button>
        <el-button type="primary" @click="dialogStatus==='签到'?punchInData():punchOutData()">{{dialogStatus}}</el-button>
      </div>
    </el-dialog>
    <!--\Dialog-->
  </div>
</template>

<script>
  import { getTableListAll } from '@/api/seat'
  import TakePhotos from '@/views/userInfo/component/takePhoto'
  import AttendanceHandler from '@/views/userInfo/mixin/AttendanceHandler'

  export default {
    name: "Seats",
    components: { TakePhotos },
    mixins:[ AttendanceHandler ],
    data() {
      return {
        seatList: null
      }
    },
    created() {
      this.getSeatList()
    },
    methods: {
      getSeatList() {
        getTableListAll().then(res => {
          this.seatList = res.data.data
        })
      },
      enterMenu(tableId) {
        this.$router.push('/menu/' + tableId)
      },
      logout() {
        this.$store.dispatch('LogOut').then(() => {
          location.reload()// In order to re-instantiate the vue-router object to avoid bugs
        })
      },
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
