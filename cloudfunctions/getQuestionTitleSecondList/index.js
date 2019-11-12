// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()
const db = cloud.database({
  env: "self-stydy-spirit-tyb9d"
})

// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  return getQuesionTitleSecondList();
}
 
async function getQuesionTitleSecondList() {
  let questionTitleSecondList = await db.collection('QuestionTitleSecond').orderBy('order', 'asc').get();
  return  questionTitleSecondList ; 
}
