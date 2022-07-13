const express = require("express");
const bcrypt = require("bcrypt");
const router = express();
const jwt = require("jsonwebtoken");
const Joi = require("joi");
const config = require("config");
const pool = require("../models/db");
const { getChief } = require("../models/chief");

const validate = function (req) {
    const {error, value} = Joi.object({
      id: Joi.number().integer().positive().required(),
      password: Joi.string().min(5).max(1024).required(),
    });
    return schema.validate(req);
};

router.post("/auth", async (req, res) => {
  const { error } = validate(req.body);
  if (error) {
    return res.status(400).send(error.details[0].message);
  }

  getChief(req.body.id, async (err, chief) => {
    if (err) return res.status(401).send(err);
    if (!chief.rowCount) return res.status(400).send("Invalid id or password.");

    chief = chief.rows[0];
    const validPassword = await bcrypt.compare(
      req.body.password,
      chief.password
    );
    if (!validPassword) return res.status(400).send("Invalid id or password.");

    const token = jwt.sign(
      {
        _id: chief.chief_id,
      },
      config.get("jwtPrivateKey")
    );

    return res.header("x-auth-token", token).send("You are authorised!");
  });
});

module.exports = router;