const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const User = mongoose.model("User");
const Transaction = mongoose.model("Transaction");
const Bill = mongoose.model("Bill");
const Friend = mongoose.model("Friend");
const fs = require('fs');
const formidable = require('formidable');
const async = require('async');

router.post('/add-friend',(req,res)=>{
	const username = req.body.username; //username of the friend being added

	const newFriend = new Friend({
		user: username,
		balance: 0.00
	});
	const secondFriend = new Friend({
		user: req.session.user.username,
		balance: 0.00
	});

	
	User.findOne({"username": req.session.user.username},(err, doc)=>{
		doc.friends.push(newFriend);
		doc.save((err,saved)=>{
			if(err){
				console.log(err);
				res.send({result: "error"});
			}
			else{
				//add the friend so it's immediatly accessible
				console.log(doc)
				//req.session.user.friends.push(newFriend);
				User.findOne({"username": username},(err, user)=>{
					user.friends.push(secondFriend);
					
					user.save();
					console.log(req.session.user);
					res.send({result: "added"});
					
					
				});
			}
		});
	});
});

// Used to determine whether a given username is friends
// with the session user. Used for AJAX requests
// meant to determine if an "Add Friend" button is needed
// next to a given username
router.post('/is-friend', (req, res) => {
	const username = req.body.username;
	const user = req.session.user;
	User.findOne({"username": user.username}, (err, sessionUser) => {
		let friends = false;
		for(let i = 0;i < sessionUser.friends.length; i++){

			if(sessionUser.friends[i].user == username)
				friends = true;
		}
		if(friends){
			res.send("friends");
		}
		else{
			res.send("not_friends");
		}
	});
});

router.post('/upload/image', (req, res) => {
	User.findOne({"username": req.session.user.username}, (err,sessionUser) => {
		console.log(sessionUser);
		//fs.unlinkSync(sessionUser.img.rawSRC);
		
		const form = new formidable.IncomingForm();

	    form.parse(req);

	    form.on('fileBegin', function (name, file){
	        file.path = __dirname + '/../public/images/' + file.name;
	    });

	    form.on('file', function (name, file){
	        console.log('Uploaded ' + file.name);
	        sessionUser.img.rawSRC = __dirname + '/../public/images/' + file.name;
			sessionUser.img.src = '/images/' + file.name;
			sessionUser.save(() => {
				res.redirect('/user/'+req.session.user.username);
			});
	    });		

	});
});

router.post('/image', (req, res) => {
	const username = req.body.username;
	User.findOne({"username": username}, (err, user) => {
		if(user)
			res.send(user.img.src);
		else
			res.send("error");
	});
});

router.post('/history', (req, res) => {
	const username = req.body.username;
	const sessionUser = req.session.user;
	Transaction.find({}, (err, transactions) => {
		const response = {};
		const relTransactions = [];
		const dates = [];
		for(let i = 0; i < transactions.length; i++){
			if(transactions[i].paidBy == sessionUser.username && transactions[i].paidTo == username ||
				transactions[i].paidBy == username && transactions[i].paidTo == sessionUser.username){

				relTransactions.push(transactions[i]);
			}	
		}
		async.forEach(relTransactions, function(item, cb){
			Bill.findById(item.bill, (err, bill) => {
				dates.push(bill.dateCreated);
				cb();
			});
		}, function(err){
			User.findOne({"username": sessionUser.username}, (err, user) => {
				for(let i = 0; i < user.friends.length; i++){
					if(user.friends[i].user == username){
						console.log(user.friends[i].user);
						console.log('balance= ' + user.friends[i].balance);
						response.balance = user.friends[i].balance;
					}
				}
				console.log("1 "+ response.balance);
				User.findOne({"username": username}, (err, otherUser) => {
					for(let i = 0; i < otherUser.friends.length; i++){
						if(otherUser.friends[i].user == sessionUser.username){
								//response.balance -= otherUser.friends[i].balance;
							console.log("2 " + response.balance);
							response.balance -= otherUser.friends[i].balance;
							//console.log(otherUser.friends[i].balance);
							console.log('3 ' + response.balance);
						}
						//console.log(response.balance);
					}
					response.transactions = relTransactions;
					response.dates = dates;
					res.json(response);
				});

			});
		});
	});
});

module.exports = router;
