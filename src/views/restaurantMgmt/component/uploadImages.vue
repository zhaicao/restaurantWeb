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
          this.imageList = []
          if (n.length === 0) { // 当无上传文件时，清空已选文件并显示上传按钮
            this.hideUpload = false
          } else {  // 有上传图片（回显），赋值文件并隐藏上传按钮
            this.imageList.push({'url': n[0].url})
            this.hideUpload = true
          }
        }
      }
    },
    methods: {
      // 删除图片
      handleRemove(file, fileList) {
        //删除回显继续添加
        this.imageList = fileList
        this.hideUpload = fileList.length >= this.limitCount;
        this.transferImageList()
      },
      // 图片预览
      handlePictureCardPreview(file) {
        this.dialogImageUrl = file.url;
        this.dialogVisible = true;
      },
      // 添加文件、上传成功和上传失败时被调用
      handleOnchange(file, fileList){
        this.imageList = fileList
        // 当添加图片时，隐藏上传加号
        this.hideUpload = fileList.length >= this.limitCount;
        this.transferImageList()
      },
      handleOnSuccess(){
        console.info('上传成功')
      },
      // 向Menu父组件传值，当添加、删除图片时调用
      transferImageList(){
        this.$emit('getImageList', this.imageList)
      }
    }
}
</script>

<style>
  .hide .el-upload--picture-card {
    /* 隐藏上传按钮 */
    display: none;
  }
  .el-upload-list__item {
    /* 去掉过渡动画 */
    transition: none !important;
  }
  .el-upload-list__item-thumbnail {
    /* 图片在方框内显示长边 */
    object-fit: scale-down !important;
  }
</style>
