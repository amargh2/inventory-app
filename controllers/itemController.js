var Item = require('../models/item');
var Category = require('../models/category');
const {body, validationResult} = require('express-validator');
var async = require('async');
const { find, findById, findByIdAndDelete, findByIdAndUpdate } = require('../models/item');
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

//GET items by user clicked category and list category details
exports.categoryDetails = async function(req, res, next) {
  try {
    const id = req.params.id;
    const items = await Item.find({category: id})
    const category = await Category.findById(id)
    res.render('category_items_list', {title: `${category.name}`, items:items, category:category})
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

  body("name", "Title must not be empty.")
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

  exports.deleteCategoryGET = async function(req, res, next) {
    try {
      const category = await Category.findById(req.params.id)
      const items = await Item.find({category: req.params.id}) 
      if (items[0] === undefined) {
        res.render('delete_category', {title: 'Delete Category', category:category})
      }
      else {
        res.render('delete_category', {title: 'Delete Category', category:category, items:items})
      }
    } catch (error) {
      next(error)
    }
  }

  exports.deleteCategoryPOST = async function(req, res, next) {
    try {
      await Category.findByIdAndDelete(req.params.id);
      const categories = await Category.find({});
      res.render('categories', {title:'Categories', categories_list:categories})
    } catch (error) {
      next(error)
    }
  }

  exports.updateItemGET = async function (req, res, next) {
      try {
        const categories = await Category.find({});
        const item = await Item.findById(req.params.id)
          .populate('category');
        res.render('item_update', {
          title:'Update Item', 
          item:item, 
          categories:categories})
      } catch (error) {
        next(error)
      }
  }

  exports.updateItemPOST = async function (req, res, next) {
    body("name", "Title must not be empty.")
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
    var item = ({
      name: req.body.name,
      description: req.body.description,
      price: parseInt(req.body.price),
      number_in_stock: parseInt(req.body.number_in_stock),
      category: category[0]
    })
  
  try {
    await Item.findByIdAndUpdate(req.params.id, item)
    res.render('item_detail', {
      item_details: await Item.findById(req.params.id)
    }) 
  } catch (err) {
    res.render('item_update', {
      title:'Update Item',
      item:item,
      errors:err,
      categories: await Category.find({})
    })    
  }
}

  /*exports.updateItemPOST = async function (req, res, next) {
    try    
    { 
      body("name", "Title must not be empty.")
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
        res.render('edit_item', {
          title:'Edit Item',
          errors:errors,
        })
      }
    }

    const category = await Category.find({name: req.body.category}, 'id')
      var item = ({
        name: req.body.name,
        description: req.body.description,
        price: parseInt(req.body.price),
        number_in_stock: parseInt(req.body.number_in_stock),
        category: category[0]
      })}
      catch (error) {
        next(error)
      }
    
    
} */