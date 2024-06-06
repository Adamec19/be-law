import { Request, Response } from "express";
import { LawOfficeModel, Status } from "../models/lawOffices.model";
import { EmailTemplate, sendEmail } from "../services/mail.services";
import { StatusCodes } from "http-status-codes";
import { FE_DOMAIN, LIMIT_PER_PAGE, MAIL } from "../config/global";
import {
    DynamicLawOfficeApprovedTemplateValue,
    DynamicApproveLawOfficeTemplateValue,
} from "../types/mail";
import { getRegionName } from "../utils";

class LawOfficesController {
    getAllLawOffices = getAllLawOffices;
    getLawOfficeById = getLawOfficeById;
    createLawOffice = createLawOffice;
    updateLawOffice = updateLawOffice;
    updateLawOfficeAfterEmailCallback = updateLawOfficeAfterEmailCallback;
    deleteLawOffice = deleteLawOffice;
    getLawOfficeByHashId = getLawOfficeByHashId;
}

export const lawOfficesController = new LawOfficesController();

interface Query {
    region?: string;
    status?: string;
}

async function getAllLawOffices(req: Request, res: Response) {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || LIMIT_PER_PAGE;

    const { region, status } = req.query;

    const query: Query = {};
    if (region) {
        query.region = region.toString();
    }
    if (status) {
        query.status = status.toString();
    }
    try {
        const countOffices = await LawOfficeModel.countDocuments(query);
        const lawOffices = await LawOfficeModel.find(query)
            .skip((page - 1) * limit)
            .limit(limit * 1)
            .sort({ createdAt: -1 });
        if (lawOffices?.length === 0) {
            return res.status(StatusCodes.OK).send({
                msg: "No law offices found!",
                data: [],
            });
        }

        return res.status(StatusCodes.OK).send({
            data: lawOffices,
            totalPages: Math.ceil(countOffices / limit),
            currentPage: page,
        });
    } catch (error) {
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send(error);
    }
}

async function getLawOfficeById(req: Request, res: Response) {
    const { id } = req.params;
    try {
        const lawOffice = await LawOfficeModel.findById({ _id: id });

        if (!lawOffice) {
            throw new Error("Requested lawOffice not found!");
        }

        res.status(StatusCodes.OK).send({ data: lawOffice, msg: "Success" });
    } catch (error) {
        res.status(StatusCodes.NOT_FOUND).send(
            `Unable to find matching document with id: ${req.params.id}`
        );
    }
}

async function getLawOfficeByHashId(req: Request, res: Response) {
    const { hashId } = req.params;
    try {
        const lawOffice = await LawOfficeModel.findOne({
            hashId,
        });

        if (!lawOffice) {
            return res.status(StatusCodes.NOT_FOUND).send({
                msg: `Unable to find matching document with hashId: ${hashId}`,
            });
        }

        return res
            .status(StatusCodes.OK)
            .send({ data: lawOffice, msg: "Success" });
    } catch (error) {
        return res
            .status(StatusCodes.NOT_FOUND)
            .send(`Unable to find matching document with hashId: ${hashId}`);
    }
}

async function createLawOffice(req: Request, res: Response) {
    try {
        const lawOffice = await LawOfficeModel.create(req.body);

        if (lawOffice) {
            const LawOfficeWithHashId = await LawOfficeModel.findById(
                lawOffice._id
            ).select("+hashId");

            if (!LawOfficeWithHashId) {
                return res.status(StatusCodes.NOT_FOUND).send({
                    msg: "Job position not found after creation!",
                });
            }

            await sendEmail<DynamicApproveLawOfficeTemplateValue>(
                MAIL,
                "Žádost o schválení advokátní kanceláře",
                {
                    companyName: lawOffice.companyName,
                    ico: lawOffice.ico,
                    phone: lawOffice.phone,
                    hashId: LawOfficeWithHashId.hashId,
                    address: lawOffice.address,
                    regionName: getRegionName(lawOffice.region),
                    supportingProgram: lawOffice.supportingProgram.length
                        ? lawOffice.supportingProgram
                        : "Bez doprovodného programu",
                    freePlaces: lawOffice.isFreePlaces ? "Ano" : "Ne",
                    freeCapacity: lawOffice.supportingProgram.length
                        ? lawOffice.isFreeCapacity
                            ? "Ano"
                            : "Ne"
                        : "Bez doprovodného programu",
                    email: lawOffice.email,
                    contactEmail: lawOffice.contactEmail,
                    city: lawOffice.city,
                },
                EmailTemplate.CONFIRM_LAW_OFFICE_MAIL
            );
        }

        return res.status(StatusCodes.CREATED).send({
            data: lawOffice,
            msg: "lawOffice has been created!",
        });
    } catch (error) {
        return res.status(StatusCodes.BAD_REQUEST).send(error);
    }
}

async function updateLawOffice(req: Request, res: Response) {
    try {
        const updatedLawOffice = await LawOfficeModel.findByIdAndUpdate(
            { _id: req.body._id },
            req.body,
            {
                new: true,
            }
        );

        if (!updatedLawOffice) {
            return res.status(StatusCodes.NOT_FOUND).send({
                msg: `Unable to find matching document with id: ${req.body._id}...`,
            });
        }

        return res.status(StatusCodes.OK).send({
            data: updatedLawOffice,
            msg: "lawOffice has been updated",
        });
    } catch (error) {
        return res.status(StatusCodes.BAD_REQUEST).send(error);
    }
}

async function updateLawOfficeAfterEmailCallback(req: Request, res: Response) {
    const { hashId } = req.params;

    try {
        const lawOffice = await LawOfficeModel.findOne({ hashId });
        if (!lawOffice) {
            return res.redirect(301, `${FE_DOMAIN}/info/error?typeId=3`);
        }

        const updatedLawOffice = await LawOfficeModel.findByIdAndUpdate(
            { _id: lawOffice._id },
            { status: Status.APPROVED },
            {
                new: true,
            }
        );

        if (!updatedLawOffice) {
            return res.redirect(301, `${FE_DOMAIN}/info/error?typeId=3`);
        }

        await sendEmail<DynamicLawOfficeApprovedTemplateValue>(
            updatedLawOffice.email,
            "Schválena advokátní kancelář",
            {
                companyName: lawOffice.companyName,
                ico: lawOffice.ico,
                phone: lawOffice.phone,
                hashId: hashId,
                address: lawOffice.address,
                regionName: getRegionName(lawOffice.region),
                supportingProgram: lawOffice.supportingProgram.length
                    ? lawOffice.supportingProgram
                    : "Bez doprovodného programu",
                freePlaces: lawOffice.isFreePlaces ? "Ano" : "Ne",
                freeCapacity: lawOffice.supportingProgram.length
                    ? lawOffice.isFreeCapacity
                        ? "Ano"
                        : "Ne"
                    : "Bez doprovodného programu",
                email: lawOffice.email,
                contactEmail: lawOffice.isSupportingProgram
                    ? lawOffice.contactEmail
                    : "Bez doprovodného programu",
                firstVisitingDate: `${lawOffice.firstDate} od: ${lawOffice.firstStartTime} do: ${lawOffice.firstEndTime}`,
                secondVisitingDate: lawOffice.secondDate
                    ? `${lawOffice.secondDate} - ${lawOffice.secondStartTime} - ${lawOffice.secondEndTime}`
                    : "Bez druhého termínu",
                city: lawOffice.city,
            },
            EmailTemplate.APPROVED_LAW_OFFICE_MAIL
        );

        if (!updatedLawOffice) {
            return res.redirect(301, `${FE_DOMAIN}/info/error?typeId=3`);
        }

        return res.redirect(301, `${FE_DOMAIN}/info/success?typeId=3`);
    } catch (error) {
        return res.redirect(301, `${FE_DOMAIN}/info/error?typeId=3`);
    }
}

async function deleteLawOffice(req: Request, res: Response) {
    const { id } = req.params;

    try {
        const deletedLawOffice = await LawOfficeModel.findByIdAndDelete({
            _id: id,
        });

        if (!deletedLawOffice) {
            throw new Error("Requested lawOffice not found!");
        }

        return res.status(StatusCodes.OK).send({
            data: deletedLawOffice,
            msg: "lawOffice has been deleted",
        });
    } catch (error) {
        console.error(error);
        return res.status(StatusCodes.BAD_REQUEST).send(error);
    }
}
