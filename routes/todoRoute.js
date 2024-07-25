const express = require('express');
const router = express.Router();
const verifyToken = require("../middlewares/authentication");
const { testRouter, getAllTodos, createTodo, updateTodo, deleteTodo, getReminder } = require('../controllers/todoController');

module.exports = router;