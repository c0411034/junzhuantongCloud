function setAnswerStatus(questionId,answerStatus){  
  var as = wx.setStorageSync(questionId,answerStatus)
}
function colellctionQuestion(questionId,answerStatus){  
  //收藏夹操作
  var collection=wx.getStorageSync('QUESTION_COLLECTION');
  collection.forEach(function(value,index,array){

    if (element==questionId){
      //已经在收藏夹里了，不收藏
      break;
    }
    collection.push(questionId)
    
    });
  var as = wx.setStorageSync(questionId,answerStatus)
}
module.exports = {
  setAnswerStatus: setAnswerStatus
}