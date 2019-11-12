// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()
const db = cloud.database({
  env: "self-stydy-spirit-tyb9d"
})

// 云函数入口函数
exports.main = async (event, context) => {

  return getQuesionOptions(event.questionId)
}

async function getQuesionOptions(questionId) {
  let quesionList = await db.collection('Options').where({
    "questionId": questionId
  }).get();
  return quesionList.data;
}