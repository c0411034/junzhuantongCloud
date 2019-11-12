// miniprogram/pages/questionIndexQuestion/questionIndexQuestion.js
const questionUtils = require('../../utils/questionUtils.js')
Page({

  /**
   * 页面的初始数据
   */
  data: {
    currentQuestion: {},
    questionOptionNumber: ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z"],
    questionOption: [],
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    let currentQuestion ={
      _id: options.id,
      questionType: options.questionType,
      content: options.content,
      answer: options.answer,
      analyze: options.analyze,
    }
    this.setData({
      currentQuestion: currentQuestion,
    });
    questionUtils.showQuestionOption(currentQuestion._id, this)
    let _this=this;
    setTimeout(function(){
      let questionOption = colorfulOptions(_this.data.questionOption)
      _this.setData({
        questionOption: questionOption
      });
    },1000)
    
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function() {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function() {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function() {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function() {

  }
})

function colorfulOptions( options) {
  for (let item of options) {
    if (item.isCorrect) {
      item.color = "green"
    }
  }
  return options
}