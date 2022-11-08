const createError = require('http-errors');
const Product = require('../Models/Product.model');
var sanitizer = require('sanitize')();
const { check } = require('express-validator');

//if time permits connection settings will be moved to another js file
const { MongoClient } = require('mongodb');
var mongoUrl = "mongodb+srv://sarkar:Sarkar2022@cluster0.bxrrt.mongodb.net/PaymentGateway?retryWrites=true&w=majority";
const client = new MongoClient(mongoUrl);


module.exports = {
  getAllProducts: async (req, res, next) => {
    try {
      await client.connect();
      //const results = await client.db("PaymentGateway").collection("customerTransactions").find(  { $or: [ { status: 'COMPLETED' }, { status: 'IN PROGRESS' } ] } ).toArray();
      //const results = await client.db("PaymentGateway").collection("customerTransactions").find({ status: { $nin: ["COMPLETED", "IN PROGRESS", "REJECTED"] } }).toArray();

      const results = await client.db("PaymentGateway").collection("customerTransactions").find({ status: { $nin: ["REJECTED"] } }).toArray(); // CHANDRA TESTING ONLY

      //const results = await client.db("PaymentGateway").collection("customerTransactions").findOne({ status: 'COMPLETED'});
      res.send(results);
    } catch (error) {
      res.send(error.message);
      //console.log(error.message);
    }
  },

  createNewProduct: async (req, res, next) => {
    try {
      const product = new Product(req.body);
      const result = await product.save();
      res.send(result);
    } catch (error) {
      console.log(error.message);
      if (error.name === 'ValidationError') {
        next(createError(422, error.message));
        return;
      }
      next(error);
    }

    /*Or:
  If you want to use the Promise based approach*/
    /*
  const product = new Product({
    name: req.body.name,
    price: req.body.price
  });
  product
    .save()
    .then(result => {
      console.log(result);
      res.send(result);
    })
    .catch(err => {
      console.log(err.message);
    }); 
    */
  },

  findProductById: async (req, res, next) => {
    const id = req.params.id;
    //const id = sanitizer.value(req.params.id).isString();
    try {
      await client.connect();
      const product = await client.db("PaymentGateway").collection("customerTransactions").findOne({ id: id});
      //const product = await Product.findById(id);
      // const product = await Product.findOne({ _id: id });
      if (!product) {
        throw createError(404, 'Product does not exist.');
      }
      res.send(product);
    } catch (error) {
      console.log(error.message);
      /*if (error instanceof mongoose.CastError) {
        next(createError(400, 'Invalid Product id'));
        return;
      }*/
      next(error);
    }
  },

  updateAProduct: async (req, res, next) => {
    try {
      const id = sanitizer.value(req.params.id, 'number');
      //const id = req.params.id;
      const updates = req.body;
      const options = { new: true };

      const result = await Product.findByIdAndUpdate(id, updates, options);
      if (!result) {
        throw createError(404, 'Product does not exist');
      }
      res.send(result);
    } catch (error) {
      console.log(error.message);
      if (error instanceof mongoose.CastError) {
        return next(createError(400, 'Invalid Product Id'));
      }

      next(error);
    }
  },

  deleteAProduct: async (req, res, next) => {
    const id = req.params.id;
    try {
      const result = await Product.findByIdAndDelete(id);
      // console.log(result);
      if (!result) {
        throw createError(404, 'Product does not exist.');
      }
      res.send(result);
    } catch (error) {
      console.log(error.message);
      if (error instanceof mongoose.CastError) {
        next(createError(400, 'Invalid Product id'));
        return;
      }
      next(error);
    }
  }
};
