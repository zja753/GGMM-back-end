const DB = require("./db");
const initFunc = require("./socket/initFunc");
const requestFunc = require("./socket/requestFunc");
const messageFunc = require("./socket/messageFunc");

const users = {};
const socket = {
  getSocket: function (server) {
    const io = require("socket.io")(server);
    io.on("connection", (socket) => {
      //捕获客户端send信息
      //前端io.send(message)
      initFunc(io, socket, users); // 刚登录时做的所有操作 和 断线后的操作
      messageFunc(io, socket, users); // 消息发送和接受
      requestFunc(io, socket, users); // 添加好友等请求的发送和接受
    });

    // const qwq = io.of("/qwq")
    // qwq.on('connection',socket=>{
    //   socket.emit("sendByQwQ","这是QWQ命名空间发送来的消息，连接成功！")
    // })
  },
};
module.exports = socket;
