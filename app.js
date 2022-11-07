const express = require('express');
const createError = require('http-errors');
const dbUtil = require('./initMongoDB');
const dotenv = require('dotenv').config();

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// TODO:Initialize DB
//require('./initDB')();
//dbUtil.init();

const ProductRoute = require('./Routes/Product.route');
app.use('/products', ProductRoute);

//404 handler and pass to error handler
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Origin", "http://localhost:4200",always);
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");    
  /*
  const err = new Error('Not found');
  err.status = 404;
  next(err);
  */
  // You can use the above code if your not using the http-errors module
  next(createError(404, 'Not found'));
});

//Error handler
app.use((err, req, res, next) => {
  res.status(err.status || 500);
  res.send({
    error: {
      status: err.status || 500,
      message: err.message
    }
  });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log('CSP Patidar Server started on port ' + PORT + '...');
});
