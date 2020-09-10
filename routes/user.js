const router = require("koa-router")();
const bcrypt = require("bcrypt-nodejs");
const jwt = require("jsonwebtoken"); // 创建和解析token

router.prefix("/api/user");

router.post("/register", async (ctx) => {
  const { account, password, email, nickName } = await ctx.request.body;
  console.log({ account, password, email, nickName });
  if (account.length >= 6 && password.length >= 6) {
    const user = await DB.findOne("user", {
      account,
    });
    if (user === null) {
      const hashPassword = bcrypt.hashSync(password);
      const res = await DB.insert("user", {
        account,
        password: hashPassword,
        email,
        nickName,
      });
      ctx.body = {
        status: 1,
        err: "账号注册成功",
      };
    } else {
      ctx.body = {
        status: 0,
        err: "账号已存在",
      };
    }
  }
});

router.get("/login", async (ctx) => {
  const { account, password } = ctx.query;
  console.log(ctx.query);
  console.log({ account, password });
  const user = await DB.findOne("user", {
    account,
  });
  if (user === null) ctx.body = { status: 0, err: "账号不存在" };
  else {
    const confirmRes = bcrypt.compareSync(password, user.password);
    if (confirmRes) {
      console.log(user);
      const token = jwt.sign(
        { _id: user._id, username: user.username },
        "secret",
        { expiresIn: 36000 } // token有效时间 3600 是一小时
      );
      // const receive = {};
      // receive.message = await DB.find("message", { to: account, status: 1 });
      // receive.request = await DB.find("request", { to: account, status: 1 });
      // 这个还是写在socket里面比较好
      ctx.body = {
        data: {
          token: `Bearer ${token}`,
          user_id: user._id,
          account,
          // receive,
        },
        msg: "验证成功",
        status: 1,
      };
    } else ctx.body = { status: 0, err: "密码错误" };
  }
});

router.get("/getUserInfo", async (ctx) => {
  const { account } = ctx.query;
  console.log(ctx.query);
  const user = await DB.findOne("user", {
    account,
  });
  if (user === null) ctx.body = { status: 0, err: "账号不存在" };
  else {
    ctx.body = {
      data: {
        nickName: user.nickName,
        account: user.account,
        email: user.email,
      },
      status: 1,
      msg: "请求成功",
    };
  }
});

module.exports = router;
