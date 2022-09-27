const express = require('express');
const bodyParser = require('body-parser');
const date = require(__dirname + "/date.js");
const mongoose = require('mongoose');
const _ = require('lodash');

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({
   extended: true
}));
app.use(express.static("public"));

mongoose.connect("mongodb+srv://admin-matteo:test123@cluster0.t9mox92.mongodb.net/todolistDB");

const itemsSchema = {
   name: String,
}

const Item = mongoose.model("Item", itemsSchema);

const item1 = new Item({
   name: "Welcome to your todo list"
});

const item2 = new Item({
   name: "Hit the + button to add a new item"
});

const item3 = new Item({
   name: "Hit the checkbox to delete them"
});

const defaultItems = [item1, item2, item3];

const listSchema = {
   name: String,
   items: [itemsSchema]
};

const List = mongoose.model("List", listSchema);

const day = date.getDate();

app.get('/', function (req, res) {

   Item.find({}, function (err, foundItems) {

      if (foundItems.length === 0) {
         Item.insertMany(defaultItems, function (err) {
            if (err) {
               console.log(err);
            } else {
               console.log('Inserted ' + defaultItems.length + ' items');
            }
         });
         res.redirect("/");
      } else {
         res.render("list", {
            listTitle: day,
            newListItems: foundItems,
         });
      }

   });

});

app.get("/:customListName", function (req, res) {
   const customListName = _.capitalize(req.params.customListName);

   List.findOne({
      name: customListName
   }, function (err, foundList) {
      if (!err) {
         if (!foundList) {
            const list = new List({
               name: customListName,
               items: defaultItems,
            });
            list.save();
            res.redirect("/" + customListName);
         } else {
            res.render("list", {
               listTitle: foundList.name,
               newListItems: foundList.items,
            })
         }
      }
   });



});


app.post('/', function (req, res) {

   const itemName = req.body.newItem;
   const listName = req.body.list;

   const item = new Item({
      name: itemName,
   });

   if (listName === day) {
      item.save();
      res.redirect("/");
   } else {
      List.findOne({
         name: listName
      }, function (err, foundList) {
         foundList.items.push(item);
         foundList.save();
         res.redirect("/" + listName);
      });
   }

});

app.post('/delete', function (req, res) {
   const checkedItemID = req.body.checkbox;
   const listName = req.body.listName;

   if (listName === day) {
      Item.findByIdAndRemove(checkedItemID, function (err, item) {
         if (err) {
            console.log(err);
         } else {
            console.log('Removed ' + item.name);
            res.redirect("/");
         }
      });
   } else {
      List.findOneAndUpdate({
            name: listName
         }, {
            $pull: {
               items: {
                  _id: checkedItemID
               }
            }
         },
         function (err, item) {
            if (!err) {
               res.redirect("/" + listName);
            }
         });
   }
});



app.post("/work", function (req, res) {
   const item = req.body.newItem;
   workItems.push(item);
   res.redirect("/work");
});


app.listen(process.env.PORT || 3000, function () {
   console.log("Server running on port 3000.")
});