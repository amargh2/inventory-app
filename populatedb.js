#! /usr/bin/env node

console.log('This script populates some test books, authors, genres and bookinstances to your database. Specified database as argument - e.g.: populatedb mongodb+srv://cooluser:coolpassword@cluster0.a9azn.mongodb.net/local_library?retryWrites=true');

// Get arguments passed on command line
var userArgs = process.argv.slice(2);
/*
if (!userArgs[0].startsWith('mongodb')) {
    console.log('ERROR: You need to specify a valid mongodb URL as the first argument');
    return
}
*/
var async = require('async')
var Item = require('./models/item')
var Category = require('./models/category')


var mongoose = require('mongoose');
var mongoDB = userArgs[0];
mongoose.connect(mongoDB, {useNewUrlParser: true, useUnifiedTopology: true});
mongoose.Promise = global.Promise;
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));

var items = []
var categories = []

function categoryCreate(name, description, cb) {
  var category = new Category({ name: name, description: description });
       
  category.save(function (err) {
    if (err) {
      cb(err, null);
      return;
    }
    console.log('New Category: ' + category);
    categories.push(category)
    cb(null, category);
  }   );
}

function itemCreate(name, price, description, number_in_stock, category, cb) {
  itemdetail = {name:name, price:price, description:description, number_in_stock:number_in_stock}
  if (category != false) itemdetail.category = category
  var item = new Item(itemdetail);
       
  item.save(function (err) {
    if (err) {
      cb(err, null)
      return
    }
    console.log('New Item: ' + item);
    items.push(item)
    cb(null, item)
  }  );
}



 

function createCategories(cb) {
    async.series([
        function(callback) {
          categoryCreate("Curatives", "Good for what ails you!", callback);
        },
        function(callback) {
          categoryCreate("Weapons", "We'd prefer you make love and not war, but sometimes love is a battlefield.", callback);
        },
        function(callback) {
          categoryCreate("Armor", "An ounce of prevention...", callback);
        },
        function(callback) {
          categoryCreate("Oddities", "It's like the clearance section, but dangerous and expensive, so not really like that at all", callback);
        },
        ],
        // optional callback
        cb);
}


function createItems(cb) {
    async.parallel([
        function(callback) {
          itemCreate('Health Potion', 20, 'This potion is made with herbs and healing waters from a mountain spring and was blessed by a wizard so you know it is good.', 10, categories[0], callback);
        },
        function(callback) {
          itemCreate('Focus Poultice', 30, "You might think it's hocus pocus, but this focus poultice does the mostest.", 5, categories[0], callback);
        },
        function(callback) {
          itemCreate('Humble Sword', 100, "If you are in a cave and happen upon a kobold, you'll be glad you bought this.", 3, categories[1], callback);
        },
        function(callback) {
          itemCreate("Leather Armor", 150, "It might protect you, possibly. We hope. You'll definitely look cool though. Guaranteed.", 2, categories[2], callback);
        },
        function(callback) {
          itemCreate("Wizard Regalia", 200, "Put on your robe and wizard hat. It's magical so it costs more.", 1, categories[2], callback);
        },
        function(callback) {
          itemCreate("Steel Armor", 300, "Are you a bad enough dude to wear this armor all day?", 1, categories[2], callback);
        },
        function(callback) {
          itemCreate("Ominous Floating, Humming Orb", 500, "What is it? Why is it here? What does it want?", 1, categories[3], callback);
        }
        ],
        // optional callback
        cb);
}



async.series([
  createCategories,  
  createItems,
],
// Optional callback
function(err, results) {
    if (err) {
        console.log('FINAL ERR: '+err);
    }
    // All done, disconnect from database
    mongoose.connection.close();
});