const express = require("express");
const mainRouter = require('./routes/index')
const cors = require('cors')
require('dotenv').config();

const app = express();
app.use(cors())
app.use(express.json());
app.use('/api/v1', mainRouter)

const PORT = process.env.PORT

app.listen(PORT,()=> console.log(`app is listening on port: ${PORT}`))