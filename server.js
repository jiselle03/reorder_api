import express from 'express';
import mongodb from 'mongodb';
import dotenv from 'dotenv';
import cors from 'cors';

const app = express();
dotenv.config();

// Database connection
const MongoClient = mongodb.MongoClient;

const connectionString = process.env.DB_URL;

MongoClient.connect(connectionString, { useUnifiedTopology: true })
  .then(client => {
    console.log('Connected to Database');
    const db = client.db('reorder_api');

    const listsCollection = db.collection('lists');

    // Middleware
    app.use(express.json());
    app.use(express.urlencoded({ 
      extended: true, 
    }));

    const corsOptions = {
      origin: process.env.CORS_DOMAIN,
      optionsSuccessStateus: 200,
    };
    app.use(cors(corsOptions));

    // Seed
    const populateDB = () => {
      let listItems = [];
    
      for (let i = 0; i < 100; i++) {
        listItems.push(`Item ${i+1}`);
      };

      listsCollection.insertOne({items: listItems});
    };
    
    // Populate DB if no entries
    listsCollection.countDocuments((err, count) => {
      if (!err && count === 0) populateDB();
    });

    // Routes
    // Create new list
    app.post('/lists', (req, res) => {
      listsCollection
        .insertOne({items: req.body})
        .then(result => {
          res.json(result.ops[0]);
        })
        .catch(error => console.error(error));
    });

    // Get all lists
    app.get('/lists', (req, res) => {
      listsCollection
        .find()
        .toArray()
        .then(items => res.json(items))
        .catch(error => console.error(error));
    });

    // Get one list
    app.get('/lists/:_id', (req, res) => {
      listsCollection
        .findOne({ _id: mongodb.ObjectId(req.params._id) })
        .then(items => {
          res.json(items);
        })
        .catch(error => console.error(error));
    });

    // Add item to list
    app.put('/lists/:_id', (req, res) => {
      listsCollection
        .updateOne(
          { 
            _id: mongodb.ObjectId(req.params._id),
          },
          {
            $addToSet: { 
              items: req.body.item,
            },
          },
        )
        .then(res.json({ status: 200 }))
        .catch(error => console.error(error));
    });

    // Reorder items
    app.put('/lists/:_id/reorder', (req, res) => {
      const bulk = listsCollection.initializeUnorderedBulkOp();
      bulk
        .find( {  _id: mongodb.ObjectId(req.params._id) } )
        .updateOne(
          {
            "$pull": { 
              "items": { 
                "$in": [req.body.item],
              },
            },
          },
        );
      bulk
        .find( {  _id: mongodb.ObjectId(req.params._id) } )
        .updateOne(
          {
            "$push": {
              "items": {
                "$each": [req.body.item],
                "$position": req.body.position,
              },
            },
          },
        );
      bulk
        .find({ _id: mongodb.ObjectId(req.params._id) });
      bulk
        .execute()
        .then(res.json({ status: 200}))
        .catch(error => console.error(error));
    });

    // Remove item
    app.put('/lists/:_id/remove', (req, res) => {
      listsCollection
        .updateOne(
          { 
            _id: mongodb.ObjectId(req.params._id), 
          },
          {
            $pull: { 
              items: { 
                $in: [req.body.item],
              },
            },
          },
        )
        .then(res.json({ status: 200 }))
        .catch(error => console.error(error));
    });

    // Delete list
    app.delete('/lists/:_id', (req, res) => {
      itemsCollection.deleteOne({ _id: mongodb.ObjectId(req.params._id) })
        .then(res.json({ status: 200 }))
        .catch(error => console.error(error))
    })

    // Listen
    app.listen(3000, () => {
      console.log('listening on 3000');
    });
})
.catch(console.error);
