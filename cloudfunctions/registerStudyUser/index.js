// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()
const db = cloud.database({
  env: "self-stydy-spirit-tyb9d"
})

// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  if (await isOpenIdInDB(wxContext.OPENID)){
    return "注册失败 已注册过"
  }
  let studyUserInfo = event.studyUserInfo; 
  studyUserInfo.openId = wxContext.OPENID;
  studyUserInfo.registerTime=new Date()
  studyUserInfo.lastLoginTime=new Date()
  
  return "注册成功"+ await saveUser(studyUserInfo)
}
async function saveUser(studyUserInfo){
  try {
    return await db.collection('StudyUser').add({
      data: studyUserInfo
    })
  } catch (e) {
    return(e)
  }
}
//获取数据库中accessToken的有效时间
async function isOpenIdInDB(openId) {
  let users = await db.collection('StudyUser').where({openId: openId }).get();
  return users.data.length > 0
}