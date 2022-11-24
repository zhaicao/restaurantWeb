<template>
  <div style="text-align: center;">
    <article>
      <section>
        <video id="video" autoplay="autoplay"></video>
      </section>
      <section>
        <canvas id="canvas"></canvas>
      </section>
      <section><img src="" alt="" id="img" /></section>
    </article>
    <!--
    <el-button type="primary" @click="getVideo">打开</el-button>
    <el-button type="primary" @click="cancelCloseVideo">关闭</el-button>
    <el-button type="primary"  @click="takePhoto" >拍照</el-button>
    -->
  </div>
</template>

<script>
  // 拍照上传组件
  // 父组件通过函数 getImg 获取照片路径,如 @getImg="getImg"
  const Address = ''
  export default {
    name: 'TakePhotos',
    methods: {
      getVideo () {
        let constraints = {
          video: { width: 500, height: 425 }
          //audio: true //开启麦克风
        };
        /*
        这里介绍新的方法:H5新媒体接口 navigator.mediaDevices.getUserMedia()
        这个方法会提示用户是否允许媒体输入,(媒体输入主要包括相机,视频采集设备,屏幕共享服务,麦克风,A/D转换器等)
        返回的是一个Promise对象。
        如果用户同意使用权限,则会将 MediaStream对象作为resolve()的参数传给then()
        如果用户拒绝使用权限,或者请求的媒体资源不可用,则会将 PermissionDeniedError作为reject()的参数传给catch()
        */
        let _this=this;
        let promise = navigator.mediaDevices.getUserMedia(constraints);
        promise.then(function (MediaStream) {
          video.srcObject = MediaStream;
          _this.MediaStreamTrack=typeof MediaStream.stop==='function'?MediaStream:MediaStream.getTracks()[0];
          video.play();

        }).catch(function (PermissionDeniedError) {
          console.log(PermissionDeniedError);
        })
      },
      cancelCloseVideo () {
        this.MediaStreamTrack && this.MediaStreamTrack.stop();
        // this.contextCanvas.clearRect(0, 0,this.contextCanvas.width, this.contextCanvas.height);//清除画布
      },
      takePhoto () {
        //获得Canvas对象
        let canvas = document.getElementById("canvas");
        let ctx = canvas.getContext('2d');
        ctx.drawImage(video, 0, 0, 500, 400);
        var photoSrc = document.getElementById("canvas").toDataURL("image/jpeg", 0.8);
        this.form1.img=photoSrc
      }
    }
  }
</script>
