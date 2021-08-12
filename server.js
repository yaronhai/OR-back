const express = require('express');
const bodyParser = require('body-parser');
// const cors = require('cors'); // overcomes chrome security problem of unrecognized source
const knex = require('knex');
const bcrypt = require('bcryptjs');

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

app.get('/getallusers', (req, res)=> {
	db.select('*').from('users').then(users => {
		console.log(users)
		res.json(users)
	})
})

app.get('/getUserById/:id', (req, res) => {
	const { id } = req.params;
	db.select('*')
		.from('users')
		.where({id})  // same as: where {id: id}
		.then (user => {
			if (user.length) {
				res.json(user[0]);	
			} else {
				res.status(400).json('user not found..')
			}
		})
		.catch(err => {
			res.status(400).json('error getting user..')
		})
})



app.post('/signin', (req, res) => {
	db.select('email', 'hash')
		.from('logins')
		.where('email', '=', req.body.email)
		.then(data => {
			const isValid = bcrypt.compareSync(req.body.password, data[0].hash);
			// const isValid = (req.body.password == data[0].hash)
			if (isValid) {
				console.log(isValid, data[0]);
				db('users')
					.where('email', '=' , data[0].email)
					.update({ last_signin : new Date() })
					.catch(err => res.json("error updating user.."))

				db.select('*').from('users')
					.where('email','=', req.body.email)
					.then(user => res.json(user[0]) )
					.catch(err => res.status(400).json('unable to get user..'))
			} else {
				res.status(400).json('wrong credentials..')
			}
		})
		.catch(err => res.status(400).json('wrong credentials..'))
})

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

app.post('/register', (req, res)=>{
	const { email, Fname, Lname , password} = req.body;
	const hash = bcrypt.hashSync(password);
	console.log('hash: ', hash);
	db.transaction(trx => {
		trx.insert({
			hash: hash,
			email: email
		})
		.into('logins')
		.returning('email')
		.then(loginEmail => {
			return trx('users')
				.returning('*')
				.insert({
					email: loginEmail[0], 
					Fname: Fname,
					Lname: Lname,
					last_signin: new Date()
				})
				.then(user =>{
					res.json(user[0]);
				})
		})
		.then(trx.commit)
		.catch(trx.rollback)
	})
	.catch(err => res.status(400).json('unable to register..'))
})



