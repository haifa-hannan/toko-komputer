//import library
const express = require('express')
const app = express() //implementasi app
app.use(express.json()) //express.json untuk mengambil tipe data json

//import model
const models = require("../models/index")
const transaksi = models.transaksi
const detail_transaksi = models.detail_transaksi

//import auth
const auth = require("../routes/auth")
app.use(auth) //harus login baru bisa akses endpoint

app.get("/", async (req, res) => {
    let result = await transaksi.findAll({
        include: [
            "customer",
            {
                model: models.detail_transaksi,
                as : "detail_transaksi",
                include: ["product"]
            }
        ]
    })
    res.json({
        transaksi: result
    })
})

app.get("/:customer_id", async (req, res) => {
    let param = { customer_id: req.params.customer_id}
    let result = await transaksi.findAll({
        where: param,
        include:[
            "customer",
            {
                model: models.detail_transaksi,
                as: "detail_transaksi",
                include: ["product"]
            }
        ]
    })
    res.json({
        transaksi: result
    })
})

app.post("/", async (req, res) =>{
    let current = new Date().toISOString().split('T')[0]
    let data = {
        customer_id: req.body.customer_id,
        waktu: current,
    }
    transaksi.create(data)
    .then(result => {
        let lastID = result.transaksi_id
        console.log(lastID)
        detail = req.body.detail_transaksi
        console.log(detail);        
        detail.forEach(element => {
            element.transaksi_id = lastID
        });
        detail_transaksi.bulkCreate(detail)
        .then(result => {
            res.json({
                message: "Data has been inserted"
            })
        })
        .catch(error => {
            res.json({
                message: error.message
            })
        })
    })
    .catch(error => {
        console.log(error.message);
    })
})

//delete
app.delete("/:transaksi_id", async (req, res) => {
    let param= { transaksi_id: req.params.transaksi_id}
    try {
        await detail_transaksi.destroy({where: param})
        await transaksi.destroy({where: param})
        res.json({
            message: "data has been deleted"
        })
    } catch (error) {
        res.json({
            message: error
        })
    }
})

module.exports = app

