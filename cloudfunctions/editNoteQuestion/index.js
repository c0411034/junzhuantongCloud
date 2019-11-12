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
  let answerStatus = await isHaveAnswerStatusIndexQuestion(event.questionId)
  if (answerStatus != false) {

    await updateAnswerStatusIndexQuestion(event.questionId, event.note)
  } else {
    await addAnswerStatusIndexQuestion(event.questionId, event.note)
  }
  return "sucess"
}
async function isHaveAnswerStatusIndexQuestion(questionId) {
  let answerStatus = await db.collection('UserAnswerStatus').where({
    "questionId": questionId,
    "studyUserId": wxContext.OPENID
  }).get();
  if (answerStatus.data.length > 0) {
    return answerStatus.data[0];
  } else {
    return false;//没有答题情况
  }
}
async function updateAnswerStatusIndexQuestion(questionId, note) {
  let answerStatus = await db.collection('UserAnswerStatus').where({
    "questionId": questionId,
    "studyUserId": wxContext.OPENID
  }).update({
    data: {
      "note": note,
    },
  })
}
async function addAnswerStatusIndexQuestion(questionId, note) {
  let answerStatus = {
    "lastAnswerStatus": null,
    "lastAnswer": "",
    "mistakeCount": 0,
    "correctCount": 0,
    "questionId": questionId,
    "isQuestion": false,
    "isCollection": false,
    "studyUserId": wxContext.OPENID,
    "note": note,
    "isWrongQuestion": false
  }
  await db.collection('UserAnswerStatus').add({
    data: answerStatus,
  })
}