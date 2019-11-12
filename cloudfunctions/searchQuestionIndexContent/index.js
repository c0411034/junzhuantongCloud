// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()
const db = cloud.database({
  env: "self-stydy-spirit-tyb9d"
})

// 云函数入口函数
exports.main = async (event, context) => {
  return await getQuesionIndexContent(event.content)
  
}
async function getQuesionIndexContent(content) {
  let quesionList = await db.collection('Questions').where({
    content: db.RegExp({
      regexp: '.*' + content + '.*',
      options: 'i',
    })
  }).get()

  return quesionList.data;
}