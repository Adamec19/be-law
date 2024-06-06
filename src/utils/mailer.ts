import nodemailer from "nodemailer";
import path from "path";
import fs from "fs";
import { MAIL } from "../config/global";
import configOptions from "../config";

export const transporter = nodemailer.createTransport({
    host: "hosting.solnet.cz",
    port: 465,
    secure: true,
    auth: {
        user: MAIL,
        pass: configOptions.mailPassword,
    },
});

export const loadEmailTemplate = (
    fileName: string,
    replacements: { [key: string]: string }
) => {
    const filePath = path.join(__dirname, "..", "templates", "email", fileName);
    let template = fs.readFileSync(filePath, "utf8");

    Object.keys(replacements).forEach((key) => {
        const replacementValue = replacements[key] || "N/A";
        template = template.replace(
            new RegExp(`{{${key}}}`, "g"),
            replacementValue
        );
    });

    return template;
};
