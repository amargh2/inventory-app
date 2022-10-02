var Item = require('../models/item');
var Category = require('../models/category');
const {body, validationResult} = require('express-validator');
var async = require('async');

exports.index = function (req, res) {
  async.parallel(
    {
      item_count: function(callback) {
        Item.countDocuments({}, callback)
      },
      category_count: function(callback) {
        Category.countDocuments({}, callback)
      }
    },
    function (err, results) {
      res.render('index', {
        title: 'Welcome to the Shop',
        error: err,
        data: results,
      });
    }
  );
};

exports.itemList = function(req, res) {
  Item.find({}, 'name price category', {'_id':false})
    .sort({name:1})
    .populate('category', 'name')  
    .exec(function (err, list_items) {
        if (err) {
          return next(err)
        } else {
          res.render("products", {title: "Product List", item_list:list_items})
        }
    })
}