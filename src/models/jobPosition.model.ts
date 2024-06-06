import { Schema, model } from "mongoose";
import { v4 as uuidv4 } from "uuid";
import { Status } from "./lawOffices.model";
import configOptions from "../config";

require("dotenv").config();

export enum ContractType {
    HPP = "HPP",
    SALARY_HELP = "SALARY_HELP",
    UNPAID_HELP = "UNPAID_HELP",
}

export enum TimeDemand {
    FREE = "FREE",
    REGULAR = "REGULAR",
    IRREGULAR = "IRREGULAR",
}

export interface JobPosition {
    title: string;
    jobTitle: string;
    companyName: string;
    jobDescription: string;
    otherConditions: string;
    contractType: ContractType;
    boardingDate: string;
    hourSalary: string;
    location: string;
    companyAddress: string;
    region: number;
    contactPerson: string;
    contactEmail: string;
    contactPhone: string;
    timeDemand: TimeDemand;
    hashId: string;
    status: Status;
}

const JobPositionSchema = new Schema<JobPosition>(
    {
        title: {
            type: String,
            required: [true, "title should not be empty!"],
        },
        status: {
            type: String,
            enum: Object.values(Status),
            default: Status.PENDING,
            required: [true, "Status should not be empty!"],
        },
        jobTitle: {
            type: String,
            required: [true, "jobTitle should not be empty!"],
        },
        companyName: {
            type: String,
            required: [true, "companyName should not be empty!"],
        },
        jobDescription: {
            type: String,
            required: [true, "jobDescription should not be empty!"],
        },
        otherConditions: {
            type: String,
        },
        contractType: {
            type: String,
            enum: Object.values(ContractType),
            required: [true, "contractType should not be empty!"],
        },
        boardingDate: {
            type: String,
            required: [true, "boardingDate should not be empty!"],
        },
        hourSalary: {
            type: String,
            required: [true, "hourSalary should not be empty!"],
        },
        location: {
            type: String,
            required: [true, "location should not be empty!"],
        },
        companyAddress: {
            type: String,
            required: [true, "companyAddress should not be empty!"],
        },
        region: {
            type: Number,
            required: [true, "region should not be empty!"],
        },
        contactPerson: {
            type: String,
            required: [true, "contactPerson should not be empty!"],
        },
        contactEmail: {
            type: String,
            required: [true, "contactEmail should not be empty!"],
        },
        contactPhone: {
            type: String,
            required: [true, "contactPhone should not be empty!"],
        },
        timeDemand: {
            type: String,
            enum: Object.values(TimeDemand),
            required: [true, "timeDemand should not be empty!"],
        },
        hashId: { type: String, select: false, unique: true },
    },
    { timestamps: true, collection: configOptions.collectionNameJob }
);

JobPositionSchema.pre("save", function (next) {
    if (this.isNew) {
        this.hashId = uuidv4();
    }
    next();
});

export const JobPositionModel = model<JobPosition>(
    "JobPositionModel",
    JobPositionSchema
);
