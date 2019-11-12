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
  return await removeWrongQuestionAnswerStatusIndexQuestion(event.questionId)
}
async function removeWrongQuestionAnswerStatusIndexQuestion(questionId) {
  let answerStatus = await db.collection('UserAnswerStatus').where({
    "questionId": questionId,
    "studyUserId": wxContext.OPENID
  }).update({
    data: {
      "isWrongQuestion": false,
    },
  })
  return answerStatus;
}