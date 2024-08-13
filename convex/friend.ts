import { ConvexError, v } from 'convex/values';
import { mutation } from './_generated/server';
import getUserByClerkId from './_utils';

// eslint-disable-next-line import/prefer-default-export
export const remove = mutation({
  args: {
    conversationId: v.id('conversations'),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();

    if (!identity) {
      throw new ConvexError('Unauthorized');
    }

    const currentUser = await getUserByClerkId({
      ctx,
      clerkId: identity.subject,
    });

    if (!currentUser) {
      throw new ConvexError('User not found');
    }

    const conversation = await ctx.db.get(args.conversationId);

    if (!conversation) {
      throw new ConvexError('Conversation not found');
    }

    const memberships = await ctx.db.query('conversationMembers').withIndex(
      'by_conversationId',
      (q) => q.eq('conversationId', args.conversationId),
    ).collect();

    if (!memberships || memberships.length !== 2) {
      throw new ConvexError('No members in this conversation');
    }

    const friendship = await ctx.db.query('friends').withIndex(
      'by_conversationId',
      (q) => q.eq('conversationId', args.conversationId),
    ).unique();

    if (!friendship) {
      throw new ConvexError('You are not friends with this user');
    }

    const messages = await ctx.db.query('messages').withIndex(
      'by_conversationId',
      (q) => q.eq('conversationId', args.conversationId),
    ).collect();

    if (messages.length === 0) {
      throw new ConvexError('No messages in this conversation');
    }

    await ctx.db.delete(args.conversationId);

    await ctx.db.delete(friendship._id);

    await Promise.all(memberships.map((membership) => ctx.db.delete(membership._id)));

    await Promise.all(messages.map((message) => ctx.db.delete(message._id)));
  },
});
