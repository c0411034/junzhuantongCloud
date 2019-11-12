// 云函数入口文件
const cloud = require('wx-server-sdk')
cloud.init()
const db = cloud.database({
  env: "self-stydy-spirit-tyb9d"
})
// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  let { OPENID, APPID, UNIONID } = cloud.getWXContext()
  return isOpenIdInDB(wxContext.OPENID)
  // return wxContext.OPENID
}

//获取数据库中accessToken的有效时间
async function isOpenIdInDB(openId) {
  // try {
    let users = await db.collection('StudyUser').where({openId:openId}).get();
  if (users.data.length>0){
    return true
  }else{
    return false 
  }
}