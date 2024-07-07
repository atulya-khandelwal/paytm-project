const express = require('express')
const router = express.Router();
const zod = require('zod');
const { User, Account } = require('../db')
const jwt = require('jsonwebtoken')
const authMiddleware = require('../middleware')
const bcrypt = require('bcrypt')
require('dotenv').config()


const signupBody = zod.object({
    username: zod.string().email().trim().min(3).max(30),
    firstname: zod.string().trim().max(50),
    lastname: zod.string().trim().max(50),
    password: zod.string().min(6),
})

router.post('/signup', async(req,res)=>{
    const {success} = signupBody.safeParse(req.body)
    if(!success){ 
        return res.status(400).json({
            message: "Incorrect Inputs"
        })
    }

    const existingUser = await User.findOne({
        username: req.body.username
    })

    if(existingUser){
        return res.status(411).json({
            message: "Email already taken"
        })
    }
    const plainTextPassword = req.body.password;
    async function hashPassword(plainTextPassword){
        const saltRounds = 10;
        try{
            const salt = await bcrypt.genSalt(saltRounds);
            const hashedPassword = await bcrypt.hash(plainTextPassword, salt);
            return hashedPassword
        }catch(err){
            console.log("Error hashing password", err);
            throw err;
        }
    }

    const hashedPassword = await hashPassword(plainTextPassword)

    const user = await User.create({
        username: req.body.username,
        firstname: req.body.firstname,
        lastname: req.body.lastname,
        password: hashedPassword
    })

console.log(process.env.JWT_SCERET)

    const userId = user._id
    const account = await Account.create({
        userId,
        balance: 1+Math.random()*10000
    })

    const token = jwt.sign({
        userId
    },process.env.SECRET);

    res.status(200).json({
        message: "User created",
        token: token
    })
})

const signinBody = zod.object({
    username: zod.string().email(),
    password: zod.string(),
})


router.post('/signin', async(req,res)=>{
    const {username, password} = req.body;
    const { success } = signinBody.safeParse(req.body);
    if(!success){
        res.status(411).json({
            message: "Incorrect Inputs"
        })
    }

    const existingUser = await User.findOne({
        username,
    })

    if(!existingUser){
        return res.json(411).json({
            message: "User not found"
        })
    }

    async function validatePassword(plainTextPassword, hashedPassword) {
        try {
            const isMatch = await bcrypt.compare(plainTextPassword, hashedPassword);
            return isMatch;
        } catch (err) {
            console.error('Error validating password:', err);
            throw err;
        }
    }
    const plainTextPassword = req.body.password;
    const hashedPassword = existingUser.password;
    const validPassword = await validatePassword(plainTextPassword, hashedPassword)
  
    if(validPassword){
        const token = jwt.sign({
            userId: existingUser._id
        },process.env.SECRET)
        res.json({
            message: "User logged in",
            token: token,
        })
        return;
    } else{
        res.status(411).json({
            message: "Error while logged in"
        })
    }
})


const updateBody = zod.object({
    firstname: zod.string().optional(),
    lastname: zod.string().optional(),
    password: zod.string().optional()
})

router.put('/', authMiddleware,async(req,res)=>{
    const { success } = updateBody.safeParse(req.body);
    if(!success){
        res.status(411).json({
            message: "Incorrect Inputs"
        })
    }

    await User.updateOne({_id: req.userId}, req.body)

    res.json({
        message: "User updated"
    })
})

router.get('/bulk', async(req,res)=>{
    const filter = req.query.filter || "";
    const users = await User.find({
        $or:[{
            firstname: {
                $regex: filter,
            },
        },{
            lastname: {
            $regex: filter,
        }}]
    })

    res.json({
        user: users.map(user => ({
            username: user.username,
            firstname: user.firstname,
            lastname: user.lastname,
            _id: user._id
        }))
    })
})
module.exports = router