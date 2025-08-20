import {connect} from "mongoose";

const connectDB = async () => {
    try {
        await connect(process.env.MONGO_URI);
        console.log("connected to db");
    } catch (error) {
        console.log("error connecting to db", error);
    }
}

export default connectDB;