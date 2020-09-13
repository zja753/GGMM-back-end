module.exports = function (io, socket, users) {
  socket.on("joinRoom", function (room) {
    socket.join(room);
  });
  // 群操作先放一边

  socket.on("sendMessage", async function (data) {
    const {
      fromName = "",
      from = "",
      toName = "",
      to = "",
      content = "",
      isGroup = null,
    } = data;
    if (content !== "") {
      await DB.insert("message", {
        fromName,
        from,
        toName,
        to,
        content,
        isGroup,
      });
      if (!isGroup) {
        console.log('ssssssssssssssssssssssssssssssss?');
        console.log(users);
        console.log(data);
        if (users[data.to])
          socket.to(users[data.to]).emit("receiveMessage", data);
      } else {
        // io.emit("messageFromAll", data.message).to(data.room); // 发给所有人
        // 遍历群成员，然后做相同操作   应该可以直接发给一整个房间的，到时候看
      }
    }
  });
};
