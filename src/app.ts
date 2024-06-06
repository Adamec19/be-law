import express from "express";
import cors from "cors";
import { connectToDatabase } from "./services/database.service";
import { lawOfficesRouter } from "./routes/lawOffices.router";
import { jobPositionRouter } from "./routes/jobPosition.router";
import { EmailTemplate, sendEmail } from "./services/mail.services";

const app = express();
const port = 8080;

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use(cors());
app.use("/api", lawOfficesRouter);
app.use("/api/job-position", jobPositionRouter);

app.use("/mailer", async (_, res) => {
    try {
        await sendEmail(
            "adamec@ulovdomov.cz",
            "Test",
            {},
            EmailTemplate.TEST_MAIL
        );
        res.send("Email sent!");
    } catch (error) {
        res.status(500).send("Error sending email");
    }
});

const startDB = async () => {
    try {
        await connectToDatabase();
        console.log("Mongodb is connected!!!");
        app.listen(port, () => {
            console.log(`Server is listening on port ${port}...`);
        });
    } catch (error) {
        console.log(error);
    }
};

startDB();
