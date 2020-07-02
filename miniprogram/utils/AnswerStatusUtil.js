function save(titleId,answerStatusDict){
    wx.setStorageSync('answerStatus'+titleId, answerStatusDict)
}
function remove(titleId){
  wx.removeStorageSync('answerStatus'+titleId);
}

function get(titleId){  
  return wx.getStorageSync('answerStatus'+titleId);
}

module.exports = {
  remove: remove,
  save: save,
  get: get
}