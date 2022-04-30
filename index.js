const express = require('express');
const app = express();
 const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const cors = require('cors');
require('dotenv').config()
const port = process.env.PORT || 5000;



// two significant middleware here ..............................................
app.use(cors())
app.use(express.json())

//Mongodb connection code here ....................................................
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.sow4u.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });
 console.log(uri);
//https://serene-headland-23680.herokuapp.com/products

// function for all rest api code here..............................................
async function run() {
    try {
        await client.connect(); 
        const userCollection = client.db('kidsStore').collection('products')
        const salesCollection = client.db('kidsStore').collection('sales')
        const ordersCollection = client.db('kidsStore').collection('orders')

        //get products REST API code here ..........................................
        app.get('/products', async(req, res)=>{
            const query = {}
            const cursor = userCollection.find(query)
            const result = await cursor.toArray()
            res.send(result)
        })
        app.get('/products/:id', async(req, res)=>{
            const id = req.params.id
            const query = {_id: ObjectId(id)}
            const result = await userCollection.findOne(query)
            res.send(result)
        })

        // sales growth data usages api here.......................................
        app.get('/sales', async(req, res)=>{
            const query = {}
            const cursor = salesCollection.find(query)
            const result = await cursor.toArray()
            res.send(result)
        })

        //to get user id from url ................
        // app.get('/user/:id', async(req, res) => {
        //     const id = req.params.id;
        //     const query = {_id: ObjectId(id)}
        //     const result = await userCollection.findOne(query)
        //     res.send(result)
        //   })


        //get data from client side and send it to mongodb
        app.post('/product', async(req, res)=>{
            const newProduct = req.body;
            // console.log(newProduct);
            const result = await userCollection.insertOne(newProduct)
            res.send(result)
        })
        //wishlist product added api .....................................
        app.post('/order', async(req, res)=>{
            const order = req.body;
            // console.log(newProduct);
            const result = await ordersCollection.insertOne(order)
            res.send(result)
        })

        //wish list get data from mongodb to end user
        app.get('/order', async(req, res)=>{
            const email = req.query.email
            // console.log(email)
            const query = {userEmail: email}
            const cursor = ordersCollection.find(query)
            const result = await cursor.toArray()
            res.send(result)
        })

        // //user update api code here 
        app.put('/update/:id', async(req, res)=>{
            const id = req.params.id
            const updateStock = req.body;
            const filter = {_id:ObjectId(id)}
            const options = {upsert:true}
            const upDateDoc = {
                $set:{
                    quantity:updateStock.quantity,
                }
            }

            const result = await userCollection.updateOne(filter,upDateDoc,options)
            res.send(result)
        })
        //updata all information about stock product
        app.put('/updateAll/:id', async(req, res)=>{
            const id = req.params.id
            const updateStock = req.body;
            const filter = {_id:ObjectId(id)}
            const options = {upsert:true}
            const upDateDoc = {
                $set:{
                    name:updateStock.name,
                    quantity:updateStock.quantity,
                    image:updateStock.image,
                    supplier:updateStock.supplier,
                    Description:updateStock.Description
                }
            }

            const result = await userCollection.updateOne(filter,upDateDoc,options)
            res.send(result)
        })

        //delete from database and client side 
        app.delete('/product/:id', async(req, res)=>{
            var id = req.params.id;
            const query = {_id: ObjectId(id) };
            const result = await userCollection.deleteOne(query);
            res.send(result)
        })


        console.log('all api is running');
    }
    finally { }
}

run().catch(console.dir)


//initial api......................................................................
app.get('/', (req, res) => {
    res.send('Node js is ready to work...........')
})


//port listen to server.............................................................
app.listen(port, () => {
    console.log('ToyStore operation is running on the PORT::', port)
})