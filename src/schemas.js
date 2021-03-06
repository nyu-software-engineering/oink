const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const passportLocalMongoose = require('passport-local-mongoose');

const TransactionSchema = new Schema({
	//will be referenced by the bill
	amount:{type: Number, required:true},
	paidBy:{type:String, required:true}, //the person that needs to pay that portion of the bill
	paidTo:{type:String, required:true}, // the person that created the referenced Bill
	isPaid:{type:Boolean},
	bill:{type: Schema.Types.ObjectId, ref:"Bill"},
	isFriends:{type:Boolean}, // if paidBy and paidTo are friends or not
	dateCreated:{type:String, required: true},
	datePaid:{type:String}
});

const BillSchema = new Schema({
	//will be referenced by the user
	amount:{type:Number, required:true},

	//list of users including user that added the bill, 
	//if the two involved will be working on a payback, this will be only two users
	splitWith:[{type:String, required:true}],

	comment:{type:String, required:false},

	//if the bill is not being split and is added to two users running totals
	
	//if the owner or the person in "splitWith" is paying the full bill on a payback system, this will be true
	// the transactions will just be the full amount to whoever is paying
	notSplit:{type:Boolean, required:false},

	//only matters if not split is true
	paidBy:{type:String, required: false},

	dateCreated:{type:String, required: true}
});

const GroupSchema = new Schema({

	name:{type:String, required:true},
	inGroup:[String], //will be usernames
	defaultPercentages:[Number], // will be same length as inGroup
	administrator: String //username of person who created the group / has administrative access

});

const FriendSchema = new Schema({
	user: String,
	balance: Number
});

const UserSchema = new Schema({
	username:{type: String, unique:true, required:true, index:true},
	email:{type:String, unique:true, index:true},
	password:{type:String},
	groups:[{type: Schema.Types.ObjectId, ref:"Group"}],
	bills:[{type: Schema.Types.ObjectId, ref:"Bill"}],
	transactions:[{type:Schema.Types.ObjectId, ref:"Transaction"}],
	friends:[FriendSchema],
	img: { src: String, contentType: String, rawSRC: String },
	// src - relative path with respect to public directory
			// useful for placement in hbs files
	// rawSRC - absolute path from root project directory
			// useful for all other references of file
	defaultTip: Number
});



//Plug-Ins
UserSchema.plugin(passportLocalMongoose);

//Models
mongoose.model('Bill', BillSchema);
mongoose.model('Transaction', TransactionSchema);
mongoose.model('Group', GroupSchema);
mongoose.model('Friend', FriendSchema);
mongoose.model('User', UserSchema);



mongoose.connect('mongodb://localhost/oink_dev', { useNewUrlParser: true });