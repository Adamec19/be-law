import { JobPosition } from "../models/jobPosition.model";
import { LawOffice } from "../models/lawOffices.model";

export type DynamicApproveLawOfficeTemplateValue = Omit<
    LawOffice,
    | "status"
    | "isSupportingProgram"
    | "isFreePlaces"
    | "firstDate"
    | "firstStartTime"
    | "firstEndTime"
    | "secondDate"
    | "secondStartTime"
    | "secondEndTime"
    | "region"
    | "isFreeCapacity"
> & {
    freePlaces: string;
    freeCapacity: string;
    regionName: string;
};

export type DynamicCreateJobPositionTemplateValue = Omit<
    JobPosition,
    "region" | "status" | "contractType" | "timeDemand"
> & {
    regionName: string;
    contractName: string;
    timeDemandName: string;
};

export type DynamicLawOfficeApprovedTemplateValue = Omit<
    LawOffice,
    | "status"
    | "isSupportingProgram"
    | "isFreePlaces"
    | "firstDate"
    | "firstStartTime"
    | "firstEndTime"
    | "secondDate"
    | "secondStartTime"
    | "secondEndTime"
    | "region"
    | "isFreeCapacity"
> & {
    freePlaces: string;
    freeCapacity: string;
    regionName: string;
    firstVisitingDate: string;
    secondVisitingDate: string;
};
