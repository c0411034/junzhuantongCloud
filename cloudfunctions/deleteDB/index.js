// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()
const db = cloud.database({
  env: "self-stydy-spirit-tyb9d"
})
const _ = db.command

// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  let indexDate = new Date("2019,8,16,8,00,00");
  let questionList =await getQuesionListIndexDate(indexDate) 
  // return questionList
  await deleteQuestionAndOption(questionList)
}
async function deleteQuestionAndOption(questionList){
  for (let item of questionList) {
    await deleteOptionIndexQuestion(item._id)
    await deleteQuestion(item._id)
  }

}
async function getQuesionListIndexDate(indexDate) {
  let quesionList = await db.collection('Questions').where({
    "createTime": _.gt(indexDate)
  }).get();
  return quesionList.data;
}

async function deleteOptionIndexQuestion(questionId) {
  let res = await db.collection('Options').where({
    "questionId": questionId
  }).remove();
  return res
}

async function deleteQuestion(questionId) {
  let res = await db.collection('Questions').where({
    "_id": questionId
  }).remove();
  return res
}