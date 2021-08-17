const express = require('express');
const bodyParser = require('body-parser');
// const cors = require('cors'); // overcomes chrome security problem of unrecognized source
const knex = require('knex');
const bcrypt = require('bcryptjs');
const register = require('./controllers/register');
const signIn = require('./controllers/signIn');
const getUsers  = require('./controllers/getUsers');

const db = knex ({
  	client: 'pg',
  	connection: {
		host : '127.0.0.1',
		port: '5433',
		user : 'postgres',
		password : 'Ya1431',
		database : 'postgres'
  	}
});
 

const app = express();
const port = 3000;
app.listen(port, () => console.log('app is running on port ',port) )
app.use(bodyParser.json());
// app.use(cors());









app.post('/changepassword', (req, res) => {
	const {email, oldpass, newpass} = req.body;
	db	.select('hash')
		.from('logins')
		.where('email', '=', email)
		.then(oldhash => {
			isValid = bcrypt.compareSync(oldpass, oldhash[0].hash)
			if(isValid) {
				db('logins')
				.where('email' ,'=', email)
				.update({ hash : bcrypt.hashSync(newpass) })
				.then(res.json("password changed successfully!"))
				.catch(err => res.json("Error changing password.."))
			} else {
				res.json("wrong credentials..")
			}
		})
		.catch(console.log)
})

app.post('/register',(req, res) => { register.handleRegister(req, res, db, bcrypt) })
app.post('/signin', (req, res) => { signIn.handleSignIn(req, res, db, bcrypt) })
app.get('/getallusers', (req,res) => { getUsers.handleGetAllUsers(req,res,db) })
app.get('/getUserById/:id', (req, res) => {getUsers.handleGetUserById(req, res, db) })