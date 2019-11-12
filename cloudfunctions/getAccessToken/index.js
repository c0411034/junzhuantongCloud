/**
 * 全自动获取accessToken
 * 当数据库中accessToken未过期，从数据库中获取
 * 若数据库中accessToken已过期，则从微信服务器中获取，并更新数据库中的accessToken和有效时间
 */

// 云函数入口文件
const cloud = require('wx-server-sdk')
const got = require('got'); //引用 got
cloud.init()
const db = cloud.database({
  env:"self-stydy-spirit-tyb9d"
})
const wxConfigCollection = db.collection('wxConfig')
// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  if( await isAccessTokenTimeTimeout()){
    let newAccessToken = await getNewAccessToken();
    await saveAccessTokenAndTime(newAccessToken);
    return newAccessToken.access_token;
  }else{
    return getAccessTokenInDB();
  } 
}


//获取数据库中accessToken的有效时间
async function getAccessTokenTime() {
  let accessTokenTime = await wxConfigCollection.where({
    name: "accessTokenTime"
  }).get();
  accessTokenTime = accessTokenTime.data[0].value
  return accessTokenTime;
}
//数据库中accessToken是否过期
async function isAccessTokenTimeTimeout() {
  let accessTokenTime =await getAccessTokenTime();
  let d = new Date();
  if (accessTokenTime > d) {
    //说明access未过期
    return false;
  } else {
    //说明access过期
    return true;
  }
}

//获取数据库中accessToken
async function getAccessTokenInDB() {
  let accessToken = await wxConfigCollection.where({
    name: "AccessToken"
  }).get();
  accessToken = accessToken.data[0].value
  return accessToken;
}
//重新获取accessToken
async function getNewAccessToken() {
  let url = "https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=wx5adfd8ceb63858f4&secret=862345c7dc0ed131efe7b4e773d67ff0"
  let getResponse = await got(url) //get请求
  let responseJson = JSON.parse(getResponse.body);
  return responseJson;
}


async function saveAccessTokenAndTime(newAccessToken) {
  let accessTokenContent = newAccessToken.access_token
  let accessTokenDelay = newAccessToken.expires_in
  await saveAccessToken(accessTokenContent);
  await addAccessTokenTime(accessTokenDelay);
}
async function saveAccessToken(accessToken) {
  await wxConfigCollection.where({
    name: "AccessToken"
  }).update({
    data:{
      value: accessToken
    }
  })
}

//增加accessTokenTime从现在开始的有效时长
async function addAccessTokenTime(timeDelay) {
  let accessTokenTime = await getAccessTokenTime();
  timeDelay=parseInt(timeDelay)-10;//减少10秒已消除获取access Token时的误差
  let nowTime=new Date();
  nowTime.setSeconds(nowTime.getSeconds() + timeDelay)
  accessTokenTime = nowTime
  await saveAccessTokenTime(accessTokenTime);
  return accessTokenTime;
}

async function saveAccessTokenTime(accessTokenTime) {
  await wxConfigCollection.where({
    name: "accessTokenTime"
  }).update({
    data: {
      value: accessTokenTime
    }
  })
}