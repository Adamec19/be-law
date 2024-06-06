import mongoose from "mongoose";
import { config } from "dotenv";
import configOptions from "../config";

export async function connectToDatabase() {
    config();
    mongoose.connect(configOptions.dbUrl, {
        appName: configOptions.appName,
        dbName: configOptions.dbName,
    });
}
