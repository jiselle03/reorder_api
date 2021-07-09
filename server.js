import express from 'express';
import mongodb from 'mongodb';
import dotenv from 'dotenv';

const app = express();
dotenv.config();

// Database connection
const MongoClient = mongodb.MongoClient;

const connectionString = process.env.DB_URL;

MongoClient.connect(connectionString, { useUnifiedTopology: true })
  .then(client => {
    console.log('Connected to Database');
    const db = client.db('reorder_api');

    const itemsCollection = db.collection('items');

    // Middleware
    app.use(express.json());
    app.use(express.urlencoded({ 
      extended: true, 
    }));

    // Routes
    app.get('/items', (req, res) => {
      db.collection('items').find().toArray()
        .then(items => {
          res.json({ items: items });
        })
        .catch(error => console.error(error));
    });

    app.post('/items', (req, res) => {
      itemsCollection.insertOne(req.body)
        .then(result => {
          res.json({ items: result.ops })
        })
        .catch(error => console.error(error));
    });

    app.delete('/items', (req, res) => {
      itemsCollection.deleteOne({ _id: mongodb.ObjectId(req.body._id) })
        .then(() => {
          res.json({ status: 200 });
        })
        .catch(error => console.error(error))
    })

    // Listen
    app.listen(3000, () => {
      console.log('listening on 3000');
    });
})
.catch(console.error);
