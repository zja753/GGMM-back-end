async function addFriend(account, friendAccount, socket) {
  const friendInfo = await DB.findOne("user", {
    account: friendAccount,
  });
  if (friendInfo === null) {
    socket.emit("tips", `与用户：${friendAccount} 添加好友失败`);
  } else {
    const relation = await DB.findOne("relations", {
      account,
      friendAccount,
    });
    if (relation !== null) {
      socket.emit("tips", `与用户：${friendAccount} 已经是好友了`);
    } else {
      await DB.insert("relations", {
        account,
        friendAccount,
        friendNickName: friendInfo.nickName,
        friendProfile: friendInfo.profile,
        groupName: "我的好友",
      });
      socket.emit("tips", `已与用户：${friendAccount} 成为好友`);
    }
  }
}

module.exports = function (io, socket, users) {
  socket.on("addFriend", async function (data) {
    const { account, friendAccount, nickName } = data;
    const requested = await DB.findOne("request", { status: 1 });
    if (requested === null) {
      const addedfriend = await DB.findOne("relations", {
        account,
        friendAccount,
        status: 1,
      });

      if (addedfriend === null) {
        await DB.insert("request", {
          nickName,
          from: account,
          to: friendAccount,
          isGroup: false,
        });
        socket.emit("tips", "成功发送好友申请");
      } else {
        socket.emit("tips", "你们已经是好友了，不用重复添加");
      }
    } else {
      socket.emit("tips", "已经发送过请求了");
    }
    if (users[friendAccount] !== null) {
      // 如果没有登录也没有关系，在登陆的时候也是要查询一下 request 的
      const requestList = await DB.find("request", {
        to: friendAccount,
        status: 1,
      });
      socket.to(users[friendAccount]).emit("updata-request", requestList);
      socket
        .to(users[friendAccount])
        .emit("tips", `收到用户:${account} 的好友请求`);
    }
  });
  socket.on("agreeFriendRequest", async function (request) {
    // 是在被请求的用户那里同意的好友请求  所以 to 是触发这个函数的主体
    const { from, to } = request;
    addFriend(to, from, socket, socket);
    addFriend(from, to, socket, socket.to(users[from]));
    await DB.update("request", { from, to, status: 1 }, { status: 0 });
    if (users[from]) {
      const friendList = await DB.find("relations", {
        account: from,
        status: 1,
      });
      socket.to(users[from]).emit("updata-friend", friendList);
    }
    const requestList = await DB.find("request", { to: to, status: 1 });
    socket.emit("updata-request", requestList);
    const friendList = await DB.find("relations", { account: to, status: 1 });
    socket.emit("updata-friend", friendList);
  });
  socket.on("rejectFriendRequest", async function (request) {
    const { from, to } = request;
    await DB.update("request", { from, to, status: 1 }, { status: 0 });
    socket.emit("tips", "已拒绝好友申请");
  });
};
