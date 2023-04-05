const express = require("express");
const app = express();
const port = process.env.PORT || 3000;
const fs = require('fs')
app.use(express.static("../framework/templates"));

app.get("/health", (req, res, next) => {
  res.json({
    status: "OK",
  });
});

app.get("/templates/workflows", (req, res, next) => {
    fs.readFile('../framework/templates/workflows.json', 'utf8', (err, data) => {
        res.end(data);
    });
});

app.get("/templates/collections", (req, res, next) => {
    fs.readFile('../framework/templates/collections.json', 'utf8', (err, data) => {
        res.end(data);
    });
});

app.get("/templates/categories", (req, res, next) => {
    fs.readFile('../framework/templates/categories.json', 'utf8', (err, data) => {
        res.end(data);
    });
});

//    GET	/templates/workflows/<id>
//    GET	/templates/workflows
//    GET	/templates/collections/<id>
//    GET	/templates/collections
//    GET	/templates/categories

app.listen(port, () => {
  console.log(
    `Custom N8N template server listening at http://localhost:${port}`
  );
});
