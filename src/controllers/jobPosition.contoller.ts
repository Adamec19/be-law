import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { FE_DOMAIN, LIMIT_PER_PAGE } from "../config/global";
import { JobPositionModel } from "../models/jobPosition.model";
import { EmailTemplate, sendEmail } from "../services/mail.services";
import { DynamicCreateJobPositionTemplateValue } from "../types/mail";
import { Status } from "../models/lawOffices.model";
import { getContractName, getRegionName, getTimeDemandName } from "../utils";

require("dotenv").config();

class JobPositionController {
    getJobDetail = getJobDetail;
    getAllJobsPosition = getAllJobsPosition;
    createJobPosition = createJobPosition;
    getJobDetailByHashId = getJobDetailByHashId;
    approveJobPositionAfterEmailCallback = approveJobPositionAfterEmailCallback;
    deleteJobPositionAfterEmailCallback = deleteJobPositionAfterEmailCallback;
    updateJobPosition = updateJobPosition;
}

export const jobPositionController = new JobPositionController();

async function getJobDetail(req: Request, res: Response) {
    const { id } = req.params;
    try {
        const jobPosition = await JobPositionModel.findById({ _id: id });

        if (!jobPosition) {
            return res.status(StatusCodes.NOT_FOUND).send({
                msg: `Unable to find matching document with id: ${id}...`,
                data: [],
            });
        }

        return res.status(StatusCodes.OK).send({
            msg: "Job detail has been fetched successfully!",
            data: jobPosition,
        });
    } catch (error) {
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send(error);
    }
}

async function getJobDetailByHashId(req: Request, res: Response) {
    const { hashId } = req.params;
    try {
        const jobPosition = await JobPositionModel.findOne({ hashId });

        if (!jobPosition) {
            return res.status(StatusCodes.NOT_FOUND).send({
                msg: `Unable to find matching document with hashId: ${hashId}...`,
                data: [],
            });
        }

        return res.status(StatusCodes.OK).send({
            msg: "Job detail has been fetched successfully!",
            data: jobPosition,
        });
    } catch (error) {
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send(error);
    }
}

async function createJobPosition(req: Request, res: Response) {
    try {
        const resJobPosition = await JobPositionModel.create(req.body);

        if (resJobPosition) {
            const jobWithHashId = await JobPositionModel.findById(
                resJobPosition._id
            ).select("+hashId");

            if (!jobWithHashId) {
                return res.status(StatusCodes.NOT_FOUND).send({
                    msg: "Job position not found after creation!",
                });
            }

            await sendEmail<DynamicCreateJobPositionTemplateValue>(
                resJobPosition.contactEmail,
                "Potvrzení o vytvoření pracovní pozice",
                {
                    boardingDate: resJobPosition.boardingDate,
                    companyName: resJobPosition.companyName,
                    contactEmail: resJobPosition.contactEmail,
                    contactPerson: resJobPosition.contactPerson,
                    contactPhone: resJobPosition.contactPhone,
                    contractName: getContractName(resJobPosition.contractType),
                    jobDescription: resJobPosition.jobDescription,
                    jobTitle: resJobPosition.jobTitle,
                    companyAddress: resJobPosition.companyAddress,
                    location: resJobPosition.location,
                    otherConditions: resJobPosition.otherConditions,
                    regionName: getRegionName(resJobPosition.region),
                    timeDemandName: getTimeDemandName(
                        resJobPosition.timeDemand
                    ),
                    title: resJobPosition.title,
                    hourSalary: resJobPosition.hourSalary,
                    hashId: jobWithHashId.hashId,
                },
                EmailTemplate.CONFIRM_JOB_POSITION_MAIL
            );
        }

        return res.status(StatusCodes.CREATED).send({
            msg: "Job position has been created successfully!",
        });
    } catch (error) {
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send(error);
    }
}

async function updateJobPosition(req: Request, res: Response) {
    const { id } = req.params;
    try {
        const jobPosition = await JobPositionModel.findById({ _id: id });
        if (!jobPosition) {
            return res.status(StatusCodes.NOT_FOUND).send({
                msg: `Unable to find matching document with id: ${id}...`,
                data: [],
            });
        }

        await JobPositionModel.updateOne({ _id: id }, req.body);

        return res.status(StatusCodes.OK).send({
            msg: "Job position has been updated successfully!",
        });
    } catch (error) {
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send(error);
    }
}

interface Query {
    location?: RegExp;
    status?: string;
}

async function getAllJobsPosition(req: Request, res: Response) {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || LIMIT_PER_PAGE;
    const { location, status } = req.query;

    const query: Query = {};
    if (location) {
        query.location = new RegExp(`^${location}`, "i");
    }
    if (status) {
        query.status = status.toString();
    }

    try {
        const jobsPositionCount = await JobPositionModel.countDocuments(query);
        const jobPositions = await JobPositionModel.find(query)
            .skip((page - 1) * limit)
            .limit(limit * 1)
            .sort({ createdAt: -1 });

        if (jobPositions?.length === 0) {
            return res.status(StatusCodes.OK).send({
                msg: "No job positions found!",
                data: [],
            });
        }

        return res.status(StatusCodes.OK).send({
            data: jobPositions,
            totalPages: Math.ceil(jobsPositionCount / limit),
            currentPage: page,
        });
    } catch (error) {
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send(error);
    }
}

async function deleteJobPositionAfterEmailCallback(
    req: Request,
    res: Response
) {
    const { hashId } = req.params;
    try {
        const jobPosition = await JobPositionModel.findOne({ hashId });
        if (!jobPosition) {
            return res.redirect(301, `${FE_DOMAIN}/info/error?typeId=2`);
        }

        await JobPositionModel.deleteOne({ hashId });

        return res.redirect(301, `${FE_DOMAIN}/info/success?typeId=2`);
    } catch (error) {
        return res.redirect(301, `${FE_DOMAIN}/info/error?typeId=2`);
    }
}

async function approveJobPositionAfterEmailCallback(
    req: Request,
    res: Response
) {
    const { hashId } = req.params;
    try {
        const jobPosition = await JobPositionModel.findOne({ hashId });
        if (!jobPosition) {
            return res.redirect(301, `${FE_DOMAIN}/info/error?typeId=1`);
        }

        await JobPositionModel.updateOne(
            { hashId },
            { $set: { status: Status.APPROVED } }
        );

        return res.redirect(301, `${FE_DOMAIN}/info/success?typeId=1`);
    } catch (error) {
        return res.redirect(301, `${FE_DOMAIN}/info/error?typeId=1`);
    }
}
