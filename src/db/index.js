import mongoose from "mongoose";

const connectDB = async () => {
    try {
        const connectionInterface = await mongoose.connect(`${process.env.MONGO_URI}/${process.env.DB_NAME}`)
        console.log("Successfully Connected to Database !! host ", connectionInterface.connection.host);
        
    } catch (error) {
        console.log("MongoDB connection error ", error);
        process.exit(1);
    }
}

export { connectDB }