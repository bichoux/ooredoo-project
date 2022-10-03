import "reflect-metadata";
import { DataSource } from "typeorm";
import { Alert } from "./entity/Alert";
import { IDKPI } from "./entity/IDKPI";

export const AppDataSource = new DataSource({
  type: "mysql",
  host: "localhost",
  port: 3306,
  username: "root",
  password: "password",
  database: "ooredoo",
  synchronize: true,
  logging: true,
  entities: [IDKPI, Alert],
  migrations: [],
  subscribers: [],
});

export const IDKPIRepository = AppDataSource.getRepository(IDKPI);
export const AlertRepository = AppDataSource.getRepository(Alert);
