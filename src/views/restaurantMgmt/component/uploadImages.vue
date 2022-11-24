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
    methods: {
      handleRemove(file, fileList) {
        //删除回显继续添加
        this.hideUpload = fileList.length >= this.limitCount;
      },
      handlePictureCardPreview(file) {
        this.dialogImageUrl = file.url;
        this.dialogVisible = true;
      },
      handleOnchange(file, fileList){
        // 当有上传图片时，隐藏上传加号
        this.hideUpload = fileList.length >= this.limitCount;
      },
      handleOnSuccess(){
        console.info('上传成功')
      }
    }
}
</script>

<style>
  .hide .el-upload--picture-card {
    display: none;
  }
</style>
