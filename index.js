const express = require('express');
require('dotenv').config();
require('colors');
const { MongoClient, ObjectId } = require('mongodb');
const cors = require('cors');
const app = express();
const port = process.env.PORT || 5000;

//middleware
app.use(cors());
app.use(express.json());


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.cg7riyw.mongodb.net/?retryWrites=true&w=majority`;

const client = new MongoClient(uri);

async function dbConnect() {
    try {
        await client.connect();
        console.log('Db connected'.yellow);
    } catch (error) {
        console.log(error.name.bgRed, error.message, error.stack);
    }
}

dbConnect();

const bookingCollection = client.db("doctorDB").collection("bookings");

//endpoint/express routes

app.get('/bookings', async (req, res) => {
    try {
        console.log(req.query.email);
        let query = {};
        if (req.query?.email) {
            query = { email: req.query.email }
        }
        const result = await bookingCollection.find(query).toArray();
        console.log(result);
        res.send({
            success: true,
            message: 'Successfully got the Booking',
            data: result
        })
    } catch (error) {
        console.log(error.name.bgRed, error.message, error.stack);
        res.send({
            success: false,
            error: error.message
        })
    }
})

app.get('/bookings/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const result = await bookingCollection.findOne({ _id: new ObjectId(id) });
        res.send({
            success: true,
            data: result
        })
    } catch (error) {
        res.send({
            success: false,
            error: error.message
        })
    }
})

app.post('/bookings', async (req, res) => {
    try {
        const result = await bookingCollection.insertOne(req.body);
        if (result.insertedId) {
            res.send({
                success: true,
                message: `Successfully created the ${req.body.name} with id ${result.insertedId}`
            })
        }
        else {
            res.send({
                success: false,
                message: "Couldn't create the Booking"
            })

        }
    } catch (error) {
        console.log(error.name.bgRed, error.message, error.stack);
        res.send({
            success: false,
            error: error.message
        })
    }
})

app.patch('/bookings/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const result = await bookingCollection.updateOne({ _id: new ObjectId(id) }, { $set: req.body })
        if (result.modifiedCount) {
            res.send({
                success: true,
                message: `Successfully Updated ${req.body.name}`
            })
        }
        else {
            res.send({
                success: false,
                error: "Couldn't update the Booking"
            })
        }
    } catch (error) {
        res.send({
            success: false,
            error: error.message
        })
    }
})

app.delete('/bookings/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const booking = await bookingCollection.findOne({ _id: new ObjectId(id) });
        if (!booking?._id) {
            res.send({
                success: false,
                message: "Product doesn't exist"
            })
            return;
        }

        const result = await bookingCollection.deleteOne({ _id: new ObjectId(id) });
        if (result.deletedCount) {
            res.send({
                success: true,
                message: `Successfully deleted the ${booking?.name}`,
            })
        }
    } catch (error) {
        console.log(error.name.bgRed, error.message, error.stack);
        res.send({
            success: false,
            error: error.message
        })
    }
})




const services = require('./data/services.json');


app.get('/', (req, res) => {
    res.send('Doctor Server running')
})

app.get('/services', (req, res) => {
    res.send(services)
})
app.get('/services/:id', (req, res) => {
    const { id } = req.params;
    const seletedService = services.find(service => parseInt(service.id) === parseInt(id))
    res.send(seletedService);
})

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})