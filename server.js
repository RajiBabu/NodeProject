var express = require("express");
var app = express();
var handlebars = require('express-handlebars');
var bodyParser = require('body-parser');
var jsdom = require('jsdom');
const {JSDOM} = jsdom;

//okta project
const session = require('express-session');
//const express = require('express');
const { ExpressOIDC } = require('@okta/oidc-middleware');
//const app = express();
const oidc = new ExpressOIDC({
  issuer: 'https://dev-695807.okta.com/oauth2/default',
  client_id: '0oakv9m29BUK7fb5P356',
  client_secret: '083E5kQ-H_Atvk91dn6RRovDWmMlR236p3ghFj1y',
  redirect_uri: 'https://cmpe282-frontend.rajibabu.me:3000/authorization-code/callback',
  scope: 'openid profile',
  appBaseUrl: 'https://cmpe282-frontend.rajibabu.me:3000'
});
app.use(session({
  secret: 'this should be secure',
  resave: true,
  saveUninitialized: false
}));


/////////////

const PORT = process.env.PORT || 3000;
const path = require('path');

var fs = require('fs');
var axios = require('axios');
//var path = __dirname + '/views/';

////////////
//var config = {'x-api-key': '7sXek0nDyI80DbEMCaJm87r4dI57jUxD2OtDEuuc'};
var url = 'https://395vlfbu09.execute-api.us-west-2.amazonaws.com/staging/employees/get-all-employees';
var url_post = 'https://395vlfbu09.execute-api.us-west-2.amazonaws.com/staging/employees/get-employee-by-email';
//var post_data = {email: "80000@cloud-spartan.com"}; //should be user input
var post_config = {headers: {'x-api-key': '7sXek0nDyI80DbEMCaJm87r4dI57jUxD2OtDEuuc'}};
///////////
/*var result = axios.get(url,{headers: config});
var result_post = axios.post(url_post, post_data, post_config);*/
var json_result;
var json_result_post;
var data_table;
var content;
var emp_no;
//vars for info displaying

/* GET REQUEST
result.then(function (response){
  json_result = response['data'];
  json_result = JSON.stringify(json_result, null, 2);
  fs.writeFile("data.json", json_result, function(err){
    if(err){
      console.log(err);
    }
  });
})
.catch(function (error){
  console.log(error);
});*/

//POST REQUEST
/*result_post.then(function (res){
  json_result_post = res['data']; //getting the result as a JSON Object
  //console.log(res['data']);
  data_table = json_result_post["body-json"];
  json_result_post = JSON.stringify(json_result_post, null, 2);
  //console.log(data_table);
  fs.writeFile("data_post.json", json_result_post, function(err){
    if(err){
      console.log(err);
    }
  });
  //json_result_post_parse = JSON.parse(json_result_post);
  //console.log("RESPONSE: ", res);
}).catch(function (err){
  console.log("AXIOS ERROR: ", err);
});*/


app.set('view engine', '.hbs');
app.set("PORT", PORT);
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use(express.static(path.join(__dirname, 'assets')));
app.set('views', path.join(__dirname, 'views'));

app.use(oidc.router);

//redering pages


app.use(function (req,res,next) {
  console.log("/" + req.method);
  next();
});

app.get('/', oidc.ensureAuthenticated(), (req, res) => {
  res.send(JSON.stringify(req.userinfo));
  console.log("Hi");
});

app.get("/home", (req,res) => {
  if(req.userContext.userinfo){
    res.render("index");
  } else {
    console.log('not authed');
  }
});

app.get("/about",function(req,res){
  res.render("about");
});

app.get("/data_email", function(req,res){
  res.render("data_email", {data:null})
});

app.post("/data_email",function(req,res){
  //console.log(req.body);
  const email = req.body.email;
  //console.log(email);
  const delete_var = req.body.delete;
  const update_var = req.body.update;
  //var update_form = document.getElementById("update-form");

  if(email){
    axios.post(url_post,
      {email: email}, //get the data (email) from data_email.hbs
      post_config, 
    ).then(function (response){
      json_result_post = response['data'];
      content = json_result_post['body-json'];
      //console.log(content);
      //data_table = JSON.stringify(content, null, 2);
      //console.log(data_table);
      var first_name = content.first_name;
      var last_name = content.last_name;
      var email = content.email;
      var emp_no = content.emp_no;
      var birth_date = content.birth_date;
      //console.log(birth_date);
      var gender = content.gender;
      var hire_date = content.hire_date;

      var content2 = content['title'];
      var title;
      //console.log(content2[0].title);
      for(var i=0;i<content2.length;i++){
        if(content2[i].to_date == "9999-01-01"){
          title = content2[i].title;
        }
        else{
          title = "No more our employee";
        }
      }
      //console.log(title);

      var content_depart = content['departments'];
      //console.log(content_depart);
      var department = content_depart[0].dept_name;
      //console.log(department);

      res.render("data_email", {first_name: first_name, 
                                last_name: last_name,
                                title: title,
                                department: department,
                                emp_no: emp_no,
                                email: email,
                                birth_date: birth_date,
                                gender: gender,
                                hire_date: hire_date});
    }).catch(function (error){
      console.log(error);
    });
  }
  else if(update_var){
    //need to perform axios.post or axios.put with data
    console.log("Updating");
    //need to insert html tag
    /**
     * <p>Title: {{title}}</p>
     * <p>Department: {{department}}</p>
     * construct a JSON object (data) to pass axios.post
     */
    const dom = new JSDOM(`<!DOCTYPE html><p>Hello world</p>`);
    dom.window.document.querySelector("p").textContent; 

  } 
  else if(delete_var){
    console.log("Deleting");
    //need to perform axios.delete
  } 
  
  else{
    console.log("???");
  }
}); 

/*app.listen(app.get('PORT'), function () {
  console.log('Express started on http://localhost:' +
      app.get('PORT') + '; press Ctrl-C to terminate.');
});*/
oidc.on('ready', () => {
  app.listen(PORT, () => console.log(`Started!`));
});

oidc.on('error', err => {
  console.log('Unable to configure ExpressOIDC', err);
});
