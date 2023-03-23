<template>
  <div class="seats-container">
    <div :style="{ right: true }" class="bar__side-bar-bg"/>
    <div :style="{ right: true }">
      <div
        @mouseover="sideMouseOver1"
        @mouseout="sideMouseOut1"
      >
        <el-button
          size="medium"
          class="bar__btn"
          style="position: absolute; z-index: 998; margin-top: 400px;"
          @click="table = true"
        >
          <!--            style="position: absolute; z-index: 998; margin-top: 400px;"-->
          {{ btnName }}
          <i class="el-icon-s-order"/>
        </el-button>
      </div>
    </div>

    <div class="filter-container">

      <h2 style="text-align: center; color: #eeeeee">餐厅桌位（包间）列表</h2>
      <el-row style="float: right;">
        <!--        <el-button v-if="isShow" type="primary" style="margin-left: 16px;" @click="table = true">排号</el-button>-->
        <el-button
          type="success"
          style="margin-left: 16px;"
          @click="opened('numberTable1')">叫号</el-button>
        <el-button type="primary" icon="el-icon-edit" @click="handleAttendence('punchIn')">签到</el-button>
        <el-button type="primary" icon="el-icon-edit" @click="handleAttendence('punchOut')">签退</el-button>
        <el-button type="warning" icon="el-icon-star-off" @click="handleLeave()">请假</el-button>
        <el-button type="info" style="margin-right: 10px;" @click="logout">退出</el-button>
      </el-row>
    </div>

    <div style="margin-top: 30px">
      <el-row :gutter="20">
        <el-col v-for="(seat, index) in seatList" :span="6" :key="index">
          <div :class="seat.tableUse===1 ? 'bg-used' : 'bg-free'" class="seat-content" @click="enterMenu(seat.tableId)">
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

    <el-drawer
      :append-to-body="true"
      :visible.sync="table"
      title="排号"
      direction="ltr"
      size="50%">
      <el-table :data="callnumberList">
        <el-table-column prop="elementNum" label="号码" width="200"/>
        <el-table-column prop="elementUserPhone" label="电话号码" width="200"/>
        <el-table-column prop="elementDate" label="日期" width="200"/>
        <el-table-column label="操作">
          <template slot-scope="scope">
            <div class="operation-column">
              <el-button
                v-if="scope.$index == 0"
                size="mini"
                type="primary"
                @click="numberEdit(scope.row.number,scope.$index)">入座</el-button>
              <el-button
                v-if="scope.$index == 0"
                size="mini"
                type="warning"
                @click="numberRe(scope.row)">过号</el-button>
              <el-button
                size="mini"
                type="danger"
                @click="numberDelete(scope.row)">删除</el-button>
            </div>
          </template>
        </el-table-column>
      </el-table>
      <span style="margin-left: 20px">
        总数：{{ callnumberList.length }}
      </span>
      <el-row style="float: right;">
        <!--        <el-button-->
        <!--          type="success"-->
        <!--          style="margin-right: 250px;........"-->
        <!--          @click="opened">叫号</el-button>-->
      </el-row>
    </el-drawer>

    <!--Dialog-->
    <!--增加:append-to-body="true"，使用dialog显示在阴影上-->
    <el-dialog
      :title="dialogStatus"
      :visible.sync="dialogFormVisible"
      :append-to-body="true"
      width="35%"
      @closed="cancelCloseDialog()">
      <div>
        <TakePhotos ref="takePhotos"/>
      </div>
      <div slot="footer" class="dialog-footer">
        <el-button @click="cancelCloseDialog()">取消</el-button>
        <el-button type="primary" @click="dialogStatus==='签到'?punchInData():punchOutData()">{{ dialogStatus }}</el-button>
      </div>
    </el-dialog>
    <!--\Dialog-->

    <el-dialog :visible.sync="outVisible" :append-to-body="true" title="叫号信息" center @close="addnumberline">
      <el-table :data="numberTable">
        <el-table-column prop="elementNum" label="号码"/>
        <el-table-column prop="elementUserPhone" label="电话号码"/>
        <el-table-column prop="elementFrontNum" label="前面人数"/>
        <el-table-column prop="elementDate" label="日期"/>
      </el-table>
      <div style="text-align:center">
        <input
          ref="inputdata"
          type="text"
          class="hiddenIpt"
          @keyup.enter="addnumberline()"
        >
        <el-button
          type="success"
          style="margin-right: 50px;........"
          @click="addnumberline()">确定</el-button>
      </div>
    </el-dialog>
    <!--\Dialog-->

    <!--Dialog-->
    <el-dialog :visible.sync="outForm" :append-to-body="true" title="叫号" center @close="resetForm('numberTable1')">
      <el-form ref="numberTable1" :rules="rules" :model="numberTable1" :validate-on-rule-change="false" label-position="left" label-width="120px" style="width: 500px; margin-left:50px;">

        <el-form-item label="手机号" prop="elementUserPhone">
          <el-input v-model.number="numberTable1.elementUserPhone" @keyup.enter.native="getCallNumber()"/>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="getCallNumber()" >确定</el-button>
          <!--          <el-button @click="closeoutForm()">取消</el-button>-->
          <el-button @click="resetForm('numberTable1')">取消</el-button>
        </el-form-item>
      </el-form>
    </el-dialog>

  </div>
</template>

<script>
import { getTableListAll } from '@/api/seat'
import TakePhotos from '@/views/userInfo/component/takePhoto'
import AttendanceHandler from '@/views/userInfo/mixin/AttendanceHandler'
// eslint-disable-next-line no-unused-vars
import { getCallnumberListAll, getNumber, getAllNumber, delQueue, takeNumber, regetNumber } from '../../api/callnumber'

export default {
  name: 'Seats',
  components: { TakePhotos },
  mixins: [AttendanceHandler],
  data() {
    return {
      rules: {
        elementUserPhone: [
          // 添加正则表达式 pattern: /^1[3|5|7|8|9]\d{9}$/，验证手机号是否正确
          { required: true, message: '请输入手机号', trigger: 'blur' },
          { pattern: /^(13[0-9]|14[01456879]|15[0-35-9]|16[2567]|17[0-8]|18[0-9]|19[0-35-9])\d{8}$/, message: '请输入正确的号码格式', trigger: ['blur', 'change'] }
        ]
      },

      // CallnumberList:null,
      table: false,
      gridData: [{
        date: '2023-03-16 10:01:10',
        number: '1',
        telenumber: '无'
      }, {
        date: '2023-03-16 10:05:10',
        number: '2',
        telenumber: '无'
      }, {
        date: '2023-03-16 10:10:10',
        number: '3',
        telenumber: '无'
      }, {
        date: '2023-03-16 10:15:10',
        number: '4',
        telenumber: '111'
      }],
      seatList: null,
      drawer: false,
      isShow: true,
      // 默认Dialog表单不可见
      outVisible: false,
      outForm: false,
      dialogStatus: '',
      numberTable: [],
      numberTable1: {
        elementUserPhone: ' '
      },
      callnumberList: ' ',
      btnName: ''
    }
  },

  watch: {
    outVisible() {
      if (this.outVisible) {
        this.$nextTick(() => {
          this.$refs.inputdata.focus()
        })
      }
    }
  },

  created() {
    this.getCallnumberListAll()
    this.getSeatList()
  },

  methods: {
    // 侧边栏-鼠标移动样式
    sideMouseOver1() {
      this.btnName = '叫号详情'
    },
    // 侧边栏-鼠标移除样式
    sideMouseOut1() {
      this.btnName = ''
    },

    // 叫号
    opened(formName) {
      if (this.$refs[formName]) {
        this.$refs[formName].clearValidate()
      }
      this.outForm = true
    },

    getCallNumber() {
      this.$refs.numberTable1.validate(valid => {
        // 如果验证失败，不发送请求
        if (!valid) {
          console.log('error submit!!')
          return false
        } else {
          getNumber(this.numberTable1).then(res => {
            if (res.data.code === 200) {
              // console.log(res)
              this.numberTable.push(res.data.data)
              // console.log(this.numberTable)
              this.outVisible = true
              this.outForm = false
              this.numberTable1 = this.$options.data().numberTable1
            } else { this.$message.error(res.data.message) }
          })
        }
      })
    },

    addnumberline() {
      this.getCallnumberListAll()
      this.outVisible = false
      this.numberTable = this.$options.data().numberTable
    },

    closeoutForm() {
      this.outForm = false
      this.numberTable1.elementUserPhone = this.$options.data().numberTable1.elementUserPhone
    },

    resetForm(formName) {
      this.outForm = false
      this.$refs[formName].resetFields()
    },

    // 入座
    numberEdit(id, index) {
      this.$confirm('是否入座', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.gridData.splice(index, 1)
        takeNumber().then(res => {
          getTableListAll().then(res => {
            this.seatList = res.data.data
            console.log(this.seatList)
            for (var item of this.seatList) {
              if (item.tableUse == 0) {
                // console.log(item.tableId)
                this.$router.push('/menu/' + item.tableId)
                break
              }
            }
          })
        })
      }).catch(() => {
        this.$message({
          type: 'info',
          message: '已取消入座'
        })
      })
    },

    // 重排/过号
    numberRe(row) {
      this.$confirm('将过号此号码, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        regetNumber(row).then(res => {
          if (res.data.code === 200) {
            this.$notify({
              title: '成功',
              message: '过号成功',
              type: 'success',
              duration: 2000
            })
            this.getCallnumberListAll()
          } else { this.$message.error(res.data.message) }
        })
      }).catch(() => {
        this.$message({
          type: 'info',
          message: '已取消过号'
        })
      })
    },

    // 删除排号
    numberDelete(row) {
      console.log(row)
      this.$confirm('将删除此排号, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        // this.gridData.splice(index, 1)
        delQueue(row).then(res => {
          if (res.data.code === 200) {
            this.$notify({
              title: '成功',
              message: '删除成功',
              type: 'success',
              duration: 2000
            })
            this.getCallnumberListAll()
          } else { this.$message.error(res.data.message) }
        })
      }).catch(() => {
        this.$message({
          type: 'info',
          message: '已取消删除'
        })
      })
    },

    // 获取排号列表
    getCallnumberListAll() {
      getAllNumber().then(res => {
        this.callnumberList = res.data.data
        console.log(this.callnumberList)
      })
    },

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
    }
  }
}
</script>

<style rel="stylesheet/scss" lang="scss" scoped>
  $bg:#2d3a4b;
  $bg_hover:#4b8fb1;
  $used_bg:#ff4d51;
  $free_bg:#d3dce6;
  $bg-color: #666666;
  @mixin position{
    position: fixed;
    z-index: 999;
  }

  .hiddenIpt {
    width: 1px;
    opacity: 0;
  }

  .operation-column {
    text-align: right;
    margin-left: 10%;
  }

  .bar {
    &__index {
      > > > .el-drawer__header > :first-child {
        text-align: center;
      }
    }

    &__side-bar-bg {
      @include position();
      height: 100%;
      width: 10px;
      background-color: $bg-color;
    }
  }

  .seats-jiaohao{
    z-index: 111;
  }
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
