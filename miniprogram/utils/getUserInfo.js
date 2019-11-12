var getUserOpenId=function(openid){
  return new Promise((resolve, reject) => {
    wx.cloud.callFunction({
      name: 'getOpenId',
    }).then(res => {
      resolve(res);
    }).catch(e=>{
      reject("查询失败")
    })
  })

}
module.exports = {
  getUserOpenId: getUserOpenId
}

