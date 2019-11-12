// miniprogram/pages/main/main.js
Page({

  /**
   * 页面的初始数据
   */
  data: {

  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    login()
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})
function login(){
  wx.cloud.callFunction({
    name: 'isRegisterUser',
    complete: res => {
      console.log('是否注册过 ', res)
      if (!res.result) {
        //如果未注册过，则需要登陆
        console.log("未注册用户")
        wx.navigateTo({
          url: '/pages/login/login',
        })
      } else {
        console.log("已注册用户")
        wx.cloud.callFunction({
          name: 'addLoginStation',
          complete: res => {
            console.log('已更新最后一次登陆时间', res)
          }
        })
      }
    }
  })
}


