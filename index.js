import { app } from "./app.js";
import connectDb from "./src/db/index.js";
import dotenv from 'dotenv';

dotenv.config()


connectDb()
.then(()=>{
    app.listen(process.env.PORT || 3000,()=>{
        console.log(`server runing on ${process.env.PORT} port`)
    })
})
.catch((error)=>{
console.log(` mongodb connection failed ${error}`)
app.on((err)=>{
    console.log(err)
    throw err
})
})
