import mongoose from "mongoose";
import db_name from "../../constrain.js";

const connectDb=async()=>{


    try {
        
     const connectionInstance= await  mongoose.connect(`${process.env.MONGODBURI}/${db_name}`)
        console.log(`mongodb connection successfully ${(connectionInstance).connection.host}`)
    } catch (error) {
        console.log("fali to connect mongodb", error)
        process.exit(1)
    }

}
export default connectDb
