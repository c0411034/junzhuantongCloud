// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()

const db = cloud.database({
  env: "self-stydy-spirit-tyb9d"
})
// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  let accessToken = db.collection('wxConfig').where({
    name: "AccessToken"
  }).get();
  accessToken = accessToken.data[0].value
  return accessToken;
}