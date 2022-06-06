const express = require("express");
const dotenv = require("dotenv");
const app=express();
const morgan = require("morgan");
const mongoose= require('mongoose');
const bodyparser = require('body-parser');
const path= require("path");
const cookieParser = require('cookie-parser')

//this is necessary to use cookies
app.use(cookieParser());

dotenv.config({path:"./config.env"});
const PORT=process.env.PORT;

//connect to mongoDb
require('./server/database/connection');

//for log requests
app.use(morgan('tiny'));

//parse request to body-parser
app.use(bodyparser.urlencoded({extended:true}));

//set view engine for dynamic html files..this is to render ejs files without there extension
app.set("view engine","ejs");

//to load assets..this is done so that when css files are loaded only css/name.css can work
/*app.use('/css',express.static(path.resolve(__dirname,"assets/css")));
app.use('/image',express.static(path.resolve(__dirname,"assets/image")));
app.use('/js',express.static(path.resolve(__dirname,"assets/js")));*/
app.use(express.static("assets"));
app.use('/image',express.static('image')); //this is not working however

//load routers
app.use(require('./server/routes/router'));

app.listen(3005,()=>{
    console.log(`server is running on port 3005`);
});