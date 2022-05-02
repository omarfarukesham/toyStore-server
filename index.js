const express = require('express');
const app = express();
 const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
 const jwt = require('jsonwebtoken');
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


        //login jwt server access token api here...................................
        app.post('/login', async(req, res)=>{
            const email = req.body;
            console.log(email);
            const token = jwt.sign(email, process.env.ACCESS_TOKEN_KEY);
            res.send({ token })
           
        })
     
        //get products REST API code here ..........................................
        app.get('/products', async(req, res)=>{
            const query = {}
            const cursor = userCollection.find(query)
            const result = await cursor.limit(6).toArray()
            res.send(result)
        })
        app.get('/products/:id', async(req, res)=>{
            const id = req.params.id
            const query = {_id: ObjectId(id)}
            const result = await userCollection.findOne(query)
            res.send(result)
        })

         //product load api from mongodb ..................................
         app.get('/product', async (req, res) => {
            const query = {}
            const page = parseInt(req.query.page);
            const size = parseInt(req.query.size);
            const cursor = userCollection.find(query)

            let products;
            if(page || size){
                products = await cursor.skip(page*size).limit(size).toArray()
            }else{
                 products = await cursor.toArray()
            }
           
            res.send(products)
        })

        //server data counting api .......................................
        app.get('/productCount', async(req, res)=>{
            const count = await userCollection.estimatedDocumentCount()
            res.send({count})
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
            const tokenInfo = req.headers.authorization;
            // console.log(tokenInfo)
            const [email, accessToken] = tokenInfo.split(" ")
             console.log(email, accessToken)

            const decoded = verifyToken(accessToken)
            if(email===decoded.email){
                const result = await userCollection.insertOne(newProduct)
                res.send(result)
            }else{
                res.send({success :'Unauthorized Email........'})
            }

           
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
        //remove from database and client side of wishlist.....................
        app.delete('/removeOrder/:id', async(req, res)=>{
            var id = req.params.id;
            const query = {_id: ObjectId(id) };
            const result = await ordersCollection.deleteOne(query);
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


function verifyToken(token) {
    let email;
    jwt.verify(token, process.env.ACCESS_TOKEN_KEY, function (error, decoded) {
        if (error) {
            email = 'Invalid email'
        }
        if (decoded) {
            console.log(decoded)
            email = decoded
        }
    });
    return email;
}