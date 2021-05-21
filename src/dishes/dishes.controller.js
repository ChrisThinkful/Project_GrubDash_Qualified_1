const path = require("path");

// Use the existing dishes data
const dishes = require(path.resolve("src/data/dishes-data"));

// Use this function to assign ID's when necessary
const nextId = require("../utils/nextId");

// TODO: Implement the /dishes handlers needed to make the tests pass


// Middleware

// Does dish exist?
function dishExists(req,res,next) {
    const dishId = req.params.dishId;
    const foundDish = dishes.find((dish) => dish.id === dishId);

    if (foundDish) {
        res.locals.dish = foundDish;
        res.locals.dishId = dishId
        return next();
    }
    return next({
        status: 404,
        message: `Dish id not found: ${req.params.dishId}.`
    });
}

// Does the dish have the required fields?
function validDish(req,res,next) {
    const requiredFields = ['name','description','price','image_url']
    for (const field of requiredFields) {
        if(!req.body.data[field]) {
            next({
                status: 400,
                message: `Dish must include ${field}.`
            })
            return;
        }
    }
    next();
}

// Price is greater than zero and a number
function validPrice(req,res,next) {
    if (req.body.data.price < 0 || typeof req.body.data.price !== 'number') {
        return next({
            status: 400,
            message: `Field 'price' must be a number above zero.`
        })
    }
    next();
}

// Id exists and matches the dish ID
function validId(req,res,next) {
    if (req.body.data.id && req.body.data.id !== res.locals.dishId) {
        return next({
            status: 400,
            message: `id ${req.body.data.id} does not match ${res.locals.dishId}.`
        });
    }
    next();
}

// CRUD

function list(req,res,next) {
    res.json({ data: dishes });
}

function create(req,res,next) {
    const { data: { name, price, description, image_url } = {} } = req.body;
    const newDish = {
        id: nextId(),
        name,
        price,
        description,
        image_url,
    };
    dishes.push(newDish);
    res.status(201).json({ data: newDish });
}

function read(req,res,next) {
    res.json({ data: res.locals.dish });
}

function update(req,res,next) {
    const { data: { name, price, description, image_url } = {} } = req.body;

    res.locals.dish.name = name;
    res.locals.dish.price = price;
    res.locals.dish.description = description;
    res.locals.dish.image_url = image_url;

    res.json({ data: res.locals.dish })
}

module.exports = {
    list,
    create: [
        validDish, 
        validPrice, 
        validId, 
        create
    ],
    read: [
        dishExists, 
        read
    ],
    update: [
        dishExists, 
        validDish, 
        validPrice, 
        validId, 
        update
    ]
}