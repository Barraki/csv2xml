const csv1 = require('csv-parser'),
  fs = require('fs'),
  express = require("express"),
  bodyParser = require("body-parser"),
  multer = require('multer'),
  csv = require('fast-csv'),
  app = express(),
  PORT = process.env.PORT || 5000;

const data = []

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json())
app.set("view engine", "ejs");
app.use(express.static(__dirname + '/public'));

const Storage = multer.diskStorage({
  destination: function (req, file, callback) {
    callback(null, "./data");
  },
  filename: function (req, file, callback) {
    if (fs.existsSync('./data/data.csv')) {
      fs.unlink('./data/data.csv', function (err) {
        if (err) throw err;
        // if no error, file has been deleted successfully
        console.log('File deleted!');
      });
    }
    callback(null, 'data.csv');
  }
});

const upload = multer({
  storage: Storage
}).array("csv", 1); //Field name and max count



const getDate = () => {
  const date = new Date();
  const year = date.getFullYear();
  const month = date.getMonth();
  const day = date.getDay();
  const time = date.getHours() + ':' + date.getMinutes();
  
  return `${year}-${month}-${day} ${time}`
}

app.get("/", function (req, res, next) {
  res.render("index");
});

app.post("/", function (req, res) {
  upload(req, res, function (err) {
    if (err) {
      return res.end("Something went wrong!");
    }
  });
  console.log('Rewrite')
  
  data.length=0;

  fs.createReadStream('./data/data.csv')
    .pipe(csv1())
    .on('data', (row) => {
      data.push(row);
      console.log(data)
    })
    .on('end', (row) => {
      console.log('CSV file successfully processed');
      res.redirect('/feed/');
    });
})


app.get("/feed/", function (req, res, next) {
  res.type('text/xml', "utf-8");
  res.render("feed", {
    data: data,
    date: getDate(),
  });
});


app.listen(PORT);

console.log(`Listen ${PORT}`)