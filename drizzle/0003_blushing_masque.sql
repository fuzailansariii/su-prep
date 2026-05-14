ALTER TABLE "attempt_answers" ALTER COLUMN "marks_awarded" SET DATA TYPE real;--> statement-breakpoint
ALTER TABLE "results" ALTER COLUMN "marks_lost" SET DATA TYPE real;--> statement-breakpoint
ALTER TABLE "results" ALTER COLUMN "scored_marks" SET DATA TYPE real;--> statement-breakpoint
ALTER TABLE "results" ALTER COLUMN "percentage" SET DATA TYPE real;--> statement-breakpoint
CREATE UNIQUE INDEX "unique_active_attempt" ON "attempts" USING btree ("clerk_user_id","set_id");