const express = require("express");
const volleyball = require("volleyball");
const cors = require("cors");

const contacts = require("./routes/contacts");

const app = express();

app.use(volleyball);
app.use(
  cors({
    origin: "*",
  })
);
app.use(express.json());

function schemaValidate(schema) {
  return async (req, res, next) => {
    try {
      await schema.validate(req.body, { abortEarly: false });
      next();
    } catch (error) {
      console.log(error);
      res.status(422).json(error);
    }
  }
};

app.use('/api/contacts', contacts);


app.get("/api/contacts/:contactId", (req, res) => {
  req.send(`/contacts ID = ${req.params.contactId}`);
});

module.exports = app;
