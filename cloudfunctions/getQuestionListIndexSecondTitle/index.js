// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()
const db = cloud.database({
  env: "self-stydy-spirit-tyb9d"
})

// 云函数入口函数
exports.main = async (event, context) => {
  let quesionListCount = await getQuesionListCountIndexSecondTitleId(event.secondTitleId);
  quesionListCount = quesionListCount.total;
  let quesionList=[]
  for (let i = 0; i < quesionListCount; i += 100) {
    quesionList = quesionList.concat(await getQuesionListIndexSecondTitleId(event.secondTitleId, i));
  }
  return quesionList;
}

async function getQuesionListIndexSecondTitleId(secondTitleId,skip) {
  let quesionList = await db.collection('Questions').where({
    "titleSecond": secondTitleId
  }).orderBy('createTime', 'asc').skip(skip).get();
  return quesionList.data;
}
async function getQuesionListCountIndexSecondTitleId(secondTitleId) {
  let count = await db.collection('Questions').where({
    "titleSecond": secondTitleId
  }).count();
  return count;
}