const handleRegister = (req, res, db, bcrypt)=>{
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
}

module.exports = {
    handleRegister: handleRegister
};