const jwt= require('jsonwebtoken');
const Student= require('../model/userSchemaStudent');

const authenticateStudent= async(req,res,next)=>{
    try{

        const token=req.cookies.jwtoken;
        const verifyToken=jwt.verify(token,process.env.SECRET_KEY);

        const rootStudent=await Student.findOne({_id:verifyToken._id,"tokens.token":token});

        if(!rootStudent){
            throw new Error('Student NOt Found');
        }
        else{
            req.token=token;
            req.rootStudent=rootStudent;
            req.StudentID=rootStudent._id;

            next();
        }
    }
    catch(err){
        res.status(401).send('Student has LOGGED OUT. Kindly login Again');
        res.redirect('/login')
        console.log(err);
    }
};

module.exports=authenticateStudent;