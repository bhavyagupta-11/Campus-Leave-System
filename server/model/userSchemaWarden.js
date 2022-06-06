const mongoose= require('mongoose');
const bcrypt = require('bcryptjs');
const jwt= require('jsonwebtoken');


const userSchemaWarden= new mongoose.Schema(
    {
        name:{
            type:String,
            required:true
        },
        username:{
            type:String,
            required:true 
        },
        password:{
            type:String,
            default:"Issued"
        },
        department:{
            type:String,
            default:"Issued"
        },
        picture:{
            type:String,
            default:"Issued"
        },
        tokens:[
            {
                token:{
                    type:String,
                    required:true
                }
            }
        ]
    }
);

//password hashing
userSchemaWarden.pre('save', async function(next){
    try{
        if(this.isModified('password')){
            this.password = await bcrypt.hash(this.password,12);
        }
        next();
    }
    catch(err){
        console.log(err);
    }
});

//for jwt authentication
userSchemaWarden.methods.generateAuthToken = async function(){
    try{
        //the token is made out of the id and the secret id
        let token =jwt.sign({_id:this._id}, process.env.SECRET_KEY);
        this.tokens=this.tokens.concat({token:token});
        await this.save();
        return token;
    }catch(err){
        console.log(err);
    }
};


const Warden= mongoose.model('warden',userSchemaWarden);

module.exports=Warden;
