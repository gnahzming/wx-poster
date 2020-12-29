// 生成二维码海报
import drawQrcode from './weapp.qrcode.esm';
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    shareUrl: {
      type: String,
      value: ''
    },
    viewData: {
      type: Object,
      value: ''
    },
    xtid: {
      type: Number,
      value: null
    }
  },
  /**
   * 组件的初始数据
   */
  data: {
    /** 测试用二维码图片 */
    testQRCodeSrc: '',
    /** 展示用海报图片 */
    imgSrc: '',
    token: '',
    loading: false
  },
  lifetimes: {
    attached: function () {
      // 在组件实例进入页面节点树时执行
    },
    detached: function () {
      // 在组件实例被从页面节点树移除时执行
    },
  },
  methods: {
    // 生成海报
    async generatePoster(e) {
      e.poster = true;
      this.triggerEvent('wxLogin', e)
      // 开启弹窗
      this.setData({ posterShow: true, loading: true})
      await this._getScreenRatio();
      let qrcodeSrc = await this._getGenerateQR();
      this._getImageInfo(qrcodeSrc);
      // HACK: (兜底)添加最长图片加载时间，避免图片加载时间过长导致加载中一直显示
    },
    /** 获取屏幕比例 */
    _getScreenRatio() {
      /** 设计稿里的屏幕宽度 */
      const ORI_WIDTH = 375;
      return new Promise(resolve => {
        wx.getSystemInfo({
          success: res => {
            this.setData({
              ratio: ORI_WIDTH / res.windowWidth || 1
            });
            resolve(null);
          }
          // 因为设置了ratio的默认初始值为1，所以这里不做false回调处理
        });
      });
    },
    /** 获取网络图片转换为本地图片 */
    _getImageInfo(qrcodeSrc) {
      let _this = this;
      let backgroundImgSrc = this.data.viewData.details_url;
      //// 因为当前域名未配置在微信公众平台downloadfile域名，所以使用本地图片代替
      wx.getImageInfo({
        src: backgroundImgSrc,
        success: res => {
          _this.triggerEvent('getHeight', 707 * (res.height / res.width))
          setTimeout(()=>{
            this._drawImage(res.path, qrcodeSrc, res.width, res.height);
          }, 1000)
        },
        fail: err => {
          console.error(
            '_drawImage/wx.getImageInfo()',
            '获取网络图片失败',
            err
          );
        }
      });
    },
    /** 根据链接生成动态二维码 */
    _getGenerateQR() {
      const QRCodeWidth = 107 / this.data.ratio; // 是canvasQRCode的长宽除以2，即真实二维码图片的长宽除以2
      const QRCodeHeight = 107 / this.data.ratio;
      const CanvasId = 'canvasQRCode'; // 页面二维码canvas容器的ID，必须
      return new Promise(resolve => {
        setTimeout(() => {
          try {
            drawQrcode({
              width: QRCodeWidth,
              height: QRCodeHeight,
              canvasId: CanvasId,
              text: this.data.shareUrl,
              callback: e => {
                // 将canvas保存至临时文件
                wx.canvasToTempFilePath({
                  canvasId: CanvasId,
                  success: res => {
                    // 设置用于测试的二维码图片
                    this.setData({
                      testQRCodeSrc: res.tempFilePath
                    });
                    resolve(res.tempFilePath);
                  }
                });
              }
            });
          } catch (e) {
            console.log(e)
          }
        }, 1000)
      });
    },
    /**
     * 绘制带二维码的背景图片
     * @param {number} index 背景图片及canvas编号
     * @param {String} backgroundImgPath 背景图片本地地址
     * @param {String} qrcodeSrc 二维码图片本地临时地址
     */
    _drawImage(backgroundImgPath, qrcodeSrc, w, h) {
      // 图片尺寸常量
      const backImgWidth = 353.5 / this.data.ratio;
      const backImgHeight = (353.5 * (h / w)) / this.data.ratio;
      /** 二维码在x轴位置 */
      const qrcodeX = 234 / this.data.ratio;
      /** 二维码在y轴位置 */
      const qrcodeY = ((353.5 * (h / w)) - 121) / this.data.ratio;
      /** 二维码绘制在图片中的宽度 */
      const qrcodeWidth = 100 / this.data.ratio;
      /** 二维码绘制在图片中的高度 */
      const qrcodeHeight = 100 / this.data.ratio;
      // 准备画布,设置长宽
      let ctx = wx.createCanvasContext('canvasBackground'); // 这个canvas必须是在页面里存在的
      ctx.drawImage(backgroundImgPath, 0, 0, backImgWidth, backImgHeight); // 设置背景图片
      ctx.fillStyle = "#EEEEFF";
      ctx.fillRect(qrcodeX - 5, qrcodeY - 5, qrcodeWidth + 5, qrcodeHeight + 5);
      ctx.drawImage(qrcodeSrc, qrcodeX, qrcodeY, qrcodeWidth, qrcodeHeight); // X坐标，Y坐标，二维码长，二维码宽
      ctx.draw(true, () => {
        // 为了防止canvas资源转换失败，所以将资源转换放在draw的成功回调内执行
        wx.canvasToTempFilePath({
          canvasId: 'canvasBackground',
          success: res => {
            this.setData({
              imgSrc: res.tempFilePath
            });
            this.setData({ loading: false })
          },
          fail: err => {
            console.error(
              '_drawImage/wx.canvasToTempFilePath()',
              '获取canvas临时图片地址失败',
              err
            );
          }
        });
      });
    },
    dialogColse() {
      this.setData({
        posterShow: false
      })
    },
    savePhoto() {
      const _this = this;
      wx.saveImageToPhotosAlbum({
        filePath: this.data.imgSrc,
        success: function (res) {
          wx.showToast({
            title: '保存成功',
            duration: 1000
          })
          _this.setData({
            posterShow: false
          })
        },
        fail(res) {
          wx.showToast({
            title: '保存失败',
            duration: 1000
          })
        }
      });
    }
  }
})
