// miniprogram/pages/question/question.js
const db = wx.cloud.database()
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
    openid: "none"
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
      this.setData({
        currentQuestionTitleSecondId: options.questionTitleSecond,
        currentQuestionTitleSecondName: options.questionTitleName
      })
      getQuesionList(options.questionTitleSecond, this);
    })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {},

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

  },
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
    if (this.currentQuestionIsHaveAnswer()) {
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
    } else if (this.data.currentQuestion.questionType == "单选") {
      console.log(event)
      let isCorrect = event.currentTarget.dataset.iscorrect
      this.data.currentQuestion.answerStatus.lastAnswerStatus = isCorrect;
      this.data.currentQuestion.answerStatus.lastAnswer = optionId;
      wx.cloud.callFunction({
        name: 'submitQuestionAnswer',
        data: {
          isCorrect: isCorrect,
          answer: optionId,
          questionId: this.data.currentQuestion._id
        }
      }).then(res => {
        console.log("submitSQuestionAnswer");
        console.log(res);
        console.log(isCorrect + "|" + optionId);
        console.log(this.data.questionOption);
      })
      let options = colorfulOptions(this, this.data.currentQuestion.questionOption)
      this.setData({
        currentQuestion: this.data.currentQuestion,
        questionOption: options,
        questionList: this.data.questionList
      })
      this.showQuestionAnalyze();
    } else if (this.data.currentQuestion.questionType == "判断") {
      let isCorrect = event.currentTarget.dataset.iscorrect
      this.data.currentQuestion.answerStatus.lastAnswerStatus = isCorrect;
      this.data.currentQuestion.answerStatus.lastAnswer = this.data.currentQuestion.answer ? isCorrect : !isCorrect;
      wx.cloud.callFunction({
        name: 'submitQuestionAnswer',
        data: {
          isCorrect: isCorrect,
          answer: this.data.currentQuestion.answer ? isCorrect : !isCorrect,
          questionId: this.data.currentQuestion._id
        }
      }).then(res => {
        console.log("submitQuestionAnswer");
        console.log(res);
      })
      let colorOption = colorfulOptions(this, this.data.questionOption)
      this.data.currentQuestion.options = colorOption
            refreshQuestion(this.data.currentQuestion, this)
      this.setData({
        questionList: this.data.questionList,
        questionOption: colorOption
      })
      this.showQuestionAnalyze();
    }
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
    let isCollection = !this.data.currentQuestion.answerStatus.isCollection;
    this.data.currentQuestion.answerStatus.isCollection = isCollection;
    this.setData({
      currentQuestion: this.data.currentQuestion,
      questionList: this.data.questionList
    })
    wx.cloud.callFunction({
      name: 'collectionQuestion',
      data: {
        isCollection: isCollection,
        questionId: this.data.currentQuestion._id
      }
    }).then(res => {
      console.log("collectionQuestion");
      console.log(res);
    })
  },
  questionQuestion: function(event) {
    let isQuestion = !this.data.currentQuestion.answerStatus.isQuestion;
    this.data.currentQuestion.answerStatus.isQuestion = isQuestion;
    this.setData({
      currentQuestion: this.data.currentQuestion,
      questionList: this.data.questionList
    })
    wx.cloud.callFunction({
      name: 'questionQuestion',
      data: {
        isQuestion: isQuestion,
        questionId: this.data.currentQuestion._id
      }
    }).then(res => {
      console.log("questionnQuestion");
      console.log(res);
    })
  },
  startEditNoteQuestion: function(event) {
    this.setData({
      isEditNote: true
    })
  },
  stopEditNoteQuestion: function(event) {
    let noteContent = event.detail.value
    if (this.data.currentQuestion.answerStatus.note == noteContent) {
      return
    }
    console.log(noteContent)
    this.data.currentQuestion.answerStatus.note = noteContent;
    wx.cloud.callFunction({
      name: 'editNoteQuestion',
      data: {
        note: noteContent,
        questionId: this.data.currentQuestion._id
      }
    }).then(res => {
      console.log("editNoteQuestion");
      console.log(res);
      wx.showToast({
        title: '笔记已保存',
        icon: 'success',
        duration: 1000
      })
      this.setData({
        isEditNote: false,
        currentQuestion: this.data.currentQuestion,
        questionList: this.data.questionList
      })
    }).catch(e => {
      wx.showToast({
        title: '笔记保存失败' + e,
        icon: 'none',
        duration: 1000
      })
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
  /**工具函数 */
  currentQuestionIsHaveAnswer: function() {
    //当前题目是否已经回答过
    return this.data.currentQuestion.answerStatus.lastAnswerStatus == null ? false : true
  }
})



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
    getAnswerStatusIndexQuestionList(res.result, _this)
      .then(res => {
        console.log(res)
        let questionList=res
        _this.setData({
          questionList: questionList,
          totalQuestiuonCount: questionList.length
            })
            // questionUtils.showFirstQuestion(_this);
            showFirstQuestion(_this);

      })
    console.log(res);
    // let questionList=res.result
    // let myQuestionList = new Array()
    // for (let item of questionList) {
    //   setTimeout(function () {
    //   wx.cloud.callFunction({
    //     name: 'getAnswerStatusIndexQuestionList',
    //     data: {
    //       quesionList: questionList
    //     }
    //   }).then(res => {
    //     console.log(res);
    //     console.log(questionList.indexOf(item));
    //     let answerStatus = res.result
    //     item.answerStatus = answerStatus
    //     myQuestionList.push(item);
    //     setTimeout(function () {//这里必须要延时处理，否则下面逻辑无法为真
    //       if (questionList.length == myQuestionList.length) {
    //         _this.setData({
    //           questionList: myQuestionList,
    //           totalQuestiuonCount: myQuestionList.length
    //         })
    //         questionUtils.showFirstQuestion(_this);
    //         showFirstQuestion(_this);
    //       }
    //     }, 0)

    //   })
    //   },500)
    // }


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
  if (_this.currentQuestionIsHaveAnswer()) {
    for (let item of options) {
      if (item.isCorrect) {
        if (curentQuestion.questionType == "多选") {
          if (!curentQuestion.answerStatus.lastAnswerStatus) {
            //未答对
            if (curentQuestion.answerStatus.lastAnswer.indexOf(item._id) > -1) {
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
          if (curentQuestion.answerStatus.lastAnswer.indexOf(item._id) > -1) {
            //被选中过
            item.color = "red"
            continue;
          }
        } else if (curentQuestion.questionType == "单选") {
          if (curentQuestion.answerStatus.lastAnswer == item._id) {
            //被选中过
            item.color = "red"
            continue;
          }
        } else if (curentQuestion.questionType == "判断") {
          if (curentQuestion.answerStatus.lastAnswerStatus == false) {
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
  let questionIndex = findFirstQuestionIsNoAnswewer(_this.data.questionList);
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
function findFirstQuestionIsNoAnswewer(questionList) {
  let length = questionList.length
  for (var i = 0; i < length; i++) {
    if (questionList[i].answerStatus == null || questionList[i].answerStatus.lastAnswerStatus == null) {
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

function getAnswerStatusIndexQuestionList(questionList, _this) {
  return new Promise((resolve, reject) => {
    let myQuestionList = new Array()
    for (let item of questionList) {
      getAnswerStatusIndexQuestionAndUser(item._id,_this)
        .then(res => {
          item.answerStatus = res
          myQuestionList.push(item); 
          console.log(questionList.indexOf(item));
          setTimeout(function() { //这里必须要延时处理，否则下面逻辑无法为真
            if (questionList.length == myQuestionList.length) {
              resolve(questionList);
            }
          }, 0)
        }).catch(e => {
          reject(e)
        })
    }
  })
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
