const express = require("express");
const { engine } = require("express-handlebars");
const session = require("express-session");
const fs = require("fs");
const path = require("path");
const { checkUser, checkLogin } = require("./middleware");

const users = JSON.parse(
  fs.readFileSync(path.join(__dirname, "data/users.json"))
);
const payments = JSON.parse(
  fs.readFileSync(path.join(__dirname, "data/payments.json"))
);
const groups = JSON.parse(
  fs.readFileSync(path.join(__dirname, "data/groups.json"))
);

const app = express();
app.engine(
  "hbs",
  engine({
    extname: "hbs",
  })
); // .hbs larni render qilish uchun

app.set("view engine", "hbs"); // .hbs yozmasa ham hbs ishlasin
app.use(
  session({
    secret: "123123",
    resave: false,
    saveUninitialized: true,
    cookie: {
      maxAge: 1000 * 60 * 60 * 24 * 7,
    },
  })
);

app.get("/login", (req, res) => {
  if (req.session.authorized) {
    res.redirect("/");
    return;
  }

  res.render("login", {
    title: "Kirish",
    layout: "login",
    error: req.session.error,
  });
  delete req.session.error;
});
app.get("/", checkLogin, (req, res) => {
  res.render("home", {
    fullName: `${req.session.user.fullName}`,
  });
});
app.get("/home", checkLogin, (req, res) => {
  res.render("home", {
    fullName: `${req.session.user.fullName}`,
  });
});

app.use(express.urlencoded({ extended: true }));
app.post("/login", checkUser, (req, res) => {
  if (req.error) {
    req.session.error = req.error;
    res.redirect("/login");
    return;
  }
  req.session.authorized = true;
  req.session.userName = req.body.username;
  res.redirect("/");
  return;
});

app.get("/logout", (req, res) => {
  if (req.session.authorized) {
    delete req.session.authorized;
    delete req.session.userName;
  }
  res.redirect("/login");
});

app.get("/groups", checkLogin, (req, res) => {
  res.render("groups", {
    groups: groups.filter((item) => item.id == req.session.ID),
    fullName: `${req.session.user.fullName}`,
    // helpers: {
    //   number(obj) {
    //     arr = obj.hash.arr;
    //     for (let index = 1; index < arr.length; index++) {
    //       index;
    //     }
    //   },
    // },
  });
});
app.get("/payments", checkLogin, (req, res) => {
  res.render("payments", {
    payments: payments.filter((item) => item.id == req.session.ID),
    fullName: `${req.session.user.fullName}`,
    helpers: {
      type(data) {
        let { type } = data.hash;
        if (type == "credit") {
          return "-";
        } else {
          return "+";
        }
      },
      date(data) {
        let { date } = data.hash;
        return new Date(date * 1000).toDateString();
      },
    },
  });
});

app.listen(5555, () => {
  console.log("Sayt http://localhost:5555 linkida ishga tushdi");
});
