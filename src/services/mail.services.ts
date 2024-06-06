import { MAIL } from "../config/global";
import { loadEmailTemplate, transporter } from "../utils/mailer";

export enum EmailTemplate {
    CONFIRM_LAW_OFFICE_MAIL = "confirmLawOffice.template.html",
    CONFIRM_JOB_POSITION_MAIL = "confirmJobPosition.template.html",
    APPROVED_LAW_OFFICE_MAIL = "approvedLawOffice.template.html",
    TEST_MAIL = "test.template.html",
}

interface StringMap {
    [key: string]: string;
}

export async function sendEmail<T extends StringMap>(
    to: string,
    subject: string,
    contentEmail: T,
    emailTemplate: EmailTemplate
) {
    const mailOptions = {
        from: MAIL,
        to: to,
        subject: subject,
        html: loadEmailTemplate(emailTemplate, contentEmail),
    };

    try {
        const info = await transporter.sendMail(mailOptions);
        console.log("Message sent: %s", info.messageId);
    } catch (error) {
        console.error("Error sending email: ", error);
    }
}
