const currentDateTime = require('../functions/currentDateTime');
const Todo = require('../models/todo');

const testRouter = (req, res)=> {
    try {
        return res.status(200).send('lead routes is working!');
    } catch (error) {
        console.error('Error:', error);
        return res.status(500).send(`Internal server error ${error.message}`);
    }
}

async function getAllTodos(req, res) {
    try {
        const allTodos = await Todo.find();
        return res.status(200).send(allTodos);
    } catch (error) {
        console.log('error:', error);
        return res.status(500).send('Internal server error');
    }
}

async function createTodo(req, res) {
    try {
        const body = req.body;
        const newTodo = await Todo.create(body);
        return res.status(200).send('Todo created successfully');
    } catch (error) {
        console.log('error:', error);
        return res.status(500).send('Internal server error: '+ error.message);
    }
}

// only PUT mehtod is working not patch mehtod
async function updateTodo(req, res) {
    let body = req.body;
    let id = body.id;
    console.log("id " + id ,"body" + body);
    if(!id){
        return res.status(400).send("Please provide the Todo ID");
    }

    try {
        const updatedtodo = await Todo.findOneAndUpdate({ _id : id }, body, { new: true });

        if (!updatedtodo) {
            return res.status(400).send('Todo not updated');
        }

        return res.status(200).send('Data updated successfully');
    } catch (error) {
        console.error('Error:', error);
        return res.status(500).send(`Internal server error`);
    }
}

async function deleteTodo(req, res) {
    const id = req.body.id;
    try {
        if(!id){
            return res.status(400).send('Enter id of Todo to delete');
        }
        const foundTodo = await Todo.findOne({ _id: id });
        if (!foundTodo) return res.status(400).send('Todo not found!');
        const deletedTodo = await Todo.findByIdAndDelete(foundTodo.id);
        if (!deletedTodo) {
            return res.status(400).send('Todo not deleted!');
        }
        return res.status(200).send('Todo deleted successfully');
    } catch (error) {
        console.log('Error:', error);
        return res.status(500).send(`Internal Server Error`);
    }
}

async function getReminder(req,res){
    const today = new Date();
    const tomorrow = new Date();
    tomorrow.setDate(today.getDate() + 1);
    try{
        const todos = await Todo.find({
            reminderDate: {
                $gte: today.setHours(0, 0, 0, 0),
                $lt: tomorrow.setHours(0, 0, 0, 0)
            }
        });
        if(!todos.length) return res.status(404).send("No Todos");
        res.send(todos);
    }
    catch(e){
        console.log('Error:', error);
        return res.status(500).send(`Internal Server Error`);
    }
    
}

module.exports = {testRouter , getAllTodos , createTodo , updateTodo , deleteTodo, getReminder}