import { Schema, model } from "mongoose";
import { v4 as uuidv4 } from "uuid";
import configOptions from "../config";

require("dotenv").config();

export enum Status {
    APPROVED = "APPROVED",
    PENDING = "PENDING",
    REJECTED = "REJECTED",
}

export interface LawOffice {
    companyName: string;
    email: string;
    ico: string;
    region: number;
    city: string;
    address: string;
    isSupportingProgram: boolean;
    supportingProgram: string;
    isFreePlaces: boolean;
    phone: string;
    status: Status;
    firstDate: string;
    firstStartTime: string;
    firstEndTime: string;
    secondDate?: string;
    secondStartTime?: string;
    secondEndTime?: string;
    hashId: string;
    isFreeCapacity: boolean;
    contactEmail?: string;
}

const LawOfficeSchema = new Schema<LawOffice>(
    {
        companyName: {
            type: String,
            required: [true, "Title should not be empty!"],
        },

        status: {
            type: String,
            enum: Object.values(Status),
            default: Status.PENDING,
            required: [true, "Status should not be empty!"],
        },

        ico: {
            type: String,
            required: [true, "Ico should not be empty!"],
        },

        region: {
            type: Number,
            required: [true, "Region should not be empty!"],
        },

        city: {
            type: String,
            required: [true, "City should not be empty!"],
        },

        address: {
            type: String,
            required: [true, "Address should not be empty!"],
        },

        isSupportingProgram: {
            type: Boolean,
            required: [true, "Supporting program should not be empty!"],
        },

        supportingProgram: {
            type: String,
        },

        isFreePlaces: {
            type: Boolean,
            required: [true, "Free places should not be empty!"],
        },

        isFreeCapacity: {
            type: Boolean,
            required: [true, "Free capacity should not be empty!"],
        },

        phone: {
            type: String,
            required: [true, "Phone should not be empty!"],
        },

        email: {
            type: String,
            required: [true, "Email should not be empty!"],
        },
        contactEmail: {
            type: String,
        },
        firstDate: {
            type: String,
            required: [true, "Date should not be empty!"],
        },
        firstStartTime: {
            type: String,
            required: [true, "Start time should not be empty!"],
        },
        firstEndTime: {
            type: String,
            required: [true, "End time should not be empty!"],
        },
        secondDate: {
            type: String,
        },
        secondStartTime: {
            type: String,
        },
        secondEndTime: {
            type: String,
        },
        hashId: { type: String, select: false, unique: true },
    },
    { timestamps: true, collection: configOptions.collectionNameLaw }
);

LawOfficeSchema.pre("save", function (next) {
    if (this.isNew) {
        this.hashId = uuidv4();
    }
    next();
});

export const LawOfficeModel = model<LawOffice>(
    "LawOfficeModel",
    LawOfficeSchema
);
