var itemController = require('../controllers/itemController')
var express = require("express");
var router = express.Router();

// GET catalog home page.
router.get("/", itemController.index);

//GET products list page
router.get('/products', itemController.itemList)

// GET request for creating a Book. NOTE This must come before routes that display Book (uses id).
router.get("/products/create", itemController.createItemGET);

//POST request to create an item
router.post('/products/create', itemController.createItemPOST)

//GET specific item page
router.get('/products/:id', itemController.itemDetail)

//GET category add form
router.get('/categories/create', itemController.categoryCreateGET)

//POST category add form
router.post('/categories/create', itemController.categoryCreatePOST)

//GET list of categories
router.get('/categories', itemController.listCategories)

// GET list of items by category
router.get('/categories/:id', itemController.categoryDetails)
// GET delete item page
router.get('/products/:id/delete', itemController.deleteItemGET)
// POST delete item
router.post('/products/:id/delete', itemController.deleteItemPOST)
//GET category delete page
router.get('/categories/:id/delete', itemController.deleteCategoryGET)
//POST category delete
router.post('/categories/:id/delete', itemController.deleteCategoryPOST)
//GET update item page
router.get('/products/:id/update', itemController.updateItemGET)
//POST update of item
router.post('/products/:id/update', itemController.updateItemPOST)


module.exports = router