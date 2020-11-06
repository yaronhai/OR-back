const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const knex = require('knex');
const bcrypt = require('bcryptjs');

const db = knex ({
  	client: 'pg',
  	connection: {
		host : '127.0.0.1',
		user : 'postgres',
		password : '',
		database : 'my_or'
  	}
});


const app = express();
app.use(bodyParser.json());

app.get('/', (req, res)=> {
	res.send('this is working..')
})

app.post('/signin', (req, res) => {
	db.select('email', 'hash').from('logins')
		.where('email', '=', req.body.email)
		.then(data => {
			const isValid = bcrypt.compareSync(req.body.password, data[0].hash);
			console.log(isValid);
			if (isValid) {
				console.log(data[0]);
				return db.select('*').from('users')
					.where('email','=', req.body.email)
					.then(user => {
						res.json(user[0])
					})
					.catch(err => res.status(400).json('unable to get user..'))
			} else {
				res.status(400).json('wrong credentials..')
			}
		})
		.catch(err => res.status(400).json('wrong credentials..'))
})

app.post('/register', (req, res)=>{
	const { email, Fname, Lname , password} = req.body;
	const hash = bcrypt.hashSync(password);
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

app.get('/profile/:id', (req, res) => {
	const { id } = req.params;
	db.select('*')
		.from('users')
		.where({id})  // same as {id: id}
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

app.listen(3000, ()=> {
	console.log('app is running on port 3000');
})