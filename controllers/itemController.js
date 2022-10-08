var Item = require('../models/item');
var Category = require('../models/category');
const {body, validationResult} = require('express-validator');
var async = require('async');
const { find } = require('../models/item');
const item = require('../models/item');
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

//GET category list page
exports.listCategories = async function(req, res, next) {
  try {
    const categories = await Category.find({})
      .sort({name: 1})
    res.render('categories', {title: 'Categories', categories_list: categories})
  } catch (err){
    next(err)
  }
}

//GET items by user clicked category
exports.categoryItems = async function(req, res, next) {
  try {
    const id = req.params.id;
    const items = await Item.find({category: id})
    const category = await Category.findById(id)
    res.render('category_items_list', {title: `${category.name}`, items:items})
  } catch (err) {
    next(err)
  }
}

//GET item detail
exports.itemDetail =async function(req, res, next) {
  try {
  const id = req.params.id;
  const item = await Item.findById(id)
    .populate('category')
  res.render('item_detail', {title: 'Product Details', item_details:item})
  } catch (err) {
    next(err)
  }
}

exports.createItemGET = async function (req, res, next) {
  try {
    var categories = await Category.find({})
    res.render('create_item', {title:'Add an Item', categories:categories});
  } catch (err) {
    next(err)
  }
}

exports.createItemPOST = async function (req, res, next) {

  body("name", "Nitle must not be empty.")
    .trim()
    .isLength({ min: 1 })
    .escape(),
  body("description", "Description must not be empty.")
    .trim()
    .isLength({ min: 1 })
    .escape(),
  body("price", "Price must be a valid integer.")
    .trim()
    .isLength({ min: 1 })
    .isInt()
    .escape(),
  body("number_in_stock", "Must be a valid integer.").trim().isLength({ min:1}).escape(),
  body("category").escape(),
  (req, res) => {
    const errors=validationResult(req)
    if (!errors.isEmpty()) {
      res.render('create_item', {
        title:'Add an Item',
        errors:errors,
      })
    }
  }
  
  const category = await Category.find({name: req.body.category}, 'id')
    var item = new Item ({
      name: req.body.name,
      description: req.body.description,
      price: parseInt(req.body.price),
      number_in_stock: parseInt(req.body.number_in_stock),
      category: category[0]
    })
  
  item.save(function (err) {
    if (err) {
      next(err)
    } else {
      res.redirect(item.url)
    }
  })
}

exports.createItemPOST2 = async function (req, res, next) {
  // Validate and sanitize fields.
  body("name", "Name must not be empty.")
    .trim()
    .isLength({ min: 1 })
    .escape(),
  body("description", "Description must not be empty.")
    .trim()
    .isLength({ min: 1 })
    .escape(),
  body("price", "Price must be a valid integer.")
    .trim()
    .isLength({ min: 1 })
    .isEmail()
    .escape()
  body("number_in_stock", "Must be a valid integer.").trim().isLength({ min:1}).escape(),
  body("category").escape(),
  next()
  // Process request after validation and sanitization.
    // Extract the validation errors from a request.
    const errors = validationResult(req);

    // Create a Book object with escaped and trimmed data.
    var item = new Item({
      title: req.body.name,
      description: req.body.description,
      price: parseInt(req.body.price),
      number_in_stock: parseInt(req.body.number_in_stock),
      category: req.body.category._id,
    });

    if (!errors.isEmpty()) {
      // There are errors. Render form again with sanitized values/error messages.

      // Get all authors and genres for form.
      res.render("create_item", {
        title: "Add an Item",
        errors: errors.array(),
      });
      return;
    } else {
      // Data from form is valid. Save book.
      item.save(function (err) {
        if (err) {
          return next(err);
        }
        // Successful - redirect to new book record.
        res.redirect(item.url);
      });
    }
  }

  exports.categoryCreateGET = function (req, res, next) {
    res.render('create_category', {title: 'Add a New Category'})
  }

  exports.categoryCreatePOST = async function(req, res, next) {
    try {
      body('name', 'Name must not be empty.')
        .trim()
        .isLength({min: 1})
        .escape()
      body('description', 'Description must not be empty.')
        .trim()
        .isLength({min: 1})
        .escape()
      const errors = validationResult(req)
      //check for errors, if errors return to the form with populated fields
      // else create and save the new category
      if (!errors.isEmpty()) {
        res.render('create_category')
      } else {
        const category = new Category({
          name: req.body.name,
          description: req.body.description
        })
        category.save()
        const categories = await Category.find({}).sort({name:1})
        res.render('categories', {title:'Categories', categories_list: categories})
      }

    } catch (err) {
      next(err)
    }
  }

  exports.deleteItemGET = async function(req, res, next) {
    
    try {
      const itemForDeletion = await Item.findById(req.params.id)
      res.render('delete_item', {title: `Delete ${itemForDeletion.name}?`, 
      item: itemForDeletion})
    } catch (error) {
      next(error)
    }
  }

  exports.deleteItemPOST = async function(req, res, next) {
    try {
      async.parallel (
        {
          delete_item: function(callback) {
            Item.deleteOne({_id:req.params.id}, callback)
          },
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
            data: results
          })
        }
      )
    } catch (error) {
      next(error)
    }
    
  }