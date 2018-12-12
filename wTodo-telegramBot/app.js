const TelegramBot = require('node-telegram-bot-api');
const express = require('express');
const app = express();
const mongoose = require('mongoose');

const token = '754649216:AAHMvTLLoeGUqhvDDUZVadglkHwDRu8S2rY';
const db = require('./config/keys').mongoURI;

const User = require('./models/User');

const bot = new TelegramBot(token, {polling: true});

//Connect to mongoDB
mongoose
	.connect(db)
	.then(() => console.log(MongoDB connected.))
	.catch(err => console.log(err));

// Start command
bot.onText(/\/start/, msg=> {
	const chatId = msg.chat.id;
	bot.sendMessage(chatId, 'Hi :) ');
});


// Todo command
bot.onText(/\/todo/, msg => {
  let todo = msg.text.split(' ').slice(1).join(' ');

 	//no item passed in
	if(!todo){
 		return bot.sendMessage(msg.chat.id, "You should give your todo item after /todo.");
 	}

 	User.findOne({user: msg.chat.username})
 		.then(user => {
 			if(!user){
 				//create new user
 				const newUser = new User({
 					users: msg.chat.username, 
 					todos: [todo]
 				})

 				//save newUser to mongoDB
 				newUser
 					.save()
 					.then(console.log('New User Saved.'))
 					.catch(err => console.log(err));
 			}else {
 				//add new todo to mongoDB
 				user.todos.push(todo);
 				User.update({ user: user.user }, { $set: {todos: user.todos} }, (err , raw) => {
 					if(err) return console.log(err);
 					console.log('Success Added New Todo.');
 				});
 			}
 		})

 		bot.sendMessage(msg.chat.id, 'You sucess added a TODO.');
});


// List command
bot.onText(/\/list/, msg => {
	User.findOne({ user: msg.chat.username})
		.then(user => {
			if(!user){
				return bot.sendMessage(msg.chat.id, 'You haven\'t added a todo');
			}else {
				if(users.todos.length === 0) 
					return bot.sendMessage(msg.chat.id, '*You already done all your todos.*', {parse_mode: "Markdown"});
				
				//list user's todos
				let todoList = '';
				user.todos.forEach((todo, index) => {
					todoList += `[${index}] - ` + todo + "\n";
				})
				return bot.sendMessage(msg.chat.id, `*Your Todo List:\n\n*${todolist}`, {parse_mode: "Markdown"});
			}
		})	
});

// check command
bot.onText(/\/check/, msg => {
	User.findOne({ user: msg.chat.username})
		.then(user => {
			if(!user){
				return bot.sendMessage(msg.chat.id, 'You haven\'t added a todo');
			}else {
				if(users.todos.length === 0) 
					return bot.sendMessage(msg.chat.id, '*You already done all your todos.*', {parse_mode: "Markdown"});
		
				let num = msg.text.split(' ')[1];

				//no num passed in
				if(!num){
					return bot.sendMessage(msg.chat.id, 'You should give me the to do number.');
				};

				//Wrong number
				if(num >= user.todos.length){
					return bot.sendMessage(msg.chat.id, 'You should give me the right number.');
				}

				//remove todo
				user.todos.splice(num, 1);
				user.update({ user: user.user}, {set: {todos: user.todos}}, (err, raw) => {
					if(err) return console.log(err);
					bot.sendMessage(msg.chat.id, "DONE.");
				});
		}
	});	
});


const port = process.env.PORT;

app.get('/', (req, res) => {
	res.send('Telegram wTodo Bot.');
})

app.listen(port);

