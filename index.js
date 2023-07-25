const fs = require('fs');
const path = require('path');
const express = require('express');
const app = express();
const Emmiter = require('events');
const emmiter = new Emmiter();
const PORT = process.env.PORT || 5000
const multer = require('multer');
const router = require('./router')
const checkMiddleware = require('./authorisationCheck')
const cookieParser = require('cookie-parser')
const jwt = require('jsonwebtoken')
const { secret } = require('./config')
const ws = require('ws')
const server = require('http').createServer(app)
const user = require('./models/userSchema')
const chatSchema = require("./models/ChatAppSchema")

const mongoose = require('mongoose');

const connection = new Map()

const wsServer = new ws.Server({ server: server })

function getKey(val) {
	return [...connection].find(([key, value]) => val === value)[0];
 }

wsServer.on("connection", (ws) => {
	

	connection.set(usernameId, ws)


	ws.on("message", (message) => {
		const parsedMessage = JSON.parse(message);
		
		console.log(parsedMessage);
		const { usernameId, message: content } = parsedMessage;
	 
		console.log(usernameId, "from message");
		console.log(content);
	 
		connection.forEach((client, id) => {
		  console.log(id, "from forEach");
		  if (client !== ws && usernameId === id) {
			 console.log(getKey(ws), "console log");
			 client.send(JSON.stringify({ "content": content, "currentClient": getKey(ws) }));
		  }
		});
	 });
	 

			 ws.on("close", function Close() {
				console.log('connection closed')
			 });
			 
})


const db = 'mongodb+srv://artem:qwerty321123@project.vfcmh8g.mongodb.net/'
mongoose.connect(db, { useNewUrlParser: true, useUnifiedTopology: true }).then(res => {
	console.log('mongo DB connected')
}).catch(err => {
	console.log(err)
})

app.set('views', './template')
app.set('view engine', 'ejs')
app.use(express.static('./template'))
app.use(express.urlencoded({ extended: true }))
app.use(cookieParser())

app.use('/auth', router)

const MulterConfig = multer.diskStorage({
	destination: (req, file, cb) => {
		cb(null, 'template/static/image')
	},
	filename: (req, file, cb) => {
		fl = (Math.random() + 1).toString(36).substring(20) + file.originalname;
		cb(null, fl)
	}
})

const upload = multer({ storage: MulterConfig })

const product = require('./models/models')

const jsonParse = express.json();
app.use(jsonParse)

app.get('/', async (request, response) => {
	const token = request.cookies.token
	if(token) {
		const data = jwt.verify(token, secret)
		jwt.verify(token, secret, (error, decode) => {
			if(error){
				response.render('index')
			} else {
				usernameId = data.username
				const savedMessage = chatSchema.find({ $or: [{ ownerId: usernameId }, { usernameId: usernameId }] }).then((res) => {
					const users = []
					res.forEach(elem => {
						if(elem.usernameId !== usernameId){
							users.push(elem.usernameId)
						} else if(elem.ownerId !== usernameId){
							users.push(elem.ownerId)
						}
					})
					const uniqueArr = [...new Set(users)]
					console.log(uniqueArr)
					const currentClient = null;
					response.render('chat', {
						username: data.username,
						chatHistory: uniqueArr,
						currentClient: currentClient
					})
				}).catch(e => {
					response.render('chat', {
					username: data.username,
					chatHistory: null
				})
				})
				
			}
		})
	} else {
		response.render('index')
	}
})

app.get('/login', (request, response) => {
	const token = request.cookies.token
	if(token) {
		jwt.verify(token, secret, (error, decode) => {
			if(error){
				response.render('login')
			} else {
				response.redirect("/")
			}
		})
	} else {
		response.render('login')
	}
})

app.get('/register', (request, response) => {
	const token = request.cookies.token
	if(token) {
		jwt.verify(token, secret, (error, decode) => {
			if(error){
				response.render('register')
			} else {
				response.redirect("/")
			}
		})
	} else {
		response.render('register')
	}
})

app.post("/checkUser", (request, response) => {
	const username = request.body.username
	const re = user.findOne({ username: username })
	re.then((user) => {
		if(!user){
			response.json({ "response": "user not found" })
		} else {
			const data = jwt.verify(request.cookies.token, secret)
			const clientMessage = chatSchema.find({ usernameId: data.username, ownerId: username }).then((cont) => {
				const time = cont.map((item) => item.ownerMessage.date)
				const me = cont.map((item) => item.ownerMessage.message);
				let messageObjectClient = {
					time: time,
					message: me
				};
				const ownerMessage = chatSchema.find({ usernameId: username, ownerId: data.username }).then((cont) => {
					const time = cont.map((item) => item.ownerMessage.date)
					const me = cont.map((item) => item.ownerMessage.message);
					let messageObject = {
						time: time,
						message: me
					};
					response.json({ "usernameId": username, "ownerMessage": messageObject, "ClientMessage": messageObjectClient })
				})
			})
		}
	})
})

app.post("/sendMsg", (request, response) => {
	const { message } = request.body
	const owner = request.body.usernameId
	const token = request.cookies.token
	const data = jwt.verify(token, secret)
	const MessageFinal = chatSchema.findOne({ usernameId: owner, ownerId: data.username })
	MessageFinal.then((messageFinal) => {
		if (!messageFinal) {
		  // Создать новый документ, если не найден
		  try{
			return chatSchema.create({ usernameId: owner, ownerId: data.username, ownerMessage: { message: message }, "creatable": "Yes" });
		  }
		  catch(e) {
			console.log(e)
		  }
		} else {
		  // Обновить существующий документ и добавить сообщение в массив
		  messageFinal.ownerMessage.message.push(message);
		  function getCurrentDateTime() {
			const date = new Date();
			const year = date.getFullYear();
			const month = String(date.getMonth() + 1).padStart(2, '0'); // +1, так как месяцы в JavaScript начинаются с 0
			const day = String(date.getDate()).padStart(2, '0');
			const hour = String(date.getHours()).padStart(2, '0');
			const minute = String(date.getMinutes()).padStart(2, '0');
			const second = String(date.getSeconds()).padStart(2, '0');
			
			return `${year}${month}${day}${hour}${minute}${second}`;
		 }
		 
		 const currentDateTime = getCurrentDateTime();
		  messageFinal.ownerMessage.date.push(currentDateTime);
		  return messageFinal.save();
		}
	 })
	 .then((updatedMessage) => {
		// Возвращаем обновленный документ или подтверждение создания нового документа
		response.json({ response: updatedMessage.ownerMessage });
	 })
	 .catch((error) => {
		console.error('Ошибка при обновлении сообщения:', error);
		// Обработка ошибок
		response.status(500).json({ error: 'Произошла ошибка при обновлении сообщения' });
	 });
	})

server.listen(3000, () => {
	console.log("http://localhost.com:3000")
})