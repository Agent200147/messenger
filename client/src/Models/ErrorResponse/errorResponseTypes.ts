import type { ZodError } from "zod";

export type ZodErrorResponse = {
    status: number,
    data: ZodError,
}

export type ServerErrorResponse = {
    status: number,
    data: string,
}