const express = require("express");
const app = express();
const { Pool } = require("pg");
const port = 3005;
const bodyParser = require("body-parser");

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'item_master',
    password: 'admin',
    port: 5432,
    max: 10
});

app.get("/",(req,res)=>{
    res.send("Hello World");
})

app.listen(port, (err) => {
    if (err) console.log(err);
    console.log(`Server is running on port : ${port}`);
});

// Connect to database
pool.connect((err) => {
    if (err) console.log(err);
    else console.log(`Database connected successfully`);
});

// Get all items
app.get("/items", async (req, res) => {
    try {
        const sql = "SELECT * FROM items";
        const result = await pool.query(sql);
        res.status(200).json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Add a new item
app.post("/items", async (req, res) => {
    const { name, type, quantity } = req.body;
    const sql = "INSERT INTO items (name, type, quantity) VALUES ($1, $2, $3) RETURNING *";
    try {
        const result = await pool.query(sql, [name, type, quantity]);
        res.status(201).json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Update an item
app.patch("/items/:itemId", async (req, res) => {
    const item_id = Number(req.params.itemId);
    const { name, type, quantity } = req.body;
    const sql = "UPDATE items SET name=$1, type=$2, quantity=$3 WHERE itemId=$4";
    try {
        await pool.query(sql, [name, type, quantity, item_id]);
        res.status(200).send(`Item updated for itemId: ${item_id}`);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Delete an item
app.delete("/items/:itemId", async (req, res) => {
    const item_id = Number(req.params.itemId);
    const sql = "DELETE FROM items WHERE itemId=$1";
    try {
        await pool.query(sql, [item_id]);
        res.status(200).send(`Item deleted with itemId: ${item_id}`);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});
