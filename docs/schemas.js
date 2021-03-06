const mongoose = require('mongoose');
const schema = mongoose.Schema;


const TransactionSchema = new schema({
	//will be referenced by the bill
	amount:{type: Number, required:true},
	paidBy:{type:String, required:true}, //the person that needs to pay that portion of the bill
	isPaid:{type:Boolean}
});

const BillSchema = new schema({
	//will be referenced by the user
	amount:{type:Number, required:true},

	//list of users including user that added the bill, 
	//if the two involved will be working on a payback, this will be only two users
	splitWith:[{type:String, required:true}],

	//list of transactions the bill is split into, only one for "payback"
	transactions:[{type: schema.Types.ObjectId, ref:"Transaction"}], // this needs to be the referenceID 

	//if the bill is not being split and is added to two users running totals
	
	//if the owner or the person in "splitWith" is paying the full bill on a payback system, this will be true
	// the transactions will just be the full amount to whoever is paying
	notSplit:{type:Boolean, required:false},

	//only matters if not split is true
	paidBy:{type:String, required: false} 

});

const GroupSchema = new schema({

	name:{type:String, required:true},
	inGroup:[String] //will be usernames or id

});

const UserSchema = new schema({
	username:{type: String, unique:true, required:true},
	password:{type:String, required:true},
	groups:[GroupSchema],
	bills:[{type: schema.Types.ObjectId, ref:"Bill"}], //change to reference
	friends:[String]

});
