import express from "express";

import serverConfig from "./config/server.config";
import apiRouter from "./routes/index.route";

const app = express();
const PORT = serverConfig.PORT;

app.use("/identity", apiRouter);

app.listen(PORT, () => {
    console.log(`Server started on Port: ${PORT}`);
});
