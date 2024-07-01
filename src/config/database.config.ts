import { DataSource, DataSourceOptions } from "typeorm";

import serverConfig from "./server.config";

const { DB_URL } = serverConfig;

const databaseConfig: DataSourceOptions = {
    type: "postgres",
    url: DB_URL,
    ssl: {
        rejectUnauthorized: false // This is necessary for Neon DB
    },
    entities: ["src/models/**/*.ts"],
    synchronize: true // Be careful with this in production
};

export const AppDataSource = new DataSource(databaseConfig);

async function connectDatabase() {
    try {
        await AppDataSource.initialize();
        console.log("DB Connected");
    } catch (error) {
        console.log("Error connecting to database", error);
        process.exit(1);
    }
}

export default connectDatabase;
