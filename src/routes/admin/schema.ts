import { z } from 'zod/v4';

export const formSchema = z.object({
	term: z.string().min(1, 'Required'),
	alternatives: z.string().min(1, 'Required')
});

export type FormSchema = typeof formSchema;
