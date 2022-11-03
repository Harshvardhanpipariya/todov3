//jshint esversion:6

const express = require("express");
const ejs = require('ejs');
// const date = require(__dirname + "/date.js");
const mongoose = require("mongoose");
//const bodyParser = require("body-parser");
const _ = require("lodash");

const app = express();

app.set('view engine', 'ejs');

// app.use(bodyParser.urlencoded({ extended: true }));depreciated
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));

// const items = ["Buy Food", "Cook Food", "Eat Food"];
// const workItems = [];

mongoose.connect("mongodb+srv://Harshvardhan_pipariya:KYj3d45I2heVjvY6@cluster0.5zbsbeg.mongodb.net/todoListDB", { useNewUrlParser: true });

const todoListSchema = {
  task: String
};

const itemInTodoList = mongoose.model("item", todoListSchema);

const item1 = new itemInTodoList({ task: "Welcome to todolist" });
const item2 = new itemInTodoList({ task: "Please click + button to save your task" });
const item3 = new itemInTodoList({ task: "Use checkBox to delete task" });

const defaultItems = [item1, item2, item3];

const listSchema = {
  name: String,
  items: [todoListSchema]
}

const List = mongoose.model("list", listSchema);

app.get("/", function (req, res) {


  itemInTodoList.find({}, function (err, foundItems) {


    if (foundItems.length === 0) {

      itemInTodoList.insertMany(defaultItems, function (err) {
        if (err) {
          console.log(err);
        }
        else {
          console.log("Successfully saved default items");
        }
      })

      res.redirect("/");
    } else {
      // let day = date.getDate();
      res.render('list', { listTitle: "Today", newListItems: foundItems });
    }

  });

});

app.get("/favicon.ico", function (req, res) {
  res.sendStatus(204);
});


app.post("/", function (req, res) {
  let itemName = req.body.newItem;
  const listName = req.body.list;

  const item = new itemInTodoList({ task: itemName });

  if (listName === "Today") {
    item.save();
    res.redirect("/");
  } else {
    List.findOne({ name: listName }, function (err, foundList) {
      foundList.items.push(item);
      foundList.save();
      res.redirect("/" + listName);
    });
  }

});


app.post("/delete", function (req, res) {

  const checkedItemId = req.body.checkbox;
  const listName = req.body.listName;

  if (listName === "Today") {

    itemInTodoList.findByIdAndRemove(checkedItemId, function (err) {
      if (!err) {
        console.log("sucessfully Deleted item");
        res.redirect("/");
      }
    });

  } else {
    List.findOneAndUpdate({ name: listName }, { $pull: { items: { _id: checkedItemId } } }, function (err, foundList) {
      if (!err) {
        res.redirect("/" + listName);
      }
    })
  }

});

app.get("/:customListName", function (req, res) {
  const customListName = _.capitalize(req.params.customListName);


  List.findOne({ name: customListName }, function (err, foundList) {
    if (!err) {
      if (!foundList) {
        // Create a new list
        const list = new List({
          name: customListName,
          items: defaultItems
        });
        list.save();
        res.redirect("/" + customListName);
      } else {
        // show an existing list
        res.render("list", { listTitle: foundList.name, newListItems: foundList.items })
      }
    }
  });

});


let port = process.env.PORT;
if (port == null || port == "") {
  port = 8000;
}
app.listen(port);


app.listen(port, function () {
  console.log("Server started on port Successfully.");
});
