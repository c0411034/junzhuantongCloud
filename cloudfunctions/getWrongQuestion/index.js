// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()
const db = cloud.database({
  env: "self-stydy-spirit-tyb9d"
})
let wxContext;

// 云函数入口函数
exports.main = async (event, context) => {
  let startDate = new Date().getTime()
  wxContext = cloud.getWXContext()

  let questionList = await getWrongQuestionStatus()
  let useDate = new Date().getTime() - startDate
  return {
    startDate: startDate,
    endDate: new Date().getTime(),
    useDate: useDate,
    questionList: questionList
  }
}
async function getWrongQuestionStatus() {
  let statusList = await db.collection('UserAnswerStatus').where({
    "studyUserId": wxContext.OPENID,
    "isWrongQuestion":true
  }).get();
  let questionList=[]
  for (let item of statusList.data ){
    questionList.push(await getQuestionIndexId(item.questionId) )
  }
  return questionList;
}

async function getQuestionIndexId(questionId) {
  let quesionList = await db.collection('Questions').where({
    "_id": wxContext.questionId
  }).get();
  return quesionList.data;
}