const express = require("express");
const fs = require("fs").promises;
const path = require("path");
const { nanoid } = require("nanoid");
const yup = require("yup");

const router = express.Router();
const contactsPath = path.resolve(__dirname, "../../db/contacts.json");

function schemaValidate(schema) {
  return async (req, res, next) => {
    try {
      await schema.validate(req.body, { abortEarly: false });
      next();
    } catch (error) {
      console.log(error);
      res.status(422).json(error);
    }
  };
}

// GET - /api/contacts
router.get("/", async (req, res) => {
  try {
    let contacts = await fs.readFile(contactsPath);
    contacts = JSON.parse(contacts);
    res.json(contacts);
  } catch (error) {
    console.log(error);
    res.status(500).send(error);
  }
});

// GET - /api/contacts/:contactsId
router.get("/:contactId", async (req, res) => {
  try {
    let contacts = await fs.readFile(contactsPath);
    contacts = JSON.parse(contacts);

    const targetContact = contacts.find(
      (contact) => contact.id === req.params.contactId
    );
    if (!targetContact) {
      res.status(404).json({
        message: "Not found",
      });
      return;
    }

    res.json(targetContact);
  } catch (error) {
    console.log(error);
    res.status(500).send(error);
  }
});

const createSchema = yup.object().shape({
  name: yup.string().required(),
  email: yup.string().email().required(),
  phone: yup.string().min(10).required(),
});

// POST - api/contacts
router.post("/", schemaValidate(createSchema), async (req, res) => {
  try {
    let contacts = await fs.readFile(contactsPath);
    contacts = JSON.parse(contacts);

    const newContact = {
      id: nanoid(),
      ...req.body,
    };

    contacts.push(newContact);

    await fs.writeFile(contactsPath, JSON.stringify(contacts));

    res.json(newContact);
  } catch (error) {
    console.log(error);
    res.status(500).send(error);
  }
});

// DELETE - DELETE api/contacts/:contactId
router.delete("/:contactId", async (req, res) => {
  try {
    let contacts = await fs.readFile(contactsPath);
    contacts = JSON.parse(contacts);

    const contact = contacts.find(
      (contact) => contact.id === req.params.contactId
    );

    if (contact) {
      contacts = contacts.filter(
        (contact) => contact.id !== req.params.contactId
      );
      await fs.writeFile(contactsPath, JSON.stringify(contacts));
      res.status(200).json({
        message: "User deleted",
      });
      return;
    } else {
      res.status(404).json({
        message: "Not found",
      });
      return;
    }

  } catch (error) {
    res.status(500).send(error);
  }
});

// PUT - /api/contacts/:contactId
router.put("/:contactId", schemaValidate(createSchema), async (req, res) => {
  try {
    let contacts = await fs.readFile(contactsPath);
    contacts = JSON.parse(contacts);

    let updatedContact = contacts.find(
      (contact) => contact.id === req.params.contactId
    );

    if (updatedContact) {
      contacts = contacts.map(
        (contact) => 
          contact.id === req.params.contactId ? {...contact, ...req.body} : contact
      );
      updatedContact = {...updatedContact, ...req.body};
      await fs.writeFile(contactsPath, JSON.stringify(contacts));
      res.status(200).json(
        updatedContact
      );
    } else {
      res.status(404).json({
        message: "Not found",
      });
    }
  } catch (error) {
    console.log(error);
    res.status(500).send(error);
  }
});

module.exports = router;
