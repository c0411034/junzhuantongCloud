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
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    console.log("start test")
    getLocalAnswerStatus();
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
    // var date1 = new Date.getTime()
    // console.log(date1) 
    // getQuestionIndexId("9afd9b6a5d2bd57e07b1a6850f2967cd")
    // var date2 = new Date()
    // console.log(date2 )
    // console.log(date2-date1)
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
function testSaveLocalAnswerStatus(){
  let as={
    "9afd9b6a5d2bd57e07b1a6850f2967cd":{
      lastAnswerStatus:false,
      mistakeCount:0,
      correctCount:0,
      isQuestion:false,
      isCollection:false,
      lastAnswer:["face13585d3fea490661b92c4a4d07b3","26b301645d3fea49065eb9167cc2f71d","25c59b425d3fea49066074c9359c03c6","890198e15d3fea49065f80ed5c568b01"], 
      isWrongQuestion:false
    }
  }
  var localAnswerStatusUtil = require('../../utils/AnswerStatusUtil.js')
  let answerStatus=localAnswerStatusUtil.save("995a38e9-f7cd-4125-8ee3-f50614c6a036",as)
  console.log("saved!");
  console.log(answerStatus);
}
function getLocalAnswerStatus(){
  var localAnswerStatusUtil = require('../../utils/AnswerStatusUtil.js')
  let answerStatus=localAnswerStatusUtil.get("995a38e9-f7cd-4125-8ee3-f50614c6a036")
  console.log("answerStatus get");
  console.log(answerStatus);
}
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

function getQuestionListIndexSkip(secondTitleId, skip) {
  console.log("getQuestionListIndexSkip:" + skip)
  return new Promise((resolve, reject) => {
    let selectPromise;

    if (skip > 0) {
      selectPromise = db.collection('Questions').where({
        "titleSecond": secondTitleId
      }).skip(skip).get()
    } else {
      //skip值为0时，会报错
      selectPromise = db.collection('Questions').where({
        "titleSecond": secondTitleId
      }).get()
    }
    selectPromise.then(res => {
      console.log("getQuestionListIndexSkip:" + skip)
      console.log(res)
      resolve(res.data);
    }).catch(e => {
      console.error(e)
      reject("查询失败!")
    })
  })
}