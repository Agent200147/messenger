import type { ZodError } from "zod";

export type ZodErrorResponse = {
    status: number,
    data: {
        name: string,
        errors: string[]
    },
}

export type ServerErrorResponse = {
    status: number,
    data: string,
}