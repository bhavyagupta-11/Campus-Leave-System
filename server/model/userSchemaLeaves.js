const mongoose= require('mongoose');
const bcrypt = require('bcryptjs');
const jwt= require('jsonwebtoken');


const userSchemaLeave= new mongoose.Schema(
    {
        name:{
            type:String,
            required:true
        },
        department:{
            type:String,
            required:true
        },
        from:{
            type:String,
            required:true
        },
        to:{
            type:String,
            required:true 
        },
        reason:{
            type:String,
            default:"Issued"
        },
        status:{
            type:String,
            default:"Pending"
        },
        comments:{
            type:String,
            default:"No comments yet"
        }
    }
);

const Leave= mongoose.model('leave',userSchemaLeave);

module.exports=Leave;
