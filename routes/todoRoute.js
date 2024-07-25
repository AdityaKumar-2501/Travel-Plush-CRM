const express = require('express');
const router = express.Router();

const { testRouter, getAllTodos, createTodo, updateTodo, deleteTodo, getReminder } = require('../controllers/todoController');

router.get('/', testRouter)
router.get('/get', getAllTodos)
router.post('/post', createTodo)
router.put('/update', updateTodo)
router.delete('/delete', deleteTodo)
router.get('/reminder', getReminder);

module.exports = router;