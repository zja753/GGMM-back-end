const usersDic = {};
module.exports = function (io, socket, users) {
  console.log("有一个用户登录了");
  socket.on("login", async function (account) {
    users[account] = socket.id;
    usersDic[socket.id] = account;
    console.log("socket.io  login 方法触发 ， account：", account);
    // !!!!!!!  登录以后应该把账号绑定 socket.id 存入 users
  });
  socket.on("updataMessage", async function (account) {
    messageList = await DB.find("message", { to: account, status: 1 });
    console.log("updataMessage", messageList);
    socket.emit("updata-message", messageList);
  });
  socket.on("updataRequest", async function (account) {
    requestList = await DB.find("request", { to: account, status: 1 });
    console.log("updataRequest", requestList);
    socket.emit("updata-request", requestList);
  });

  //监听客户端断开连接
  socket.on("disconnect", function () {
    delete users[usersDic[socket.id]];
    delete usersDic[socket.id];
    console.log("有一个用户下线了");
  });
};
