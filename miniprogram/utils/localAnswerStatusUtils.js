function setAnswerStatus(){
  try {
    var value = wx.getStorageSync('key')
    console.log("777")
    console.log(value)
    if (value) {
      console.log(value)
    }
  } catch (e) {
    // Do something when catch errorvalue
    console.log("666")
    console.log(e)
  }
}
module.exports = {
  setAnswerStatus: setAnswerStatus
}