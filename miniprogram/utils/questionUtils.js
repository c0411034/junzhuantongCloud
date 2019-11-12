const db = wx.cloud.database()

//在题库中找到第一个未答过的题目，返回index,若都答过，返回最后一题的index
var findFirstQuestionIsNoAnswewer = function(questionList) {
  let length = questionList.length
  for (var i = 0; i < length; i++) {
    if (questionList[i].answerStatus == null || questionList[i].answerStatus.lastAnswerStatus == null) {
      return i;
    }
  }
  return length - 1;
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
      let options = res.result
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

  return options
}
//根据ID返回question本身
function getQuestionIndexId(id) {
  return new Promise((resolve, reject) => {
    db.collection('Questions').where({
      "_id": id
    }).get().then(res => {
      resolve(res.data)
    }).catch(e => {
      console.log(e)
      reject("查询失败")
    })
  })
}
//根据ID数组返回question数组，数组个数不能超过20个
function getQuestionIndexIdArray(idArray) {
  return new Promise((resolve, reject) => {
    db.collection('Questions').where({
      "_id": db.command.in(idArray)
    }).get().then(res => {
      resolve(res.data)
    }).catch(e => {
      console.log(e)
      reject("查询失败1123")
    })
  })
}

function hiddenQuestionSelector(_this) {

  _this.setData({
    questionSelectorHeight: "0",
    questionSelectorTop: "100%",
    questionSelectorShadowVisible: "hidden",
    questionSelectorShadowOpacity: "0"
  })
}



function showQuestionSelector(_this) {
  _this.setData({
    questionSelectorHeight: "80%",
    questionSelectorTop: "20%",
    questionSelectorShadowVisible: "visible",
    questionSelectorShadowOpacity: "1"
  })
}
function stopEditNoteQuestion(_this,event) {
  let noteContent = event.detail.value
  if (_this.data.currentQuestion.answerStatus.note == noteContent) {
    return
  }
  console.log(noteContent)
  _this.data.currentQuestion.answerStatus.note = noteContent;
  wx.cloud.callFunction({
    name: 'editNoteQuestion',
    data: {
      note: noteContent,
      questionId: _this.data.currentQuestion._id
    }
  }).then(res => {
    console.log("editNoteQuestion");
    console.log(res);
    wx.showToast({
      title: '笔记已保存',
      icon: 'success',
      duration: 1000
    })
    _this.setData({
      isEditNote: false,
      currentQuestion: _this.data.currentQuestion,
      questionList: _this.data.questionListz
    })
  }).catch(e => {
    wx.showToast({
      title: '笔记保存失败' + e,
      icon: 'none',
      duration: 1000
    })
  })
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
//根据ID返回question本身
function getQuestionTitleSecondIndexId(id) {
  return new Promise((resolve, reject) => {
    db.collection('QuestionTitleSecond').where({
      "_id": id
    }).get().then(res => {
      resolve(res.data[0])
    }).catch(e => {
      console.log(e)
      reject("查询失败")
    })
  })
}
function collectionQuestion (_this) {
  let isCollection = !_this.data.currentQuestion.answerStatus.isCollection;
  _this.data.currentQuestion.answerStatus.isCollection = isCollection;
  _this.setData({
    currentQuestion: _this.data.currentQuestion,
    questionList: _this.data.questionList
  })
  wx.cloud.callFunction({
    name: 'collectionQuestion',
    data: {
      isCollection: isCollection,
      questionId: _this.data.currentQuestion._id
    }
  }).then(res => {
    console.log("collectionQuestion");
    console.log(res);
  })
}
function questionQuestion(_this) {
  let isQuestion = !_this.data.currentQuestion.answerStatus.isQuestion;
  _this.data.currentQuestion.answerStatus.isQuestion = isQuestion;
  _this.setData({
    currentQuestion: _this.data.currentQuestion,
    questionList: _this.data.questionList
  })
  wx.cloud.callFunction({
    name: 'questionQuestion',
    data: {
      isQuestion: isQuestion,
      questionId: _this.data.currentQuestion._id
    }
  }).then(res => {
    console.log("questionnQuestion");
    console.log(res);
  })
}
function getInitAnswerStatus() {
  return {
    correntCount: 0,
    mistakeCount: 0,
    isCollection: false,
    isQuestion: false,
    lastAnswerStatus: null,
    isWrongQuestion:false,
    lastAnswer: "",
    lastAnswerStatus:"",
    note: ""
  }
}
module.exports = {
  findFirstQuestionIsNoAnswewer: findFirstQuestionIsNoAnswewer,
  getQuestionIndexId: getQuestionIndexId,
  getQuestionIndexIdArray: getQuestionIndexIdArray,
  hiddenQuestionSelector: hiddenQuestionSelector,
  showQuestionSelector: showQuestionSelector,
  mutipleOptionAnswer:mutipleOptionAnswer,
  colorfulOptions: colorfulOptions,
  getQuestionTitleSecondIndexId: getQuestionTitleSecondIndexId,
  showQuestionOption:showQuestionOption,
  collectionQuestion: collectionQuestion,
  questionQuestion: questionQuestion,
  getInitAnswerStatus: getInitAnswerStatus,
}