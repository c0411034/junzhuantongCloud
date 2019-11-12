// miniprogram/pages/test/test.js

const db = wx.cloud.database()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    arrays:["66666","55555"],
    testdata:"66666",
    subject: ["Ch", "En", "Math", "physics"] 
  },
  testinarray:function(){
    console.log(333)
    return "3432"
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let startDate = new Date().getTime()
    getWrongQuestion()
    let useDate = new Date().getTime() - startDate
    console.log("useTime:"+useDate)
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
function getWrongQuestion() {
  db.collection('UserAnswerStatus').where({
    "studyUserId": "oDWSL5b76ShTCkExoHdY3Z7sk8jg",
    "isWrongQuestion": true
  }).skip(0).get().then(res => {
    console.log(res.data)
  })
}
function getQuestionIndexId(questionId) {
   db.collection('Questions').where({
    "_id": questionId
   }).get().then(res => {
     console.log(res.data)
   })
}