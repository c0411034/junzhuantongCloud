function save(titleId,answerStatusDict){
    wx.setStorageSync('answerStatus'+titleId, answerStatusDict)
}
function remove(titleId){
  wx.removeStorageSync('answerStatus'+titleId);
}

function get(titleId){  
  let result=wx.getStorageSync('answerStatus'+titleId);
  return result==""?{}:result
}

module.exports = {
  remove: remove,
  save: save,
  get: get
}