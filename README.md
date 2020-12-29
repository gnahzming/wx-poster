# wx-poster
# 微信海报生成组件
# npm 安装
# npm i @xuetong/wx-poster -S
<poster viewData="{{viewData}}" xtid="{{xtid}}" bind:wxLogin="wxGetLogin" bind:getHeight="getHeight" shareUrl="{{testQRCodeSrc}}"></poster>
<view class="canvas-wrapper">    
    <canvas class="canvas-background" canvas-id="canvasBackground" style="height: {{canvasHeight}}rpx"></canvas>    
    <canvas class="canvas-qrcode" canvas-id="canvasQRCode"></canvas>
</view>
{
  "usingComponents": {
    "poster": "@xuetong/wx-poster"
  }
}
# 参数说明
# xtid: 当前小程序 xtid 传值 小程序识别码 后台指定
# wxLogin: 登录授权 返回函数
# getHeight：海报高度 返回函数
# shareUrl： 二维码地址 传值
# callback
  getHeight(e) {
    // e.detail 返回海报高度， 设置canvasBackground 的高度
    console.log(e.detail)
    this.setData({
      canvasHeight: e.detail
    })
  },
    
  // 海报生成内置微信授权
  wxGetLogin(e) {
    // e.detail 授权成功 返回 token
    console.log(e.detail)
    // 返回是否海报授权
    console.log(e.detail.poster)
    if(e.detail.poster) {
       // 授权成功后 设置动态设置海报 二维码地址
       this.setData({
          testQRCodeSrc: sharelink + 'hd?r=' + USERINFO.id + '&id=' +this.data.viewData.id,
        })
      }
  }
