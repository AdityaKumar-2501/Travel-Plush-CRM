const currentDateTime = require('../functions/currentDateTime');
const Todo = require('../models/todo');
const mongoose = require('mongoose');
const Lead = require('../models/lead');

const testRouter = (req, res)=> {
    try {
        return res.status(200).send('lead routes is working!');
    } catch (error) {
        console.error('Error:', error);
        return res.status(500).send(`Internal server error ${error.message}`);
    }
}

async function getAllTodos(req, res) {
    const page = req.query.page - 1 || 0; // subtracted 1 so that first 3 will not skip
	const pageSize = 10;
	const skip = page * pageSize;

    if(page < 0)  return res.status(400).send("Invalid page number")

    try {
        const {_id, profile } = req.foundUser;

        let todos;

        todos = await Todo.aggregate([
            {
                $match : { createdBy : new mongoose.Types.ObjectId(_id) }
            },
            { $skip: skip },
            { $limit: pageSize }
        ])
        

        const totaltodos = todos.length;
		const totalPages = Math.ceil(totaltodos / pageSize);

		if (!todos.length) return res.status(404).send("No todo found");
		return res.status(200).json({
			message: "Pagination search successfully!",
			data: todos,
			totaltodos,
			currentPage: page+1,
			totalPages
		});
    } catch (error) {
        console.log('error:', error);
        return res.status(500).send(`Internal Server Error: ${error.message}`);
    }
}

async function createTodo(req, res) {
    try {
        const { subject, reminderDate, completed, leadId } = req.body;
        const {_id} = req.foundUser;   // get the information of the logged in user from the auth middleware

        const createdBy = _id;

        const lead = await Lead.findOne( {_id : leadId} );

        if(!lead) return res.status(404).send("No lead found");

        const newTodo = await Todo.create({
            subject,
            reminderDate,
            completed,
            createdBy : createdBy,
            name : lead.name,
            mobile : lead.mobile,
            leadStatus : lead.leadStatus,
            travelDate: lead.travelStartDate,
            destination : lead.destination,
        });
        return res.status(200).json({msg : 'Todo created successfully', data: newTodo})
    } catch (error) {
        console.log('error:', error);
        return res.status(500).send('Internal server error: '+ error.message);
    }
}


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
        return res.status(500).send(`Internal Server Error: ${error.message}`);
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
        return res.status(500).send(`Internal Server Error: ${error.message}`);
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
        return res.status(500).send(`Internal Server Error: ${error.message}`);
    }
    
}

module.exports = {testRouter , getAllTodos , createTodo , updateTodo , deleteTodo, getReminder}