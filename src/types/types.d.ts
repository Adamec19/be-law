import { Request } from "express";

export interface RequestWithUser extends Request {
    userData: {
        _id: string;
        email: string;
    };
}

export type Region = {
    id: number;
    name: string;
};
