//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
// const date = require(__dirname + "/date.js");

// console.log(date());

const app = express();


app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect("mongodb://localhost:27017/todolistDB", {useUnifiedTopology: true, useNewUrlParser: true, useFindAndModify: false});

const itemSchema = {
  name: String,
  date: String,
  order: Number,
  procrastination: Number
};

// const dateSchema = {
//   date: String,
//   items: [itemSchema],
//   completions: Number,
//   procrastinations: Number
// };

const Item = mongoose.model("Item", itemSchema);
// const MyDate = mongoose.model("MyDate", dateSchema);


var d = new Date();
var todayDate = d.getFullYear() + "-" + (d.getMonth()+1) + "-" + d.getDate();
var tomorrowDate = d.getFullYear() + "-" + (d.getMonth()+1) + "-" + (d.getDate()+1);
var futureDate = d.getFullYear() + "-" + (d.getMonth()+1) + "-" + (d.getDate()+2);
var dateArr = [todayDate, tomorrowDate, futureDate];

var options = { weekday: 'long', month: 'short', day: 'numeric' };
var today = d.toLocaleDateString("en-US", options);
d.setDate(d.getDate()+1);
var tomorrow = d.toLocaleDateString("en-US", options);


const item1 = new Item({
  name: "Today 1",
  date: "2019-10-15",
  order: 1,
  procrastination: 0
});
const item2 = new Item({
  name: "Today 2",
  date: "2019-10-15",
  order: 2,
  procrastination: 0
});
const item3 = new Item({
  name: "Today 3",
  date: "2019-10-15",
  order: 3,
  procrastination: 0
});
const item4 = new Item({
  name: "Tomorrow 1",
  date: "2019-10-16",
  order: 1,
  procrastination: 0
});
const item5 = new Item({
  name: "Tomorrow 2",
  date: "2019-10-16",
  order: 2,
  procrastination: 0
});
const item6 = new Item({
  name: "Tomorrow 3",
  date: "2019-10-16",
  order: 3,
  procrastination: 0
});
const item7 = new Item({
  name: "Future 1",
  date: "2019-10-17",
  order: 1,
  procrastination: 0
});
const item8 = new Item({
  name: "Future 2",
  date: "2019-10-18",
  order: 2,
  procrastination: 0
});
const item9 = new Item({
  name: "Future 3",
  date: "2019-10-19",
  order: 3,
  procrastination: 0
});


// const day1 = new MyDate({
//   date: "Today",
//   items: [item1, item2, item3]
// });


app.get("/", function(req, res){
  Item.find({date: todayDate}).sort({order: 1}).exec(function(err, todayItems){
    if (todayItems.length == 0) {
      Item.insertMany([item1, item2, item3], function(err){
        if (err){
          console.log(err);
        }
      });
      res.redirect("/");
    } else {
        Item.find({date: tomorrowDate}).sort({order: 1}).exec(function(err, tomorrowItems){
          if (tomorrowItems.length == 0) {
            Item.insertMany([item4, item5, item6], function(err){
              if (err){
                console.log(err);
              }
            });
            res.redirect("/");
          } else {
              Item.find({date:{ $gt: tomorrowDate}}).sort({order: 1}).exec(function(err, futureItems){
                if (futureItems.length == 0) {
                  Item.insertMany([item7, item8, item9], function(err){
                    if (err){
                      console.log(err);
                    }
                  });
                  res.redirect("/");
                } else {
                  res.render("list", {dateArr: dateArr, today: today, tomorrow: tomorrow, todayItems: todayItems, tomorrowItems: tomorrowItems, futureItems: futureItems} );
                }
              });
            }
        });

      }
    });


  });

app.post("/getID", function(req, res){
  //console.log(req.body);
  let id = "error";
  let itemOrder = Number(req.body.originalIndex) +1;
  Item.findOne({order: itemOrder}, function(err, result){
    if (err) {
      console.log(err);
    } else {
      id = result._id;
      res.send(id);
    }

  });

});

app.post("/changeIndex", function(req, res){
  let id = req.body.id;
  let newOrder = Number(req.body.newIndex) + 1;
  Item.findByIdAndUpdate(id, {order: newOrder}, function(err){
    if (err) {
      console.log(err);
    } else {
      res.send("good job");
    }
  });

});

app.post("/changeDate", function(req, res){
  let id = req.body.id, procrastination = req.body.procrastination;
  let newDate = dateArr[req.body.newDate];
  Item.findByIdAndUpdate(id, {procrastination: procrastination, date: newDate}, function(err, item){
  });

});

// app.post("/getColor", function(req, res){
//   let id = req.body.id;
//
//   Item.findById(id, function(err, item){
//     console.log(item);
//     if (err) {
//       console.log("get color error");
//     } else {
//       console.log(item.procrastination);
//       res.send(item.procrastination.toString());
//     }
//   });
// });

app.post("/addTodo", function(req, res){
  var date = req.body.date;
  var todo = req.body.todo;
  const newItem = new Item({
    name: todo,
    date: date,
    order: 100,
    procrastination: 0
  });
  newItem.save(function(err){
    res.redirect('/');
  });

});

app.post("/delete", function(req, res) {
  let idToDelete = req.body.idToDelete;
  console.log(idToDelete);
  Item.findByIdAndDelete(idToDelete, function(err){
    if (err) {
      console.log(err);
    } else {
      res.send("good job");
    }
  });
});

// app.post("/add-today", function(req, res){
//   const item4 = new Item({
//     name: "test1",
//     date: "Today",
//     order: 4,
//     procrastination: 0
//   });
//
//   item3.save(function(err){
//     if (err){
//       console.log(err);
//     }
//   })
//
//   res.redirect("/");
// });

// app.post("/delete-today", function(req, res){
//
//   Item.findByIdAndRemove(req.body.delete, function(err){
//     if (err){
//       console.log(err);
//     }
//   });
//   res.redirect("/");
// });


app.listen(3000, function(){
  console.log("Server started on port 3000");
});

// function findColor(procrastination){
//   let color = "#fff";
//   if (procrastination == 1) {color="#f1bc31";}
//   else if (procrastination == 2) {color="#e25822";}
//   else if (procrastination == 3) {color="#b22222";}
//   else if (procrastination >= 4) {color="#7c0a02";}
//   return color;
// }
