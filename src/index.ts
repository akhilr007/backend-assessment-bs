import express from "express";

import connectDatabase from "./config/database.config";
import serverConfig from "./config/server.config";
import apiRouter from "./routes/index.route";

const app = express();
const PORT = serverConfig.PORT;

app.use(express.json());

app.use("/identity", apiRouter);

connectDatabase().then(() => {
    app.listen(PORT, () => {
        console.log(`Server started on Port: ${PORT}`);
    });
});
