const { Router } = require("express");
const express=require("express");
const route= express.Router();
const Student= require('../model/userSchemaStudent');
const Warden= require('../model/userSchemaWarden');
const Leave=require("../model/userSchemaLeaves");
const bcrypt=require('bcryptjs');
const dotenv = require('dotenv');
const jwt=require('jsonwebtoken');
const authenticateStudent=require('../middleware/authenticateStudent');
const authenticateWarden=require('../middleware/authenticateWarden');
const req = require("express/lib/request");

route.get('/home',(req,res)=>{
    res.render('home');
});

route.get('/login',(req,res)=>{
    res.render('login');
});

route.get('/leaveform',authenticateStudent,(req,res)=>{
    const username=req.rootStudent.username;
    const department=req.rootStudent.department;

    res.render('leaveform',{name:username,department:department});
});

route.get('/approveform/:id',(req,res)=>{
    try{
      var details=Leave.findById({
          _id: [req.params.id]
      });
     // console.log(details);
      details.exec(function(err,data){
          if (err) throw err;
          res.render('approveform',{data:data});
      })
    }
    catch(err){
        console.log(err);
    }
});

route.get('/aboutus',(req,res)=>{
    res.render('aboutus');
});

route.get('/registar',(req,res)=>{
    res.render('registar');
});

route.post('/approveform/:id',(req,res)=>{
   const {status,comments}=req.body;

   if(!status){
       return res.status(422).json({error:"plz respond to the request "});
   }
   try{
       var leave=Leave.findByIdAndUpdate(
           {
              _id:[req.params.id]
           },
           {
              status,
              comments
           },{useFindAndModify:false}
       );
       leave.exec(function(err){
           if(err) throw err;
       });
       res.redirect('/controlleave');
   }
   catch(err){
       console.log(err);
   }
});

route.post('/leaveform',async(req,res)=>{
    const {name,department,from,to,reason}=req.body;

    if(!from || !to || !reason){
        return res.status(422).json({error:"Plz fill the details properly"})
    }
    try{

            const leave=new Leave(
                {
                    name,
                    department,
                    from,
                    to,
                    reason
                }
            );
      
            await leave.save();
            res.redirect('/applyleave');
        

    }
    catch(err){
        console.log(err);
    }
})

route.get('/applyleave',authenticateStudent,(req,res)=>{
    const name=req.rootStudent.name;
    const department=req.rootStudent.department;
    const username=req.rootStudent.username;
    const picture=req.rootStudent.picture;
    
    //find the details of leaves
    var leave=Leave.find({
        username:username
    });
    leave.exec(function(err,data){
        if(err) throw err;
        res.render('applyleave',{records:data,name:name,department:department,username:username,picture:picture});
    });
});

route.get('/controlleave',authenticateWarden,(req,res)=>{
    const name=req.rootWarden.name;
    const department=req.rootWarden.department;
    const username=req.rootWarden.username;
    const picture=req.rootWarden.picture;
    
    //find the details of leaves
    var leave=Leave.find({
        department:department
    });
    leave.exec(function(err,data){
        if(err) throw err;
        res.render('controlleave',{records:data,name:name,department:department,username:username,picture:picture});
    });
});

route.post('/registar',async(req,res)=>{
    const{name,type,username,password,department,picture}=req.body;

    if(!name || !type || !username || !password || !department || !picture){
        return res.status(422).json({error: " Plz fill the Field properly"});
    }
    if(type=="Student"){
        try{

            const studentExist= await Student.findOne({username:username});
    
            if(studentExist){
                return res.status(422).json({err: "Username already taken"});
            }
            else{
                const student=new Student(
                    {
                        name,
                        username,
                        password,
                        department,
                        picture
                    }
                );
          
                await student.save();
                res.status(201).json({message:`${name} is registared`});
            }
    
        }
        catch(err){
            console.log(err);
        }
    }
    if(type=="Warden"){
        try{

            const wardenExist= await Warden.findOne({username:username});
    
            if(wardenExist){
                return res.status(422).json({err: "Username already taken"});
            }
            else{
                const warden=new Warden(
                    {
                        name,
                        username,
                        password,
                        department,
                        picture
                    }
                );
          
                await warden.save();
                res.status(201).json({message:`${name} is registared as Admin`});
            }
    
        }
        catch(err){
            console.log(err);
        }
    }
    
    
});

route.post('/login',async(req,res)=>{

    const {type,username,password}=req.body;

    if(!type || !username || !password){
        return res.status(202).json({err:"PLz fill the required fields"});
    }

    if(type=="Student") {
        try{
            const studentLogin = await Student.findOne({username:username});
            
            if(studentLogin){
                const matchPwd= await bcrypt.compare(password,studentLogin.password);
    
                const token= await studentLogin.generateAuthToken();
                console.log(token);
    
                //cookie generate
                res.cookie('jwtoken',token,{
                    expires:new Date(Date.now()+360000000),
                    httpOnly:true
                });
    
                if(!matchPwd){
                    res.json({message:"Invalid Credentials"});
                }
                else{
                    //res.json({message:"Student SignedIn Successfully"});
                    res.redirect('/applyleave');
                }
            }
        }
        catch(err){
            console.log(err);
        }
    }
    if(type=="Warden"){
        try{
            const wardenLogin = await Warden.findOne({username:username});
            
            if(wardenLogin){
                const matchPwd= await bcrypt.compare(password,wardenLogin.password);
    
                const token= await wardenLogin.generateAuthToken();
                console.log(token);
    
                //cookie generate
                res.cookie('jwtoken',token,{
                    expires:new Date(Date.now()+360000),
                    httpOnly:true
                });
    
                if(!matchPwd){
                    res.json({message:"Invalid Credentials"});
                }
                else{
                   // res.json({message:"Warden SignIn Successfully"});
                    res.redirect('/controlleave');
                }
            }
        }
        catch(err){
            console.log(err);
        }
    }
    
});


module.exports=route;