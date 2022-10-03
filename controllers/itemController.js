var Item = require('../models/item');
var Category = require('../models/category');
const {body, validationResult} = require('express-validator');
var async = require('async');
const ObjectId = require('mongoose').Types.ObjectId

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
  Item.find({}, 'name price category number_in_stock', {'_id':false})
    .sort({name:1})
    .populate('category', 'name')  
    .exec(function (err, list_items) {
        if (err) {
          return next(err)
        } else {
          res.render("products", {title: "Product List", item_list:list_items})
        }
    }
  );
};

exports.test = function(req, res) {
  res.render('test', {title: 'Uhh'})
}

exports.getItem2 = function(req, res) {
    Item.findById(req.params.id)
    .populate('category')
    .exec()
}

exports.itemDetail = async function(req, res, next) {
    try {
      const item = await Item.findById(req.params.id).exec()
      res.render('item_detail', {item_details: item})
    }
    catch (err) {
      next(err)
    }
    
};

exports.listCategories = async function(req, res, next) {
  try {
    const categories = await Category.find({})
      .sort({name: 1})
    res.render('categories', {title: 'Categories', categories_list: categories})
  } catch (err){
    next(err)
  }
}

//GET items by provided category
exports.categoryItems = async function(req, res, next) {
  try {
    const id = req.params.id;
    const oId = new ObjectId(id)
    const items = await Item.find({category: oId})
      .populate('category')
    res.render('category_items_list', {title: `${items[0].category.name}`, items:items})
  } catch (err) {
    next(err)
  }
}

//GET item detail
exports.itemDetail = async function(req, res, next) {
  try {
    const id = req.params.id;
  const oId = new ObjectId(id)
  const item = await Item.findById(oId)
    .populate('category')
  res.render('item_detail', {title: 'Product Details for ' + item.name, item_details:item})
  } catch (err) {
    next(err)
  }
  
}