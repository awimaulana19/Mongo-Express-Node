const express = require("express");
const expressLayouts = require("express-ejs-layouts");
const { validationResult, check } = require("express-validator");
const session = require("express-session");
const cookieParser = require("cookie-parser");
const flash = require("connect-flash");
const methodOverride = require("method-override");

require("./utils/db");
const Mahasiswa = require("./model/mahasiswa");

const app = express();
const port = 3000;

app.set("view engine", "ejs");
app.use(expressLayouts);

app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));

// konfigurasi flash
app.use(cookieParser("secret"));
app.use(
  session({
    cookie: { maxAge: 6000 },
    secret: "secret",
    resave: true,
    saveUninitialized: true,
  })
);
app.use(flash());

app.use(methodOverride("_method"));

app.get("/", (req, res) => {
  const mahasiswa = [
    {
      nama: "Awi",
      kelas: "A",
    },
    {
      nama: "Muiz",
      kelas: "A",
    },
  ];

  res.render("index", {
    layout: "layouts/main",
    title: "Home",
    mahasiswa,
  });
});

app.get("/profile", (req, res) => {
  res.render("profile", {
    layout: "layouts/main",
    title: "Profile",
  });
});

app.get("/mahasiswa", async (req, res) => {
  const mahasiswa = await Mahasiswa.find();

  res.render("mahasiswa", {
    layout: "layouts/main",
    title: "Mahasiswa",
    mahasiswa,
    msg: req.flash("msg"),
  });
});

app.get("/mahasiswa/tambah", (req, res) => {
  res.render("tambah", {
    layout: "layouts/main",
    title: "Tambah Mahasiswa",
  });
});

app.post(
  "/mahasiswa",
  [
    check("nama", "Nama Tidak Boleh Kosong").notEmpty(),
    check("nim", "NIM Tidak Boleh Kosong")
      .notEmpty()
      .custom(async (value) => {
        const mahasiswa = await Mahasiswa.findOne({ nim: value });
        if (mahasiswa) {
          throw new Error("NIM Sudah Ada");
        }
      }),
    check("kelas", "Kelas Tidak Boleh Kosong").notEmpty(),
  ],
  (req, res) => {
    const result = validationResult(req);
    if (!result.isEmpty()) {
      res.render("tambah", {
        layout: "layouts/main",
        title: "Tambah Mahasiswa",
        errors: result.array(),
      });
    } else {
      Mahasiswa.insertMany(req.body);
      req.flash("msg", "Data Mahasiswa Berhasil Ditambahkan");
      res.redirect("/mahasiswa");
    }
  }
);

app.get("/mahasiswa/edit/:nim", async (req, res) => {
  const mahasiswa = await Mahasiswa.findOne({ nim: req.params.nim });

  if (!mahasiswa) {
    res.status(404);
    res.send("404 Not Found");
  } else {
    res.render("edit", {
      layout: "layouts/main",
      title: "Edit Mahasiswa",
      mahasiswa,
    });
  }
});

app.put(
  "/mahasiswa",
  [
    check("nama", "Nama Tidak Boleh Kosong").notEmpty(),
    check("nim", "NIM Tidak Boleh Kosong")
      .notEmpty()
      .custom(async (value, { req }) => {
        const mahasiswa = await Mahasiswa.findOne({ nim: value });
        if (mahasiswa && value !== req.body.oldNim) {
          throw new Error("NIM Sudah Ada");
        }
      }),
    check("kelas", "Kelas Tidak Boleh Kosong").notEmpty(),
  ],
  (req, res) => {
    const result = validationResult(req);
    if (!result.isEmpty()) {
      res.render("edit", {
        layout: "layouts/main",
        title: "Edit Mahasiswa",
        mahasiswa: req.body,
        errors: result.array(),
      });
    } else {
      Mahasiswa.updateOne(
        { _id: req.body._id },
        {
          $set: {
            nama: req.body.nama,
            nim: req.body.nim,
            kelas: req.body.kelas,
          },
        }
      ).then((result) => {
        req.flash("msg", "Data Mahasiswa Berhasil Diedit");
        res.redirect("/mahasiswa");
      });
    }
  }
);

app.delete("/mahasiswa", async (req, res) => {
  const mahasiswa = await Mahasiswa.findOne({ nim: req.body.nim });

  Mahasiswa.deleteOne({ _id: mahasiswa._id }).then((result) => {
    req.flash("msg", "Data Mahasiswa Berhasil Dihapus");
    res.redirect("/mahasiswa");
  });
});

app.get("/mahasiswa/:nim", async (req, res) => {
  const mahasiswa = await Mahasiswa.findOne({ nim: req.params.nim });

  res.render("detail", {
    layout: "layouts/main",
    title: "Detail Mahasiswa",
    mahasiswa,
  });
});

app.use((req, res) => {
  res.status(404);
  res.send("404 Not Found");
});

app.listen(port, () =>
  console.log(`App listening on port http://localhost:${port}`)
);
