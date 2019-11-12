/**
 * 增加登陆记录
 */
// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()
const db = cloud.database({
  env: "self-stydy-spirit-tyb9d"
})

// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()

  // return wxContext.OPENID
  return await updateLastLoginTime(wxContext.OPENID)
}
async function updateLastLoginTime(openId) {
  return await db.collection('StudyUser').where({
      openId: openId
    }).update({
      data: {
        lastLoginTime: new Date()
      }
    })
}