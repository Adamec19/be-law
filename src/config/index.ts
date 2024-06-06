import { config } from "dotenv";

config({ path: process.env.ENV_PATH, override: true });

const configOptions = {
    env: process.env.NODE_ENV || "development",
    port: process.env.PORT || 8080,
    dbUrl: process.env.DB_CONNECT || "",
    apiUrl: process.env.API_URL || "",
    collectionNameLaw: process.env.COLLECTION_NAME_LAW || "",
    collectionNameUser: process.env.COLLECTION_NAME_USER || "",
    collectionNameJob: process.env.COLLECTION_NAME_JOB_POSITION || "",
    dbName: process.env.DB_NAME || "",
    appName: process.env.APP_NAME || "",
    mailPassword: process.env.MAIL_PASSWORD || "",
};

export default configOptions;
