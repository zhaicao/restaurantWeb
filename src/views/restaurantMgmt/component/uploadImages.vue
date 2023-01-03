<template>
<div>
  <el-upload
    :class="{hide:hideUpload}"
    :action="uploadUrl"
    list-type="picture-card"
    :on-preview="handlePictureCardPreview"
    :on-remove="handleRemove"
    :on-change="handleOnchange"
    :on-success="handleOnSuccess"
    :auto-upload="false"
    :file-list="imageList"
    :limit="1"
  >
    <i class="el-icon-plus"></i>
  </el-upload>
  <el-dialog :visible.sync="dialogVisible" append-to-body>
    <img width="100%" :src="dialogImageUrl" alt="">
  </el-dialog>
</div>
</template>

<script>
  export default {
  name: "UploadImages",
    data() {
      return {
        dialogImageUrl:'',
        dialogVisible:false,
        hideUpload: false,
        limitCount:1,
        imageList: [],
        uploadUrl: '#'

        }
    },
    props: ['menuImage'],
    watch: {
      menuImage: {
        immediate: true, //初始化时调用handler，默认首次不调用
        handler(n, o) {
          if (n.length > 0) { // 需结合组件强制刷新使用
            this.imageList = n
            this.hideUpload = true
          }
        }
      }
    },
    methods: {
      // 删除图片
      handleRemove(file, fileList) {
        //删除回显继续添加
        this.hideUpload = fileList.length >= this.limitCount;
      },
      // 图片预览
      handlePictureCardPreview(file) {
        this.dialogImageUrl = file.url;
        this.dialogVisible = true;
      },
      // 选择图片
      handleOnchange(file, fileList){
        this.imageList = fileList
        // 当有上传图片时，隐藏上传加号
        this.hideUpload = fileList.length >= this.limitCount;
      },
      handleOnSuccess(){
        console.info('上传成功')
      },
      // 向父组件传所选图片Val
      handleImageList(){
        this.$emit('getImageList', this.imageList[0].raw)
      }
    }
}
</script>

<style>
  .hide .el-upload--picture-card {
    display: none;
  }
</style>
