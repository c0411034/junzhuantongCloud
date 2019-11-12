// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()
const db = cloud.database({
  env: "self-stydy-spirit-tyb9d"
})

// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  // let eventUrl = eventUrl.url;

  let questionContent="";
  if (event.questionType == "单选多选") {
    let fileID = 'cloud://self-stydy-spirit-tyb9d.7365-self-stydy-spirit-tyb9d-1259543544/单选多选题.txt'
    questionContent = await downloadQuestionFile(fileID);
    return await handleChoiseQuestion(questionContent, event.questionType)
  } else if(event.questionType=="单选"){
    let fileID = 'cloud://self-stydy-spirit-tyb9d.7365-self-stydy-spirit-tyb9d-1259543544/单选题.txt'
    questionContent = await downloadQuestionFile(fileID);
    return await handleChoiseQuestion(questionContent,event.questionType)
  } else if (event.questionType == "多选") {
    let fileID = 'cloud://self-stydy-spirit-tyb9d.7365-self-stydy-spirit-tyb9d-1259543544/多选题.txt'
    questionContent = await downloadQuestionFile(fileID);
    return await handleChoiseQuestion(questionContent, event.questionType)
  } else if (event.questionType == "判断") {
    let fileID = 'cloud://self-stydy-spirit-tyb9d.7365-self-stydy-spirit-tyb9d-1259543544/判断题.txt'
  questionContent = await downloadQuestionFile(fileID);
  return await handleChoiseQuestion(questionContent, event.questionType)
}
}
async function downloadQuestionFile(fileID){
  let res = await cloud.downloadFile({
    fileID: fileID,
  })
  let buffer = res.fileContent
  return buffer.toString('utf8')
}
async function handleChoiseQuestion(questionContent,questionType) {
  let questionList = questionContent.split("\r\n")
  let currentQuestionID = "";
  let currentQuestionTitleSecondID = "";
  let length = questionList.length
  let skipThisQuestion=false;//当此标识为真时，不再获取Option进入数据库，直到找到下一道题目后， 再将此标识置为假，主要用于当出现一到题目在数据库中已存在时，跳过该题目
  let inputCount=0;//累计导入题目数
  const MAX_INPUT_QUESTION_NUM=10;//最大单次导入题目数
  for (var i = 0; i < length; i++) {
    let question = questionList[i]
    let questionStrLength = question.length;
    if (questionStrLength<4){
      continue;//空行不处理
    }
    let signal = question.substr(0, 3)
    let questionContent = question.substr(3, questionStrLength-3)
    let analyze="无"
    if(questionContent.indexOf("&&&")>-1){
      //说明有解析部分
      let content = questionContent.split("&&&")
      questionContent = content[0]
      analyze=content[1]
    }
    if (signal == "###"){
      continue;//注释行不处理
    }
    if(signal=="%%%"){
      //更新二级题目分类的ID
      currentQuestionTitleSecondID = questionContent
    } else if (signal == "^^^") {
      questionType = questionContent
    } 
    else if (signal == "@@@" || signal == "@#@" || signal == "@##") {
      //插入题目，并更新当前题目ID
      skipThisQuestion = false;
      if (! await isHaveSameQuestion(questionContent)) {
        let answer = ""
        if (signal == "@#@") {
          answer = true
        } else if (signal == "@##") {
          answer = false
        }
        let newQuestion = {
          "analyze": analyze,
          "answer": answer,
          "content": questionContent,
          "createTime": new Date(),
          "questionType": questionType,
          "titleSecond": currentQuestionTitleSecondID,
        }
        if (inputCount > MAX_INPUT_QUESTION_NUM){
          //如果累计导入题目次数超过10次，则中断导入，为了避免3秒超时
          return "导入了" + MAX_INPUT_QUESTION_NUM+"条，暂停导入,请重新启动"
        }
        // return question
        currentQuestionID=await db.collection('Questions').add({
          data: newQuestion,
        })
        currentQuestionID = currentQuestionID._id
        inputCount++;
      }else{
        skipThisQuestion=true;
        console.log( "异常！数据库中已存在同内容的题:"+questionContent+",下标："+i)
        continue;
      }

    } else if (signal == "$$$" || signal == "$%$") {
      //插入选项
      if (skipThisQuestion)continue;
      let isCorrect=false;
      if ( signal == "$%$"){
        isCorrect=true;
      }
      let option = {
        "content": questionContent,
        "isCorrect": isCorrect,
        "questionId": currentQuestionID,
      }
      await db.collection('Options').add({
        data: option,
      })
    }
  }
  return "导入完毕"

}
async function addQuestion(newQuestion) {
  let currentQuestionID = await db.collection('Questions').add({
    data: newQuestion,
  })
  return currentQuestionID
}
async function addOption(option) {
  let optionID = await db.collection('Options').add({
    data: option,
  })
  return optionID
}
async function isHaveSameQuestion(questionCotent) {
  let answerStatus = await db.collection('Questions').where({
    "content": questionCotent
  }).get();
  if (answerStatus.data.length > 0) {
    return true;
  } else {
    return false;//没有同内容的题目
  }
}