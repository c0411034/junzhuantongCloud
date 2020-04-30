// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()

const db = cloud.database({
  env: "self-stydy-spirit-tyb9d"
})
const wxContext = cloud.getWXContext();
// 云函数入口函数
exports.main = async (event, context) => {
  // wxContext = cloud.getWXContext()
  // let quesionList = await getQuesionListIndexSecondTitleId(event.secondTitleId, event.skip)
  let arrays=[];
  for(let i=0;i<20;i++){
    let answerStatus =await getAnswerStatusIndexQuestionAndUser("13dba11c5d2bd57f07b2e6d9377410b3")
    arrays.push(answerStatus)
  }
  
  
  return arrays;
}

async function getQuesionListIndexSecondTitleId(secondTitleId, skip) {
  let quesionList = await db.collection('Questions').where({
    "titleSecond": secondTitleId
  }).orderBy('createTime', 'asc').skip(skip).get();
  return quesionList.data;
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