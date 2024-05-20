import type { Request } from "express";
import type { IUserModel } from "../Models/User.model.js";

export type AuthenticatedRequest = Request & { user: IUserModel }
export type Nullable<T> = T | null