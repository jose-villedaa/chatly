import * as z from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

const addFriendFormSchema = z.object({
  email: z.string().min(1, { message: 'Invalid Email Lenght' }).email('Please enter a valid email'),
});

export const AddFriendFormResolver = zodResolver(addFriendFormSchema);
export type AddFriendFormSchema = z.infer<typeof addFriendFormSchema>;

const chatMessageSchema = z.object({
  content: z.string().min(1, { message: 'This field cannot be empty' }),
});

export const ChatMessageResolver = zodResolver(chatMessageSchema);
export type ChatMessageSchema = z.infer<typeof chatMessageSchema>;
