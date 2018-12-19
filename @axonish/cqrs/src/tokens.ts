import { Token } from "typedi";
import IEventStore from "./interfaces/IEventStore";
import IRepository from "./interfaces/IRepository";

export const EventStoreToken = new Token<IEventStore>();

export const RepositoryToken = new Token<IRepository>();
