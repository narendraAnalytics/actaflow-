import {
  pgTable,
  uuid,
  text,
  varchar,
  integer,
  boolean,
  date,
  timestamp,
  jsonb,
} from 'drizzle-orm/pg-core';
import { createId } from '@paralleldrive/cuid2';

export const users = pgTable('users', {
  id: text('id').primaryKey(), // Clerk user ID format: "user_xxx"
  email: varchar('email', { length: 255 }).notNull(),
  fullName: varchar('full_name', { length: 200 }),
  plan: varchar('plan', { length: 20 }).notNull().default('free'),
  meetingsUsed: integer('meetings_used').notNull().default(0),
  reminderMonthSentAt: timestamp('reminder_month_sent_at', { withTimezone: true }),
  timezone: varchar('timezone', { length: 60 }).notNull().default('Asia/Kolkata'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

export const meetings = pgTable('meetings', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  title: varchar('title', { length: 300 }),
  meetingDate: date('meeting_date'),
  durationMins: integer('duration_mins'),
  source: varchar('source', { length: 20 }).notNull(),
  rawTranscript: text('raw_transcript'),
  audioUrl: varchar('audio_url', { length: 500 }),
  summary: text('summary'),
  decisions: jsonb('decisions'),
  blockers: jsonb('blockers'),
  status: varchar('status', { length: 20 }).notNull().default('processing'),
  language: varchar('language', { length: 10 }).notNull().default('en'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

export const attendees = pgTable('attendees', {
  id: uuid('id').primaryKey().defaultRandom(),
  meetingId: uuid('meeting_id').notNull().references(() => meetings.id, { onDelete: 'cascade' }),
  name: varchar('name', { length: 200 }).notNull(),
  email: varchar('email', { length: 255 }),
  emailSent: boolean('email_sent').notNull().default(false),
  emailSentAt: timestamp('email_sent_at', { withTimezone: true }),
});

export const actionItems = pgTable('action_items', {
  id: uuid('id').primaryKey().defaultRandom(),
  meetingId: uuid('meeting_id').notNull().references(() => meetings.id, { onDelete: 'cascade' }),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  ownerName: varchar('owner_name', { length: 200 }).notNull(),
  ownerEmail: varchar('owner_email', { length: 255 }),
  description: text('description').notNull(),
  dueDate: date('due_date'),
  priority: varchar('priority', { length: 10 }).notNull().default('medium'),
  status: varchar('status', { length: 20 }).notNull().default('open'),
  doneToken: varchar('done_token', { length: 100 })
    .notNull()
    .unique()
    .$defaultFn(() => createId()),
  doneAt: timestamp('done_at', { withTimezone: true }),
  reminderSentAt: timestamp('reminder_sent_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

export const emailLogs = pgTable('email_logs', {
  id: uuid('id').primaryKey().defaultRandom(),
  meetingId: uuid('meeting_id').notNull().references(() => meetings.id, { onDelete: 'cascade' }),
  attendeeId: uuid('attendee_id').notNull().references(() => attendees.id, { onDelete: 'cascade' }),
  resendEmailId: varchar('resend_email_id', { length: 100 }),
  status: varchar('status', { length: 20 }).notNull().default('sent'),
  openedAt: timestamp('opened_at', { withTimezone: true }),
  retryCount: integer('retry_count').notNull().default(0),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

export const contacts = pgTable('contacts', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  name: varchar('name', { length: 200 }).notNull(),
  email: varchar('email', { length: 255 }).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

// Inferred types for use across the app
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Meeting = typeof meetings.$inferSelect;
export type NewMeeting = typeof meetings.$inferInsert;
export type Attendee = typeof attendees.$inferSelect;
export type NewAttendee = typeof attendees.$inferInsert;
export type ActionItem = typeof actionItems.$inferSelect;
export type NewActionItem = typeof actionItems.$inferInsert;
export type EmailLog = typeof emailLogs.$inferSelect;
export type NewEmailLog = typeof emailLogs.$inferInsert;
export type Contact = typeof contacts.$inferSelect;
export type NewContact = typeof contacts.$inferInsert;
