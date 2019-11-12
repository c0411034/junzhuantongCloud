// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()
const db = cloud.database({
  env: "self-stydy-spirit-tyb9d"
})
let wxContext;
const _ = db.command;
// 云函数入口函数
exports.main = async (event, context) => {
  wxContext = cloud.getWXContext()
  let result= await cloud.callFunction({
    // 要调用的云函数名称
    name: 'getQuestionListIndexSecondTitle',
    data:{
      secondTitleId: event.secondTitleId
    }
  })
  let questionList = result.result
  let questionListLength = questionList.length
  let deleteNum=0
  let questionIdList=[]
  for (var i = 0; i < questionListLength;i++){
    questionIdList.push(questionList[i]._id)
  }

  deleteNum = await removeAnswerStatus(questionIdList)
  return deleteNum;

}
async function removeAnswerStatus(questionIdList) {
  let res = await db.collection('UserAnswerStatus').where({
    "questionId": _.in(questionIdList),
    "studyUserId": wxContext.OPENID
  }).update({
    data: {
      "lastAnswer": "",
      "lastAnswerStatus": null,
      "correctCount": 0,
      "mistakeCount":0,
    },
  });
  return res
}