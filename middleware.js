const fs = require("fs");
const path = require("path");

const users = JSON.parse(
  fs.readFileSync(path.join(__dirname, "data/users.json"))
);
module.exports = {
  checkUser: (req, res, next) => {
    const username = req.body.username;
    const password = req.body.password;

    const user = users.find((item) => item.userName === username);

    if (!username || !password) {
      req.error = "Login yoki parol yuborilmagan";
      next();
      return;
    }

    if (!user) {
      req.error = "Ushbu foydalanuvchi topilmadi!";
      next();
      return;
    }

    if (user.password !== password) {
      req.error = "Parol xato!";
      next();
      return;
    }
    req.session.user = user;
    req.session.ID = user.id;
    next();
  },
  checkLogin: (req, res, next) => {
    if (!req.session.authorized) {
      res.redirect("/login");
      return;
    }
    const user = users.find((item) => item.userName === req.session.userName);
    if (!user) {
      res.redirect("/login");
      return;
    }
    req.session.user;
    req.session.ID = user.id;
    next();
  },
};
