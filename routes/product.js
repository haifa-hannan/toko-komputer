const express = require('express')
const req = require('express/lib/request')
const app = express()
app.use(express.json())

const multer = require("multer")
const path = require("path")
const fs = require("fs")

const models = require("../models/index")
//const req = require('express/lib/request')
const product = models.product

//import auth
const auth = require("../routes/auth")
app.use(auth) //harus login baru bisa akses endpoint


const storage = multer.diskStorage({
    destination:(req, file, cb) => {
        cb(null, "./image/product")
    },
    filename: (req, file, cb) => {
        cb(null, "img-" + Date.now() + path.extname(file.originalname))
    }
})
let upload = multer({storage: storage})

app.get("/", (req, res) => {
    product.findAll()
    .then(result => {
        res.json({
            product: result
        })
    })
    .catch(error => {
        res.json({
            message: error.message
        })
    })
})

app.get("/:product_id", (req, res) => {
    product.findOne({ where: {product_id: req.params.product_id}})
    .then(result => {
        res.json({
            product: result
        })
    })
    .catch(error => {
        res.json({
            message: error.message
        })
    })
})

app.post("/", upload.single("image"), (req,res) => {
    if(!req.file) {
        res.json({
            message: "No uploaded file"
        })
    } else {
        let data = {
            name: req.body.name,
            price: req.body.price,
            stock: req.body.stock,
            image: req.file.filename,
        }
        product.create(data)
        .then(result => {
            res.json({
                message: "data has been inserted"
            })
        })
        .catch(error => {
            res.json({
                message: error.message
            })
        })
    }
})

app.put("/:id", upload.single("image"), (req, res) => {
    let param = {product_id: req.params.id}
    let data = {
        name: req.body.name,
        price: req.body.price,
        stock: req.body.stock,
        image: req.file.filename
    }
    if (req.file) {
        const row = product.findOne({where: param})
        .then(result => {
            let oldFileName = result.image
            let dir = path.join(__dirname, "../image/product", oldFileName)
            fs.unlink(dir, err => console.log(err))
        })
        .catch(error => {
            console.log(error.message)
        })
        data.image = req.file.filename
    }
    product.update(data, {where: param})
        .then(result => {
            res.json({
                message: "data has been updated",
            })
        })
        .catch(error => {
            res.json({
                message: error.message
            })
        })
})

app.delete("/:id", async (req,res) => {
    try {
        let param = { product_id: req.params.id}
        let result = await product.findOne({where: param})
        let oldFileName = result.image

        let dir = path.join(__dirname, "../image/product", oldFileName)
        fs.unlink(dir,err => console.log(err))

        product.destroy({where: param})
        .then(result => {
            res.json({
                message: "data has been deleted",
            })
        })
        .catch(error => {
            res.json({
                message: error.message
            })
        })
    } catch (error){
        res.json({
            message: error.message
        })
    }
})

module.exports = app