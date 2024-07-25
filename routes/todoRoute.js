const express = require('express');
const router = express.Router();
const verifyToken = require("../middlewares/authentication");
const { testRouter, getAllTodos, createTodo, updateTodo, deleteTodo, getReminder } = require('../controllers/todoController');

router.get('/', verifyToken, testRouter)
router.get('/get',verifyToken, getAllTodos)
router.post('/post', verifyToken,createTodo)
router.put('/update',verifyToken, updateTodo)
router.delete('/delete',verifyToken, deleteTodo)
router.get('/reminder',verifyToken, getReminder);

module.exports = router;