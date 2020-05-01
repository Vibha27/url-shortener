'use strict';

var express = require('express');
var mongo = require('mongodb');
var mongoose = require('mongoose');
var bodyParser = require('body-parser');
var cors = require('cors');

var app = express();

// Basic Configuration 
var port = process.env.PORT || 3000;

// dns
const dns = require('dns');

/** this project needs a db !! **/ 
mongoose.connect(process.env.MONGO_URI,{ useNewUrlParser : true ,useUnifiedTopology: true});

app.use(cors());

/** this project needs to parse POST bodies **/
// you should mount the body-parser here
app.use(bodyParser.urlencoded({
    extended: false
}));
app.use(bodyParser.json());

app.use('/public', express.static(process.cwd() + '/public'));

app.get('/', function(req, res){
  res.sendFile(process.cwd() + '/views/index.html');
});


// Schema 
var urlSchema = new mongoose.Schema({
      orig_url: {
        type: String,
        required: true,
      },
      short_url: Number
  });

// model
var URL = mongoose.model('URL', urlSchema)

// url
app.post('/api/shorturl/new',(req,res)=>{
  var body_url = req.body.url;
  var replace_url = /^https:\/\//i
  var hostname = body_url.replace(replace_url,"")
 
//   checking if exits in database
  if(URL.findOne({ orig_url : hostname },(err,docs) =>{
    
    if(err)
      console.log("err")
    
    else if(docs){
        res.json({ original_url : hostname , short_url : docs.short_url})
      }
      else{

    // checking if url is valid
      dns.lookup(hostname,(err,family,address)=>{
    
          // valid
          if(!err){
             
             var items = new URL();
            var orgi_url = items.orig_url = hostname;
            var short_url = items.short_url = Math.ceil(Math.random()*1000);

              // saving in database
             items.save((err,doc)=>{
                  if(err){
                      res.json({ warning : "database error"})
                  }  
                  else{   
                    res.json({ original_url : orgi_url, short_url : short_url});
                  }
             });

           }

        // invalid url
          else{
           res.json({error : "Invalid url"})
          }
      });
     
    }
  
   }));
   
//  new url              
  
 });


// for checking short url
app.get('/api/shorturl/:short',(req,res)=>{
  var short = req.params.short
  
//   finding short url in database and returing to its original_url
  const link = URL.findOne({short_url : short},(err,docs)=>{
    if(!err)
      res.redirect('https://'+docs.orig_url)
    else
      res.json({ warning : "short url does nit exist"} )
  })
  
  

})

// your first API endpoint... 
app.get("/api/hello", function (req, res) {
  res.json({greeting: 'hello API'});
});


app.listen(port, function () {
  console.log('Node.js listening ...');
});