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

router.get('/products/:id/delete', itemController.deleteItemGET)

router.post('/products/:id/delete', itemController.deleteItemPOST)


router.get('/categories/:id/delete', itemController.deleteCategoryGET)

router.post('/categories/:id/delete', itemController.deleteCategoryPOST)
/*
// POST request for creating Book.
router.post("/book/create", book_controller.book_create_post);

// GET request to delete Book.
router.get("/book/:id/delete", book_controller.book_delete_get);

// POST request to delete Book.
router.post("/book/:id/delete", book_controller.book_delete_post);

// GET request to update Book.
router.get("/book/:id/update", book_controller.book_update_get);

// POST request to update Book.
router.post("/book/:id/update", book_controller.book_update_post);

// GET request for one Book.
router.get("/book/:id", book_controller.book_detail);

// GET request for list of all Book.
router.get("/books", book_controller.book_list); */

module.exports = router