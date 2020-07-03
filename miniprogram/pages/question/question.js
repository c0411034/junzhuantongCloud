// miniprogram/pages/question/question.js
const db = wx.cloud.database()
var localAnswerStatusUtil = require('../../utils/AnswerStatusUtil.js')
Page({

  /**
   * 页面的初始数据
   */
  data: {
    currentQuestionTitleSecondId: "",
    currentQuestionTitleSecondName: "",
    questionList: [],
    currentQuestionIndex: -1,
    currentQuestion: {},
    totalQuestiuonCount: 0,
    questionType: "单选",
    questionContent: "题目",
    questionOption: ["AAA", "12222", "333", "444"],
    questionOptionNumber: ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z"],
    nextQuestionBottonIsdisabled: false,
    preQuestionBottonIsdisabled: true,
    showQuestionContent: "0",
    showQuestionOption: "0",
    showQuestionAnalyze: false,
    showQuestionNote: "0",
    questionSelectorHeight: "0",
    questionSelectorTop: "100%",
    questionSelectorShadowVisible: "hidden",
    questionSelectorShadowOpacity: "0",
    isEditNote: false,
    openid: "none",
    localAnswerStatus:{},
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    console.log(options.questionTitleSecond)
    let _this = this
    var getUserInfo = require('../../utils/getUserInfo.js')
    getUserInfo.getUserOpenId(this.data.openid).then(res => {
      console.log("openid:" + res.result.openid)
      _this.setData({
        openid: res.result.openid
      })
      let answerStatus=localAnswerStatusUtil.get(options.questionTitleSecond)
      this.setData({
        currentQuestionTitleSecondId: options.questionTitleSecond,
        currentQuestionTitleSecondName: options.questionTitleName,
        localAnswerStatus:answerStatus,
      })
      getQuesionList(options.questionTitleSecond, this);
    })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {},
  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {},
  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function() {},

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function() {},

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function() {},

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function() {},

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function() {},
  showNextQuestion: function() {
    showNextQuestion(this)
  },
  showPreQuestion: function() {
    showPreQuestion(this)
  },
  showQuestionAnalyze: function() {
    this.setData({
      showQuestionAnalyze: true
    })
  },
  optionTab: function(event) {
    if (currentQuestionIsHaveAnswer(this)) {
      //已答题过，不再响应事件
      return
    }
    let optionId = event.currentTarget.dataset.optionid
    if (this.data.currentQuestion.questionType == "多选") {
      let options = this.data.questionOption
      for (let item of options) {
        if (item._id == optionId) {
          if (item.color == undefined || item.color == "") {
            item.color = "blue"
          } else {
            item.color = ""
          }
        }
      }
      this.setData({
        questionOption: options
      })
      return;
    } else if (this.data.currentQuestion.questionType == "单选") {
      console.log(event)
      let isCorrect = event.currentTarget.dataset.iscorrect
      answerQuestion(this,this.data.currentQuestion._id,optionId,isCorrect);
    } else if (this.data.currentQuestion.questionType == "判断") {
      let isCorrect = event.currentTarget.dataset.iscorrect
      let answer=this.data.currentQuestion.answer ? isCorrect : !isCorrect
      answerQuestion(this,this.data.currentQuestion._id,answer,isCorrect);

    }         
    let colorOption = colorfulOptions(this, this.data.questionOption)
    this.data.currentQuestion.options = colorOption
          refreshQuestion(this.data.currentQuestion, this)
    this.setData({
      questionList: this.data.questionList,
      questionOption: colorOption
    })
    this.showQuestionAnalyze();
  },
  submitMutipleOrSAQ: function() {
    let answer = mutipleOptionAnswer(this.data.questionOption)
    this.data.currentQuestion.answerStatus.lastAnswerStatus = answer.isCorrect;
    this.data.currentQuestion.answerStatus.lastAnswer = answer.answer;
    wx.cloud.callFunction({
      name: 'submitQuestionAnswer',
      data: {
        isCorrect: answer.isCorrect,
        answer: answer.answer,
        questionId: this.data.currentQuestion._id
      }
    }).then(res => {
      console.log("submitQuestionAnswer");
      console.log(res);
    })
    let options = colorfulOptions(this, this.data.currentQuestion.questionOption)
    this.setData({
      currentQuestion: this.data.currentQuestion,
      questionOption: options,
      questionList: this.data.questionList
    })
    this.showQuestionAnalyze();
  },
  collectionQuestion: function(event) {
    let questionId=this.data.currentQuestion._id
    let answerStatus=getAnswerStatus(this,questionId)
    answerStatus.isCollection = !answerStatus.isCollection;
    updateAnswerStatus(this,questionId,answerStatus)
  },
  questionQuestion: function(event) {    
    let questionId=this.data.currentQuestion._id
    let answerStatus=getAnswerStatus(this,questionId)
    answerStatus.isQuestion = !answerStatus.isQuestion;
    updateAnswerStatus(this,questionId,answerStatus)
  },
  startEditNoteQuestion: function(event) {
    this.setData({
      isEditNote: true
    })
  },
  stopEditNoteQuestion: function(event) {
    let questionId=this.data.currentQuestion._id
    let answerStatus=getAnswerStatus(this,questionId)
    let noteContent = event.detail.value    
    this.setData({
      isEditNote: false
    })
    if (answerStatus.note == noteContent) {
      return
    }
    answerStatus.note = noteContent;    
    updateAnswerStatus(this,questionId,answerStatus)
    wx.showToast({
      title: '笔记已保存',
      icon: 'success',
      duration: 1000
    })
  },
  showQuestionSelector: function() {
    this.setData({
      questionSelectorHeight: "80%",
      questionSelectorTop: "20%",
      questionSelectorShadowVisible: "visible",
      questionSelectorShadowOpacity: "1"
    })
  },
  hiddenQuestionSelector: function() {

    this.setData({
      questionSelectorHeight: "0",
      questionSelectorTop: "100%",
      questionSelectorShadowVisible: "hidden",
      questionSelectorShadowOpacity: "0"
    })
  },
  gotoIndexQuestion: function(event) {
    let questionIndex = event.currentTarget.dataset.questionindex
    this.setData({
      currentQuestionIndex: questionIndex
    })
    let indexQuestion = this.data.questionList[this.data.currentQuestionIndex]
    refreshQuestion(indexQuestion, this)
    this.hiddenQuestionSelector();
    console.log("goto:")

  },
  removeAllAnswerStatus: function() {
    let _this = this
    wx.showModal({
      title: '提示',
      content: '是否删除所有答题记录',
      success(res) {
        if (res.confirm) {
          console.log('用户点击确定删除')
          wx.cloud.callFunction({
            name: 'removeAllAnswerStatusIndexQuestionTitleSecond',
            data: {
              secondTitleId: _this.data.currentQuestionTitleSecondId
            }
          }).then(res => {
            console.log("removeAllAnswerStatusIndexQuestionTitleSecond");
            console.log(res);
            wx.showToast({
              title: '清空成功！累计删除'+res.result+"条记录，请重新进入本页面",
              icon: 'none',
              duration: 2000
            })
            //TODO 返回主页
          })
        } else if (res.cancel) {}
      }
    })
  },
  
})
/**工具函数 */
function currentQuestionIsHaveAnswer(_this) {
  //当前题目是否已经回答过
let curentQuestion = _this.data.currentQuestion;
let answerStatus=getAnswerStatus(_this,curentQuestion._id)
if (answerStatus.lastAnswer!="" ){
  return true;
}
return false;
}
//获取该分类下的所有题目
function getQuesionList(secondTitleId, _this) {
  wx.cloud.callFunction({
    name: 'getQuestionListIndexSecondTitle',
    data: {
      secondTitleId: secondTitleId
    }
  })
  // getQuestionList(secondTitleId, _this)
  .then(res => {
    let questionList=res.result
    _this.setData({
      questionList: questionList,
      totalQuestiuonCount: questionList.length
    })
    showFirstQuestion(_this);
  })
}

function showQuestionOption(questionId, _this) {
  if (_this.data.currentQuestion.questionOption == undefined) {
    if (_this.data.currentQuestion.questionType == "判断") {
      let questionOption = [{
          content: "正确",
          isCorrect: _this.data.currentQuestion.answer ? true : false
        },
        {
          content: "错误",
          isCorrect: _this.data.currentQuestion.answer ? false : true
        },
      ]
      _this.data.currentQuestion.options = questionOption
      questionOption = colorfulOptions(_this, questionOption)
      _this.setData({
        questionOption: questionOption,
        showQuestionOption: "100"
      });
      return
    }

    wx.cloud.callFunction({
      name: 'getQuestionOption',
      data: {
        questionId: questionId
      }
    }).then(res => {
      let options = colorfulOptions(_this, res.result)
      _this.data.currentQuestion.questionOption = options
      _this.setData({
        questionOption: options,
        showQuestionOption: "100"
      });
    })
  } else {
    _this.setData({
      questionOption: _this.data.currentQuestion.questionOption,
      showQuestionOption: "100"
    });
  }
}
/**
 * 给选项附加颜色
 * 若没有答题记录时，不显示颜色
 * 若有答题记录时，
 * 是正确答案，标志为绿色
 * 被选中过，不是是正确答案，标志为红色
 * 多选时，是正确答案之一，但是答题时为选中所有正确答案，标志为紫色
 * 其余不要颜色
 */
function colorfulOptions(_this, options) {
  let curentQuestion = _this.data.currentQuestion;
  let answerStatus=getAnswerStatus(_this,curentQuestion._id)
  if (answerStatus.lastAnswer!="") {//有过答题记录
    for (let item of options) {
      if (item.isCorrect) {
        if (curentQuestion.questionType == "多选") {
          if (! answerStatus.lastAnswerStatus) {
            //未答对
            if (answerStatus.lastAnswer.indexOf(item._id) > -1) {
              //被选中过              
              item.color = "purple"
              continue;
            }
          } else {
            item.color = "green"
          }
        }
        item.color = "green"
      } else {
        if (curentQuestion.questionType == "多选") {
          if (answerStatus.lastAnswer.indexOf(item._id) > -1) {
            //被选中过
            item.color = "red"
            continue;
          }
        } else if (curentQuestion.questionType == "单选") {
          if (answerStatus.lastAnswer == item._id) {
            //被选中过
            item.color = "red"
            continue;
          }
        } else if (curentQuestion.questionType == "判断") {
          if (answerStatus.lastAnswerStatus == false) {
            //如果这个选项是错的,且答题结果也是错的，说明答题时选择的是此选项
            item.color = "red"
            continue;
          }
        }
      }
    }
  }
  return options
}
//更新一道题目
function refreshQuestion(question, _this) {
  _this.setData({
    showQuestionOption: "0",
    currentQuestion: question,
    showQuestionAnalyze: false
  })
  showQuestionOption(question._id, _this)
  initPreAndNextQuestionButton(_this)
}
/**
显示第一道题目，逻辑
当用户没有答题记录时，显示第1道题目
当用户有答题记录时，显示第1道未答题目
 */
function showFirstQuestion(_this) {
  let questionIndex = findFirstQuestionIsNoAnswewer(_this,_this.data.questionList);
  _this.setData({
    currentQuestionIndex: questionIndex
  });
  let indexQuestion = _this.data.questionList[_this.data.currentQuestionIndex]
  refreshQuestion(indexQuestion, _this);
}

function showNextQuestion(_this) {

  let currentQuestionIndex = _this.data.currentQuestionIndex + 1
  if (currentQuestionIndex > _this.data.questionList.length - 1) {
    _this.setData({
      currentQuestionIndex: _this.data.questionList.length - 1
    });
  } else {
    _this.setData({
      currentQuestionIndex: currentQuestionIndex
    });
    let indexQuestion = _this.data.questionList[_this.data.currentQuestionIndex]
    refreshQuestion(indexQuestion, _this);
  }
}

function showPreQuestion(_this) {
  let currentQuestionIndex = _this.data.currentQuestionIndex - 1
  if (currentQuestionIndex < 0) {
    _this.setData({
      currentQuestionIndex: 0
    });
  } else {
    _this.setData({
      currentQuestionIndex: currentQuestionIndex
    });
    let indexQuestion = _this.data.questionList[_this.data.currentQuestionIndex]
    refreshQuestion(indexQuestion, _this);
  }
}
//在题库中找到第一个未答过的题目，返回index,若都答过，返回最后一题的index
function findFirstQuestionIsNoAnswewer(_this,questionList) {
  let length = questionList.length
  for (var i = 0; i < length; i++) {
    let answerStatus=_this.data.localAnswerStatus[questionList[i]._id]
    if (answerStatus == null || answerStatus.lastAnswerStatus == null) {
      return i;
    }
  }
  return length - 1;
}

function getInitAnswerStatus() {
  return {
    correntCount: 0,
    mistakeCount: 0,
    isCollection: false,
    isQuestion: false,
    lastAnswerStatus: null,
    lastAnswer: "",
    note: ""
  }
}

function initPreAndNextQuestionButton(_this) {
  if (_this.data.currentQuestionIndex < _this.data.questionList.length - 1 && _this.data.currentQuestionIndex > 0) {
    _this.setData({
      preQuestionBottonIsdisabled: false,
      nextQuestionBottonIsdisabled: false
    });
  } else {
    if (_this.data.currentQuestionIndex == _this.data.questionList.length - 1) {
      _this.setData({
        preQuestionBottonIsdisabled: false, //此行用于避免在 当上一题 按钮为不可用，题目眺至最后一题时，出现上一题按钮依旧为假的bug
        nextQuestionBottonIsdisabled: true
      });
    }
    if (_this.data.currentQuestionIndex == 0) {
      _this.setData({
        preQuestionBottonIsdisabled: true
      });
    }
  }
}
//判断当前的多选option答题情况是否正确
function mutipleOptionAnswer(options) {
  let isCorrect = true
  let answer = []
  for (let item of options) {
    if (item.color == "blue") {
      if (!item.isCorrect) {
        isCorrect = false;
      }
      answer.push(item._id)
    } else {
      if (item.isCorrect) {
        isCorrect = false;
      }
    }
  }
  return {
    isCorrect: isCorrect,
    answer: answer
  }
}

function getAnswerStatusIndexQuestionAndUser(questionId, _this) {
  return new Promise((resolve, reject) => {
    db.collection('UserAnswerStatus').where({
      "questionId": questionId,
      "studyUserId": _this.data.openid
    }).get().then(res => {
      console.log("getAnswerStatusIndexQuestionAndUser-questionId:" + questionId + "|studyUserId:" + _this.data.openid)
        console.log(res.data)
        let answerStatus = res
      if (answerStatus.data.length > 0) {
          answerStatus = answerStatus.data[0];
          delete answerStatus.questionId; //删除冗余的属性
          delete answerStatus.studyUserId;
          resolve(answerStatus);
        } else {
          resolve( getInitAnswerStatus()); //没有答题情况
        }
      }).catch(e => {
        console.log(e)
        reject("查询失败getAnswerStatusIndexQuestionAndUser")
      })
    });
}

function getQuestionList(secondTitleId, _this) {
  return new Promise((resolve, reject) => {
    getQuesitonListCount(secondTitleId).then(res => {
      let questionListCount = res
      let questionList = []
      console.log("questionListCount:" + questionListCount)
      for (let i = 0; i < questionListCount; i += 20) {
        getQuestionListIndexSkip(secondTitleId, i).then(res => {
          questionList = questionList.concat(res);
          setTimeout(function () { //这里必须要延时处理，否则下面逻辑无法为真
            if (questionList.length == questionListCount) {
              resolve(questionList)
            }
          }, 0)
        })
          .catch(e => {
            console.error(e)
            reject("查询失败222")
          })
      }
    })
  })
}
function getQuesitonListCount(secondTitleId) {
  return new Promise((resolve, reject) => {
    db.collection('Questions').where({
      "titleSecond": secondTitleId
    }).count().then(res => {
      console.log("getQuesitonListCount")
      console.log(res)
      resolve(res.total);
    }).catch(e => {
      console.log(e)
      reject("查询失败")
    })
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
/**
 * 回答问题，提交答案
 */
function answerQuestion(_this,questionId,answer,isCorrect){
  let answerStatus=getAnswerStatus(_this,questionId)
  answerStatus.lastAnswerStatus = isCorrect;
  answerStatus.lastAnswer=answer;
  answerStatus.isCorrect=isCorrect;
  updateAnswerStatus(_this,questionId,answerStatus)
}

function saveLocalAnswerStatus(_this){
  localAnswerStatusUtil.save(_this.data.currentQuestionTitleSecondId,_this.data.localAnswerStatus)
  console.log("save answerStatus success! ")
}
/**
 * 在本级的answerStatus（指定titleId的AnswerStatus)中获取AnswerStatus，若无，返回一个空的AnswerStatus.
 */
function getAnswerStatus(_this,questionId) {
  return _this.data.localAnswerStatus[questionId]==null?getInitAnswerStatus():_this.data.localAnswerStatus[questionId]  
}

function updateAnswerStatus(_this,questionId,answerStatus){
  
  _this.data.localAnswerStatus[questionId]=answerStatus
  _this.setData({
    localAnswerStatus:_this.data.localAnswerStatus
  })
  saveLocalAnswerStatus(_this);
}