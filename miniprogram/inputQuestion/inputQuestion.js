// miniprogram/inputQuestion/inputQuestion.js
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

  },
  deleteQuestion:function(){

    wx.cloud.callFunction({
      name: 'deleteDB',
    }).then(res => {
      console.log("res");
      console.log(res);
    })
  },
  inputSingleQuestion:function(){
    wx.cloud.callFunction({
      name: 'inputQuestion',
      data: {
        questionType: "单选多选"
      }
    }).then(res => {
      console.log("res");
      console.log(res);
    })
  },
  inputMutiQuestion:function(){
    wx.cloud.callFunction({
      name: 'inputQuestion',
      data:{
        questionType:"多选"
      }
    }).then(res => {
      console.log("res");
      console.log(res);
    })
  },
  inputJudgeQuestion: function () {
    wx.cloud.callFunction({
      name: 'inputQuestion',
      data: {
        questionType: "判断"
      }
    }).then(res => {
      console.log("res");
      console.log(res);
    })
  },
})
const loadFiles = (fileName) => { //加载本地文件存储数据
  return new Promise((resolve, reject) => {
    const FileSystemManager = wx.getFileSystemManager()
    FileSystemManager.readFile({ //读文件
      filePath: wx.env.USER_DATA_PATH + "/" + fileName,
      encoding: 'utf8',
      success(res) {
        if (res.data) {
          resolve(res.data)
        }
      },
      fail(err) {
        console.log('读取失败', err)
        reject(err)
      }
    })
  })
}

// function handleChoiseQuestion(questionContent, questionType) {
//   let questionList = questionContent.split("\r\n")
//   let currentQuestionID = "";
//   let currentQuestionTitleSecondID = "";
//   let length = questionList.length
//   let skipThisQuestion = false;//当此标识为真时，不再获取Option进入数据库，直到找到下一道题目后， 再将此标识置为假，主要用于当出现一到题目在数据库中已存在时，跳过该题目
//   for (var i = 0; i < length; i++) {
//     let question = questionList[i]
//     let questionStrLength = question.length;
//     if (questionStrLength < 4) {
//       continue;//空行不处理
//     }
//     let signal = question.substr(0, 3)
//     let questionContent = question.substr(3, questionStrLength - 3)
//     if (signal == "###") {
//       continue;//注释行不处理
//     }
//     if (signal == "%%%") {
//       //更新二级题目分类的ID
//       currentQuestionTitleSecondID = questionContent
//     } else if (signal == "@@@" || signal == "@#@" || signal == "@##") {
//       //插入题目，并更新当前题目ID
//       skipThisQuestion = false;
//       wx.cloud.callFunction({
//         name: 'inputQuestion',
//         data: {
//           url: "isHaveSameQuestion",
//           questionCotent: questionContent
//         }
//       }).then(res => {
//         if (res.result == false) {
//           let answer = ""
//           if (signal == "@#@") {
//             answer = true
//           } else if (signal == "@##") {
//             answer = false
//           }
//           let newQuestion = {
//             "analyze": "无",
//             "answer": answer,
//             "content": questionContent,
//             "createTime": new Date(),
//             "questionType": questionType,
//             "titleSecond": currentQuestionTitleSecondID,
//           }
//           // return question
//           wx.cloud.callFunction({
//             name: 'inputQuestion',
//             data: {
//               url: "isHaveSameQuestion",
//               questionCotent: questionContent
//             }
//           }).then(res => {

//           })
//           currentQuestionID = currentQuestionID._id
//         } else {
//           skipThisQuestion = true;
//           console.log("异常！数据库中已存在同内容的题:" + questionContent + ",下标：" + i)
//           continue;
//         }
//       })  

//       if (! await isHaveSameQuestion(questionContent)) {
//         let answer = ""
//         if (signal == "@#@") {
//           answer = true
//         } else if (signal == "@##") {
//           answer = false
//         }
//         let newQuestion = {
//           "analyze": "无",
//           "answer": answer,
//           "content": questionContent,
//           "createTime": new Date(),
//           "questionType": questionType,
//           "titleSecond": currentQuestionTitleSecondID,
//         }
//         // return question
//         currentQuestionID = await db.collection('Questions').add({
//           data: newQuestion,
//         })
//         currentQuestionID = currentQuestionID._id
//       } else {
//         skipThisQuestion = true;
//         console.log("异常！数据库中已存在同内容的题:" + questionContent + ",下标：" + i)
//         continue;
//       }

//     } else if (signal == "$$$" || signal == "$%$") {
//       //插入选项
//       if (skipThisQuestion) continue;
//       let isCorrect = false;
//       if (signal == "$%$") {
//         isCorrect = true;
//       }
//       let option = {
//         "content": questionContent,
//         "isCorrect": isCorrect,
//         "questionId": currentQuestionID,
//       }
//       await db.collection('Options').add({
//         data: option,
//       })
//     }
//   }

// }
// async function isHaveSameQuestion(questionCotent) {
//   let answerStatus = await db.collection('Questions').where({
//     "content": questionCotent
//   }).get();
//   if (answerStatus.data.length > 0) {
//     return true;
//   } else {
//     return false;//没有同内容的题目
//   }
// }
