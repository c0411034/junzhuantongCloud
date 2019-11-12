// miniprogram/pages/indexQuestion/indexQuestion.js
const db = wx.cloud.database()
const questionUtils = require('../../utils/questionUtils.js')
Page({
  /**
   * 页面的初始数据
   */
  data: {
    currentQuestionType: "WRONG", //当其显示的题目类型（WRONG 错题集、COLLECTION 收藏集\Question疑惑集）
    currentQuestionTitleSecondId: "",
    currentQuestionTitleSecondName: "",
    questionList: [],
    groupQuestionList: [],
    currentQuestionIndex: [0, 0],
    quesitonIndexNum: 0,
    currentQuestion: {},
    totalQuestiuonCount: 0,
    questionType: "单选",
    questionContent: "题目",
    questionOption: [],
    questionOptionNumber: ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z"],
    nextQuestionBottonIsdisabled: false,
    preQuestionBottonIsdisabled: false,
    showQuestionContent: "0",
    showQuestionOption: "0",
    showQuestionAnalyze: false,
    showQuestionNote: "0",
    questionSelectorHeight: "0",
    questionSelectorTop: "100%",
    questionSelectorShadowVisible: "hidden",
    questionSelectorShadowOpacity: "0",
    isEditNote: false,
    openid: ""
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    console.log(options.questionType)
    this.setData({
      currentQuestionType: options.questionType
    })
    let _this = this
    var getUserInfo = require('../../utils/getUserInfo.js')
    getUserInfo.getUserOpenId(this.data.openid).then(res => {
      _this.setData({
        openid: res.result.openid
      })
      getQuesionList(_this.data.currentQuestionType, _this.data.openid, _this)
      //TODO
      // this.showQuestionSelector()

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

  },
  optionTab: function(event) {
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
      let isCorrect = event.currentTarget.dataset.iscorrect
      this.data.currentQuestion.answerStatus.lastAnswerStatus = isCorrect;
      this.data.currentQuestion.answerStatus.lastAnswer = optionId;
      let options = questionUtils.colorfulOptions(this, this.data.currentQuestion.questionOption)
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
      let colorOptions = questionUtils.colorfulOptions(this, this.data.questionOption)
      this.data.currentQuestion.options = colorOptions
      refreshQuestion(this.data.currentQuestion, this)
      this.setData({
        questionList: this.data.questionList,
        questionOption: colorOptions
      })
      this.showQuestionAnalyze();
    }
  },

  submitMutipleOrSAQ: function() {
    let answer = questionUtils.mutipleOptionAnswer(this.data.questionOption)
    this.data.currentQuestion.answerStatus.lastAnswerStatus = answer.isCorrect;
    this.data.currentQuestion.answerStatus.lastAnswer = answer.answer;
    let options = questionUtils.colorfulOptions(this, this.data.currentQuestion.questionOption)
    this.setData({
      currentQuestion: this.data.currentQuestion,
      questionOption: options,
      questionList: this.data.questionList
    })
    this.showQuestionAnalyze();
  },

  showNextQuestion: function() {
    let currentQuestionIndex = getNextQuestionIndex(this)
    this.setData({
      currentQuestionIndex: currentQuestionIndex
    });
    let indexQuestion = getQuestionIndexQuestionIndex(this, currentQuestionIndex)

    refreshQuestion(indexQuestion, this);
  },
  showPreQuestion: function() {
    let currentQuestionIndex = getPreQuestionIndex(this)
    this.setData({
      currentQuestionIndex: currentQuestionIndex
    });
    let indexQuestion = getQuestionIndexQuestionIndex(this, currentQuestionIndex)

    refreshQuestion(indexQuestion, this);
  },
  stopEditNoteQuestion: function(event) {
    questionUtils.stopEditNoteQuestion(this, event)
  },
  showQuestionAnalyze: function() {
    this.setData({
      showQuestionAnalyze: true
    })
  },
  showQuestionSelector: function() {
    questionUtils.showQuestionSelector(this)
  },
  hiddenQuestionSelector: function() {
    questionUtils.hiddenQuestionSelector(this)
  },
  gotoIndexQuestion: function(event) {
    let questionIndex = event.currentTarget.dataset.questionindex
    console.log("questionIndex")
    console.log(questionIndex)
    this.setData({
      currentQuestionIndex: questionIndex
    })
    let indexQuestion = getQuestionIndexQuestionIndex(this, questionIndex)
    refreshQuestion(indexQuestion, this)
    this.hiddenQuestionSelector();
  },
  collectionQuestion: function(event) {
    questionUtils.collectionQuestion(this)
  },
  questionQuestion: function(event) {
    questionUtils.questionQuestion(this)
  },
  removeWrongQuestion: function(event) {
    let _this = this
    wx.showModal({
      title: '提示',
      content: '是否将该提移除错题集？',
      success(res) {
        wx.cloud.callFunction({
          name: 'removeWrongQuestion',
          data: {
            questionId: _this.data.currentQuestion._id
          }
        }).then(res => {
          wx.showToast({
            title: '移除成功，请重新进入页面更新',
            icon: 'none',
            duration: 2000
          })
          _this.showNextQuestion()
        })
      }
    })
  },
})

function currentIsLastQuestion(_this) {
  let currentQuestionIndex = _this.data.currentQuestionIndex
  if (currentQuestionIndex[0] == _this.data.groupQuestionList.length - 1 &&
    currentQuestionIndex[1] == _this.data.groupQuestionList[currentQuestionIndex[0]].questionList.length - 1) {
    //已经到最后一题了
    return true
  } else {
    return false
  }
}
//返回下一题的index
function getNextQuestionIndex(_this) {
  let currentQuestionIndex = _this.data.currentQuestionIndex
  if (currentQuestionIndex[1] < _this.data.groupQuestionList[currentQuestionIndex[0]].questionList.length - 1) {
    currentQuestionIndex[1] += 1
    return currentQuestionIndex
  } else if (currentQuestionIndex[0] < _this.data.groupQuestionList.length - 1) {
    currentQuestionIndex[0] += 1
    currentQuestionIndex[1] = 0
    return currentQuestionIndex
  } else {
    //说明已经到了最后一题
    return currentQuestionIndex
  }
}
//返回上一题的index
function getPreQuestionIndex(_this) {
  let currentQuestionIndex = _this.data.currentQuestionIndex
  console.log("currentQuestionIndex[1]:" + currentQuestionIndex[1])
  if (currentQuestionIndex[1] > 0) {
    currentQuestionIndex[1] -= 1
    return currentQuestionIndex
  } else if (currentQuestionIndex[0] > 0) {
    currentQuestionIndex[0] -= 1
    currentQuestionIndex[1] = _this.data.groupQuestionList[currentQuestionIndex[0]].questionList.length - 1
    return currentQuestionIndex
  } else {
    //说明已经到了最后一题
    return currentQuestionIndex
  }
}

//根据两位数组的index返回全局变量中的指定question
function getQuestionIndexQuestionIndex(_this, index) {
  let indexQuestion = _this.data.groupQuestionList[index[0]].questionList[index[1]]
  return indexQuestion;
}

//根据两位数组的index返回在总题数中的第几位,从1开始
function getQuestionIndex(_this) {
  let arrayIndex = _this.data.currentQuestionIndex

  if (arrayIndex[0] == 0) return arrayIndex[1] + 1
  let index = 0
  let i = arrayIndex[0] - 1
  while (i > -1) {
    index += _this.data.groupQuestionList[i].questionList.length
    i--
  }
  index += arrayIndex[1] + 1
  return index;
}
//更新一道题目
function refreshQuestion(question, _this) {
  //错题集、收藏集肯定有answerStatus
  _this.setData({
    showQuestionOption: "0",
    currentQuestion: question,
    showQuestionAnalyze: false,
  })
  let quesitonIndexNum = getQuestionIndex(_this)
  _this.setData({
    quesitonIndexNum: quesitonIndexNum
  })
  questionUtils.showQuestionOption(question._id, _this)
  initPreAndNextQuestionButton(_this)
}

function initPreAndNextQuestionButton(_this) {
  if (currentIsLastQuestion(_this)) {
    _this.setData({
      preQuestionBottonIsdisabled: false, //此行用于避免在 当上一题 按钮为不可用，题目眺至最后一题时，出现上一题按钮依旧为假的bug
      nextQuestionBottonIsdisabled: true
    });
  } else if (_this.data.currentQuestionIndex.toString() == [0, 0].toString()) {
    _this.setData({
      preQuestionBottonIsdisabled: true,
      nextQuestionBottonIsdisabled: false
    });
  } else {
    _this.setData({
      preQuestionBottonIsdisabled: false,
      nextQuestionBottonIsdisabled: false
    });
  }

}

function getQuesionList(questionType, openid, _this) {
  let statusListPromise;
  if (questionType == "WRONG") {
    statusListPromise = getWrongAnswerStatusList(openid, _this)
  } else if (questionType == "COLLECTION") {
    statusListPromise = getCollectionAnswerStatusList(openid, _this)
  } else if (questionType == "QUESTION") {
    statusListPromise = getQuestionAnswerStatusList(openid, _this)
  }
  statusListPromise.then(res => {
    console.log("getQuesionList:")
    console.log(res)
    getQuestionListIndexAnswerStatusList(res).then(res => {
      let groupQuestionList = getGroupQuestionList(_this, res)
      console.log("getGroupQuestionList")
      console.log(groupQuestionList)
      _this.setData({
        groupQuestionList: groupQuestionList,
        totalQuestiuonCount: res.length,
        currentQuestionIndex: [0, 0]
      })
      let indexQuestion = getQuestionIndexQuestionIndex(_this, [0, 0])
      refreshQuestion(indexQuestion, _this)
    }).catch(e => {
      console.error(e)
      console.error("查询失败1105")
    })
  }).catch(e => {
    console.log(e)
    reject("查询失败1104")
  })
}

function getWrongAnswerStatusList(openid, _this) {
  return new Promise((resolve, reject) => {
    getWrongAnswerStatusListCount(openid).then(res => {
      let statusListCount = res
      let statusList = []
      console.log("statusListCount:" + statusListCount)
      for (let i = 0; i < statusListCount; i += 20) {
        getWrongAnswerStatusListIndexSkip(openid, i).then(res => {
            statusList = statusList.concat(res);
            console.log("111statusList.length == statusListCount")
            console.log(statusList.length == statusListCount)
            if (statusList.length == statusListCount) {
              resolve(statusList)
            }
          })
          .catch(e => {
            console.error(e)
            reject("查询失败222")
          })
      }
    })
  })
}

function getWrongAnswerStatusListIndexSkip(openid, skip) {
  return new Promise((resolve, reject) => {
    let statusList = []
    let selectPromise;

    if (skip > 0) {
      selectPromise = db.collection('UserAnswerStatus').where({
        "studyUserId": openid,
        "isWrongQuestion": true
      }).skip(skip).get()
    } else {
      //skip值为0时，会报错
      selectPromise = db.collection('UserAnswerStatus').where({
        "studyUserId": openid,
        "isWrongQuestion": true
      }).get()
    }
    selectPromise.then(res => {
      console.log("getWrongAnswerStatusListIndexSkip:" + skip)
      console.log(res)
      resolve(res.data);
    }).catch(e => {
      console.error(e)
      reject("查询失败!")
    })
  })
}

function getWrongAnswerStatusListCount(openid) {
  return new Promise((resolve, reject) => {
    db.collection('UserAnswerStatus').where({
      "studyUserId": openid,
      "isWrongQuestion": true
    }).count().then(res => {
      console.log("getWrongAnswerStatusListCount")
      console.log(res)
      resolve(res.total);
    }).catch(e => {
      console.log(e)
      reject("查询失败")
    })
  })
}
/**收藏体部分 */
function getCollectionAnswerStatusList(openid, _this) {
  return new Promise((resolve, reject) => {
    getCollectionAnswerStatusListCount(openid).then(res => {
      let statusListCount = res
      let statusList = []
      console.log("statusListCount:" + statusListCount)
      for (let i = 0; i < statusListCount; i += 20) {
        getCollectionAnswerStatusListIndexSkip(openid, i).then(res => {
            statusList = statusList.concat(res);
              if (statusList.length == statusListCount) {
                resolve(statusList)
              }
          })
          .catch(e => {
            console.error(e)
            reject("查询失败222")
          })
      }
    })
  })
}

function getCollectionAnswerStatusListIndexSkip(openid, skip) {
  console.log("BeforgetCollectionnswerStatusListIndexSkip:" + skip)
  return new Promise((resolve, reject) => {
    let statusList = []
    let selectPromise;

    if (skip > 0) {
      selectPromise = db.collection('UserAnswerStatus').where({
        "studyUserId": openid,
        "isCollection": true
      }).skip(skip).get()
    } else {
      //skip值为0时，会报错
      selectPromise = db.collection('UserAnswerStatus').where({
        "studyUserId": openid,
        "isCollection": true
      }).get()
    }
    selectPromise.then(res => {
      console.log("getCollectionAnswerStatusListIndexSkip:" + skip)
      console.log(res)
      resolve(res.data);
    }).catch(e => {
      console.error(e)
      reject("查询失败!")
    })
  })
}

function getCollectionAnswerStatusListCount(openid) {
  return new Promise((resolve, reject) => {
    db.collection('UserAnswerStatus').where({
      "studyUserId": openid,
      "isCollection": true
    }).count().then(res => {
      console.log("getCollectionAnswerStatusListCount")
      console.log(res)
      resolve(res.total);
    }).catch(e => {
      console.log(e)
      reject("查询失败")
    })
  })
}
/**疑惑题部分 */
function getQuestionAnswerStatusList(openid, _this) {
  return new Promise((resolve, reject) => {
    getQuestionAnswerStatusListCount(openid).then(res => {
      let statusListCount = res
      let statusList = []
      console.log("statusListCount:" + statusListCount)
      for (let i = 0; i < statusListCount; i += 20) {
        getQuestionAnswerStatusListIndexSkip(openid, i).then(res => {
            statusList = statusList.concat(res);
            setTimeout(function() { //这里必须要延时处理，否则下面逻辑无法为真
              if (statusList.length == statusListCount) {
                resolve(statusList)
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

function getQuestionAnswerStatusListIndexSkip(openid, skip) {
  console.log("BeforgetQuestionnswerStatusListIndexSkip:" + skip)
  return new Promise((resolve, reject) => {
    let statusList = []
    let selectPromise;

    if (skip > 0) {
      selectPromise = db.collection('UserAnswerStatus').where({
        "studyUserId": openid,
        "isQuestion": true
      }).skip(skip).get()
    } else {
      //skip值为0时，会报错
      selectPromise = db.collection('UserAnswerStatus').where({
        "studyUserId": openid,
        "isQuestion": true
      }).get()
    }
    selectPromise.then(res => {
      console.log("getQuestionAnswerStatusListIndexSkip:" + skip)
      console.log(res)
      resolve(res.data);
    }).catch(e => {
      console.error(e)
      reject("查询失败!")
    })
  })
}

function getQuestionAnswerStatusListCount(openid) {
  return new Promise((resolve, reject) => {
    db.collection('UserAnswerStatus').where({
      "studyUserId": openid,
      "isQuestion": true
    }).count().then(res => {
      console.log("getQuestionAnswerStatusListCount")
      console.log(res)
      resolve(res.total);
    }).catch(e => {
      console.log(e)
      reject("查询失败")
    })
  })
}
/**************** */
function getQuestionListIndexAnswerStatusList(answerStatusList) {
  return new Promise((resolve, reject) => {
    let questionList = []
    let questionIdList = []
    console.log("getQuestionListIndexAnswerStatusList" + answerStatusList.length)
    for (let i = 0; i < answerStatusList.length; i++) {
      let item = answerStatusList[i]
      questionIdList.push(item.questionId)
      if ((i + 1) % 20 == 0 || (i + 1) == answerStatusList.length) {
        // let tmpList = questionIdList
        //因为小程序前端每次最多只能从数据库中读取20条数据
        questionUtils.getQuestionIndexIdArray(questionIdList)
          .then(res => {
            // console.log("questionIdList")
            // console.log(tmpList)
            // console.log("res")
            // console.log(res)
            let questionArray = res
            let count = i / 20; // 算出当前循环到这里第几次
            let rootNum = count * 20 //基础数
            for (let j = 0; j < questionArray.length; j++) {
              questionArray[j].answerStatus = getAnswerStatusIndexQuestionId(answerStatusList, questionArray[j]._id)
              // questionArray[j].answerStatus = answerStatusList[j+rootNum]
            }
            questionList = questionList.concat(questionArray)
            console.log("questionList.length:" + questionList.length + "  answerStatusList.length：" + answerStatusList.length)
            console.log(questionList.length == answerStatusList.length)
            console.log("questionList.length == answerStatusList.length")
            console.log(questionList.length == answerStatusList.length)
            if (questionList.length == answerStatusList.length) {
              resolve(questionList)
            }
          }).catch(e => {
            console.error(e)
            reject("查询失败")
          })
        questionIdList = []
      }
    }
  })
}
//根据questionList，将其按照二级分类进行分组
function getGroupQuestionList(_this, questionList) {
  let groupQuestionList = []
  for (let item of questionList) {
    insertQuestionInGroupQuestionList(_this, groupQuestionList, item)
  }
  return (groupQuestionList)
}

function insertQuestionInGroupQuestionList(_this, groupQuestionList, questionItem) {
  let questionTitleSecondIdInQroupQuestionList = false; //给的questionItem所属的二级分类是否已经在groupQuestionList中存在
  for (let item of groupQuestionList) {
    if (item.id == questionItem.titleSecond) {
      item.questionList.push(questionItem)
      return (groupQuestionList)
    }
  }
  //如果没有找到二级分类
  let questionGroup = {
    id: questionItem.titleSecond,
    name: "",
    questionList: [questionItem]
  }
  groupQuestionList.push(questionGroup)
  questionUtils.getQuestionTitleSecondIndexId(questionItem.titleSecond)
    .then(res => {
      questionGroup.name = res.name

      _this.setData({
        groupQuestionList: groupQuestionList
      })
      // console.log(questionGroup)
    }).catch(e => {
      console.log(e)
      reject("查询失败1102")
    })
  return groupQuestionList

}

//冗余应急方法从answerList
function getAnswerStatusIndexQuestionId(answerList, questionId) {
  for (let item of answerList) {
    if (item.questionId == questionId)
      return item
  }
  return questionUtils.getInitAnswerStatus();
}