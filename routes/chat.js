const { Db } = require("mongodb");

const router = require("koa-router")();

router.prefix("/api/chat");

router.post("/addFriend", async (ctx) => {
  const { account, friendAccount } = await ctx.request.body;
  console.log({ account, friendAccount });
  const friendInfo = await DB.findOne("user", {
    account: friendAccount,
  });
  if (friendInfo === null) {
    ctx.body = {
      status: 0,
      err: "此账号不存在",
    };
  } else {
    const relation = await DB.findOne("relations", {
      account,
      friendAccount,
    });
    if (relation !== null) {
      ctx.body = {
        status: 0,
        err: "您已经添加过此好友了",
      };
    } else {
      const res = await DB.insert("relations", {
        account,
        friendAccount,
        friendNickName:friendInfo.nickName,
        friendProfile:friendInfo.profile
      });
      ctx.body = {
        status: 1,
        msg: "添加成功",
        data: res,
      };
    }
  }
});
router.get("/fetchFriends", async (ctx) => {
  const { account } = ctx.query;
  const friends = await DB.find("relations", {
    account,
  });
  ctx.body = {
    status: 1,
    msg: "成功获取好友列表",
    data: {
      friends,
    },
  };
}); // 数组为空可能会报错或者有什么bug，要测试

router.post("/creatRoom", async (ctx) => {
  const { roomName, profile } = await ctx.request.body;

  const res = DB.insert("rooms", {
    roomName,
    profile,
    roomNumber: Date.now(),
  });
  ctx.body = {
    status: 1,
    msg: "聊天群创建成功",
    data: res,
  };
});
router.post("/joinRoom", async (ctx) => {
  const { roomNumber, account } = ctx.query;
  const room = await DB.findOne("rooms", {
    roomNumber,
  });
  if (room === null) {
    ctx.body = {
      status: 0,
      err: "此群不存在",
    };
  } else {
    const act = await DB.findOne("roomRelations", {
      account,
      roomNumber,
    });
    if (act !== null) {
      ctx.body = {
        status: 0,
        err: "您已经在群内了",
      };
    } else {
      const res = DB.insert("roomRelations", {
        account,
        roomNumber,
      });
      ctx.body = {
        status: 1,
        msg: "入群成功",
        data: res,
      };
    }
  }
});
// localhost:3030/api/chat/fetchUserRooms?account=admin1
router.get("/fetchUserRooms", async (ctx) => {
  const { account } = ctx.query;
  const rooms = DB.find("roomRelations", {
    account,
  });
  ctx.body = {
    status: 1,
    msg: "用户加入的群列表",
    data: {
      rooms: rooms,
    },
  };
});
router.get("/fetchRoomMembers", async (ctx) => {
  const { roomNumber } = ctx.query;
  const users = DB.find("roomRelations", {
    roomNumber,
  });
  ctx.body = {
    status: 1,
    msg: "加入群的用户列表",
    data: {
      users,
    },
  };
});

// 成功的返回和错误的返回最好封装成函数，记得改！！  还是不改了，感觉改了更丑了，但是不容易失误打错，各有利弊

module.exports = router;
