const handleSignIn = (req, res, db, bcrypt) => {
	db.select('email', 'hash')
		.from('logins')
		.where('email', '=', req.body.email)
		.then(data => {
			const isValid = bcrypt.compareSync(req.body.password, data[0].hash);
			console.log(isValid  )
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
				res.status(400).json('wrong credentials.. ')
				console.log(isValid)
			}
		})
		.catch(err => res.status(400).json('wrong credentials..'))
}

module.exports = {
    handleSignIn
}