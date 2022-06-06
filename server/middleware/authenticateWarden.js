const jwt= require('jsonwebtoken');
const Warden= require('../model/userSchemaWarden');

const authenticateWarden= async(req,res,next)=>{
    try{

        const token=req.cookies.jwtoken;
        const verifyToken=jwt.verify(token,process.env.SECRET_KEY);

        const rootWarden=await Warden.findOne({_id:verifyToken._id,"tokens.token":token});

        if(!rootWarden){
            throw new Error('Warden NOt Found');
        }
        else{
            req.token=token;
            req.rootWarden=rootWarden;
            req.WardenID=rootWarden._id;

            next();
        }
    }
    catch(err){
        res.status(401).send('Warden has LOGGED OUT. Kindly login Again');
        res.redirect('/login')
        console.log(err);
    }
};

module.exports=authenticateWarden;