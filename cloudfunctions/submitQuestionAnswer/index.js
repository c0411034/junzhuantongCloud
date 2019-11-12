/**提交为题答案 */
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
  // return answerStatus
  if(answerStatus!=false){
    let mistakeCount = answerStatus.mistakeCount;
    let correctCount = answerStatus.correctCount;
    if (event.isCorrect) {
      correctCount++
    } else {
      mistakeCount++
    }
    await updateAnswerStatusIndexQuestion(event.questionId, event.isCorrect, event.answer, mistakeCount, correctCount)
  }else{
    await addAnswerStatusIndexQuestion(event.questionId, event.isCorrect, event.answer)
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
async function updateAnswerStatusIndexQuestion(questionId, isCorrect, answer, mistakeCount,correctCount) {
  let answerStatus = await db.collection('UserAnswerStatus').where({
    "questionId": questionId,
    "studyUserId": wxContext.OPENID
  }).update({
    data: {
      "lastAnswerStatus": isCorrect,
      "lastAnswer": answer,
      "mistakeCount": mistakeCount,
      "correctCount": correctCount,      
      "isWrongQuestion": correctCount,      
    },
  })
  if(!isCorrect){
    //如果回答错误，加入错题集
    await db.collection('UserAnswerStatus').where({
      "questionId": questionId,
      "studyUserId": wxContext.OPENID
    }).update({
      data: {
        "isWrongQuestion": true,
      },
    })
  }
}
async function addAnswerStatusIndexQuestion(questionId, isCorrect,answer ) {
  let mistakeCount=0;
  let correctCount=0
  if(isCorrect){
    correctCount++
  }else{
    mistakeCount++
  }
  let answerStatus = {
    "lastAnswerStatus": isCorrect,
    "lastAnswer": answer,
    "mistakeCount": mistakeCount,
    "correctCount": correctCount,   
    "questionId": questionId,   
    "isQuestion": false,   
    "isCollection": false,   
    "studyUserId": wxContext.OPENID,
    "isWrongQuestion": !isCorrect
  }  
  await db.collection('UserAnswerStatus').add({
    data: answerStatus,
  })
}
