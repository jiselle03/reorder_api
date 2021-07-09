import express from 'express';

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ 
  extended: true, 
}));

// Routes


// Listen
app.listen(3000, function() {
  console.log('listening on 3000')
});
