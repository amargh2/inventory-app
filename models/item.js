const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const ObjectId = Schema.ObjectId

const ItemSchema = new Schema ({
  name: String,
  price: {type: Number, min: .01},
  description: String,
  number_in_stock: Number,
  category: String
})

ItemSchema
  .virtual('url')
  .get(function() {
    return `/catalog/item/${this._id}`
  })