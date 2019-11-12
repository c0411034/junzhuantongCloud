// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()
const db = cloud.database({
  env: "self-stydy-spirit-tyb9d"
})
let wxContext;

// 云函数入口函数
exports.main = async (event, context) => {
  wxContext = cloud.getWXContext()
  let quesion = await getAnswerStatusIndexQuestionAndUser(event.questionId)
  return quesion
}

async function getQuesionListAnswerStatus(quesionList) {
  let myQuestionList = new Array()
  for (let item of quesionList) {
    let answerStatus = await getAnswerStatusIndexQuestionAndUser(item._id)
    item.answerStatus = answerStatus
    myQuestionList.push(item);
  }
  return myQuestionList;
}

async function getAnswerStatusIndexQuestionAndUser(questionId) {
  let answerStatus = await db.collection('UserAnswerStatus').where({
    "questionId": questionId,
    "studyUserId": wxContext.OPENID
  }).get();
  if (answerStatus.data.length > 0) {
    answerStatus = answerStatus.data[0];
    delete answerStatus.questionId;//删除冗余的属性
    delete answerStatus.studyUserId;
    return answerStatus;
  } else {
    return null;//没有答题情况
  }
}