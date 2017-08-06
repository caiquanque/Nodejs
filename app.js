var express = require('express');
var connection = require('./config/connect.js');
const async = require('async');


//GET startDay and stopDay
Date.prototype.addDays = function(days) {
    var dat = new Date(this.valueOf())
    dat.setDate(dat.getDate() + days);
    return dat;
}

function getDates(startDate, stopDate) {
    var dateArray   = new Array();
    var currentDate = startDate;

    while (currentDate <= stopDate) {
        dateArray.push( new Date (currentDate) )
        currentDate = currentDate.addDays(1);
    }
    return dateArray;
}

//truyen gia tri vao doi tuong
fromDate  = new Date('2016-11-28');
toDate    = new Date('2016-12-18');

var arr = getDates(fromDate, toDate);

//create 2 mang moi
var arrResult   = new Array();
var arrResult1  = new Array();

//loc thu 2 va chu nhat
arr.forEach(function(date){
  let day = date.getDay();
  if(day == 0){
    //luu mang date -> arrResult
    arrResult.push(date);
    // console.log(date);
  }
  if(day == 1){
    //luu mang date -> arrResult1
    arrResult1.push(date);
    console.log(date);
  }
 
//In Monday
  if(day == 1){
    console.log('Monday');
    console.log('-------');
  }
});



//Format date: YYYY-mm-dd HH:mm:ss
function formatDate(date){
  var hour   = date.getSeconds();
  var minute = date.getMinutes();
  var second = date.getSeconds();
  var year   = date.getFullYear();
  var month  = date.getMonth();
  month = month + 1;

  if(month < 10){ month = "0" + month;}

  var ngay  = date.getDate();

  if(ngay<10){ ngay = "0" + ngay;}

  return year + "-" + month + "-" + ngay + " " + hour + ":" + minute + ":" + second;

}


//week_1
var Result12  = new Date(arrResult1[0]);
var Result11  = new Date(arrResult[0]);

var result12  = formatDate(Result12);
var result11  = formatDate(Result11);

      // console.log(result12);
      // console.log(result11);

//week_2
var Result22  = new Date(arrResult1[1]);
var Result21  = new Date(arrResult[1]);

var result22  = formatDate(Result22);
var result21  = formatDate(Result21);

      // console.log(result22);
      // console.log(result21);

//week_3
var Result32  = new Date(arrResult1[2]);
var Result31  = new Date(arrResult[2]);

var result32  = formatDate(Result32);
var result31  = formatDate(Result31);

      // console.log(result32);
      // console.log(result31);

//In week_1
async.parallel([
    (cb) => {
      connection.query("select a.fans from facebook_channel_data a join channel_data b on a.channel_data_id = b.id where b.date_reported='"+result11+"' ORDER BY a.fans DESC LIMIT 1", function (err, row, fields) {
        if (err) console.log(err);
        cb(null, row);
      }); 
    },
    (cb) => {
      connection.query("select a.fans from facebook_channel_data a join channel_data b on a.channel_data_id = b.id where b.date_reported='"+result21+"' ORDER BY a.fans DESC LIMIT 1", function (err, row, fields) {
        if (err) console.log(err);
        cb(null, row);
      }); 
    },
    (cb) => {
      connection.query("select a.fans from facebook_channel_data a join channel_data b on a.channel_data_id = b.id where b.date_reported='"+result31+"' ORDER BY a.fans DESC LIMIT 1", function (err, row, fields) {
        if (err) console.log(err);
        cb(null, row);
      }); 
    }
  ], (err, result) => {

    // Week_1
    if(result[0]==0){
      console.log('value_2: Not found data !');
    }else{
      connection.query("select (sum(a.shares) + sum(a.likes) + sum(a.comments))/'"+result[0][0].fans+"' as value from facebook_channel_data a join channel_data b on a.channel_data_id = b.id where b.date_reported between '"+result12+"' and '"+result11+"' ", function (err, row, fields) {
      if (err) console.log(err);
        // console.log(row);
        // console.log(row[0].value);
        // console.log(row.toFixed(2));
        console.log("value_1:" + row[0].value.toFixed(2));
      });
    }

    //Week_2
    if(result[1]==0){
      console.log('value_2: Not found data !');
    }else{
      connection.query("select (sum(a.shares) + sum(a.likes) + sum(a.comments))/'"+result[1][0].fans+"' as value from facebook_channel_data a join channel_data b on a.channel_data_id = b.id where b.date_reported between '"+result22+"' and '"+result21+"' ", function (err, row, fields) {
      if (err) console.log(err);
        console.log("value_2:" + row[0].value.toFixed(2));
      });
    }

    //Week_3
    if(result[2]==0){
      console.log('value_3: Not found data !');
    }else{
      connection.query("select (sum(a.shares) + sum(a.likes) + sum(a.comments))/'"+result[2][0].fans+"' as value from facebook_channel_data a join channel_data b on a.channel_data_id = b.id where b.date_reported between '"+result32+"' and '"+result31+"' ", function (err, row, fields) {
      if (err) console.log(err);
        console.log("value_3:" + row[0].value.toFixed(2));
      });
    }

});

//End TEST

var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var index = require('./routes/index');
var users = require('./routes/users');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', index);
app.use('/users', users);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;

var date = new Date("Saturday, February 9, 2008");  
day = date.getDay();  
console.log(day);