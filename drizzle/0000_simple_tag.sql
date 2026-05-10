CREATE TYPE "public"."difficulty" AS ENUM('easy', 'medium', 'hard');--> statement-breakpoint
CREATE TYPE "public"."test_status" AS ENUM('draft', 'published', 'archived');--> statement-breakpoint
CREATE TYPE "public"."question_type" AS ENUM('mcq', 'multi', 'truefalse');--> statement-breakpoint
CREATE TYPE "public"."purchase_status" AS ENUM('pending', 'completed', 'failed', 'refunded');--> statement-breakpoint
CREATE TYPE "public"."attempt_status" AS ENUM('in_progress', 'completed', 'abandoned');--> statement-breakpoint
CREATE TABLE "tests" (
	"id" text PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"thumbnail" text,
	"total_questions" integer NOT NULL,
	"price" integer NOT NULL,
	"original_price" integer,
	"difficulty" "difficulty" DEFAULT 'medium' NOT NULL,
	"status" "test_status" DEFAULT 'draft' NOT NULL,
	"is_featured" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "options" (
	"id" text PRIMARY KEY NOT NULL,
	"question_id" text NOT NULL,
	"option_text" text NOT NULL,
	"is_correct" boolean DEFAULT false NOT NULL,
	"order" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "questions" (
	"id" text PRIMARY KEY NOT NULL,
	"set_id" text NOT NULL,
	"question_text" text NOT NULL,
	"type" "question_type" DEFAULT 'mcq' NOT NULL,
	"explanation" text,
	"marks" integer DEFAULT 1 NOT NULL,
	"order" integer NOT NULL,
	"section_id" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "purchases" (
	"id" text PRIMARY KEY NOT NULL,
	"clerk_user_id" text NOT NULL,
	"test_id" text NOT NULL,
	"test_title" text NOT NULL,
	"amount" integer NOT NULL,
	"status" "purchase_status" DEFAULT 'pending' NOT NULL,
	"razorpay_order_id" text,
	"razorpay_payment_id" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "attempt_answers" (
	"id" text PRIMARY KEY NOT NULL,
	"attempt_id" text NOT NULL,
	"question_id" text NOT NULL,
	"selected_option_ids" text[],
	"is_correct" boolean DEFAULT false NOT NULL,
	"is_marked_for_review" boolean DEFAULT false NOT NULL,
	"marks_awarded" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "attempts" (
	"id" text PRIMARY KEY NOT NULL,
	"clerk_user_id" text NOT NULL,
	"test_id" text NOT NULL,
	"set_id" text NOT NULL,
	"paused_at" timestamp,
	"status" "attempt_status" DEFAULT 'in_progress' NOT NULL,
	"started_at" timestamp DEFAULT now() NOT NULL,
	"submitted_at" timestamp,
	"time_taken" integer,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "leaderboard" (
	"id" text PRIMARY KEY NOT NULL,
	"set_id" text NOT NULL,
	"clerk_user_id" text NOT NULL,
	"result_id" text NOT NULL,
	"rank" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "results" (
	"id" text PRIMARY KEY NOT NULL,
	"clerk_user_id" text NOT NULL,
	"test_id" text NOT NULL,
	"set_id" text NOT NULL,
	"marks_lost" integer DEFAULT 0 NOT NULL,
	"attempt_id" text NOT NULL,
	"total_marks" integer NOT NULL,
	"scored_marks" integer NOT NULL,
	"correct_answers" integer NOT NULL,
	"wrong_answers" integer NOT NULL,
	"skipped_answers" integer NOT NULL,
	"percentage" integer NOT NULL,
	"time_taken" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "results_attempt_id_unique" UNIQUE("attempt_id")
);
--> statement-breakpoint
CREATE TABLE "sets" (
	"id" text PRIMARY KEY NOT NULL,
	"test_id" text NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"duration" integer NOT NULL,
	"total_questions" integer NOT NULL,
	"total_marks" integer NOT NULL,
	"negative_marking" boolean DEFAULT false NOT NULL,
	"negative_mark_fraction" integer DEFAULT 25,
	"order" integer NOT NULL,
	"status" "test_status" DEFAULT 'draft' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sections" (
	"id" text PRIMARY KEY NOT NULL,
	"set_id" text NOT NULL,
	"name" text NOT NULL,
	"order" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "options" ADD CONSTRAINT "options_question_id_questions_id_fk" FOREIGN KEY ("question_id") REFERENCES "public"."questions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "questions" ADD CONSTRAINT "questions_set_id_sets_id_fk" FOREIGN KEY ("set_id") REFERENCES "public"."sets"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "questions" ADD CONSTRAINT "questions_section_id_sections_id_fk" FOREIGN KEY ("section_id") REFERENCES "public"."sections"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "purchases" ADD CONSTRAINT "purchases_test_id_tests_id_fk" FOREIGN KEY ("test_id") REFERENCES "public"."tests"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "attempt_answers" ADD CONSTRAINT "attempt_answers_attempt_id_attempts_id_fk" FOREIGN KEY ("attempt_id") REFERENCES "public"."attempts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "attempt_answers" ADD CONSTRAINT "attempt_answers_question_id_questions_id_fk" FOREIGN KEY ("question_id") REFERENCES "public"."questions"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "attempts" ADD CONSTRAINT "attempts_test_id_tests_id_fk" FOREIGN KEY ("test_id") REFERENCES "public"."tests"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "attempts" ADD CONSTRAINT "attempts_set_id_sets_id_fk" FOREIGN KEY ("set_id") REFERENCES "public"."sets"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "leaderboard" ADD CONSTRAINT "leaderboard_set_id_sets_id_fk" FOREIGN KEY ("set_id") REFERENCES "public"."sets"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "leaderboard" ADD CONSTRAINT "leaderboard_result_id_results_id_fk" FOREIGN KEY ("result_id") REFERENCES "public"."results"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "results" ADD CONSTRAINT "results_test_id_tests_id_fk" FOREIGN KEY ("test_id") REFERENCES "public"."tests"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "results" ADD CONSTRAINT "results_set_id_sets_id_fk" FOREIGN KEY ("set_id") REFERENCES "public"."sets"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "results" ADD CONSTRAINT "results_attempt_id_attempts_id_fk" FOREIGN KEY ("attempt_id") REFERENCES "public"."attempts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sets" ADD CONSTRAINT "sets_test_id_tests_id_fk" FOREIGN KEY ("test_id") REFERENCES "public"."tests"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sections" ADD CONSTRAINT "sections_set_id_sets_id_fk" FOREIGN KEY ("set_id") REFERENCES "public"."sets"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_tests_status" ON "tests" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_tests_isFeatured" ON "tests" USING btree ("is_featured");--> statement-breakpoint
CREATE UNIQUE INDEX "unique_option_order" ON "options" USING btree ("question_id","order");--> statement-breakpoint
CREATE INDEX "idx_options_question" ON "options" USING btree ("question_id");--> statement-breakpoint
CREATE UNIQUE INDEX "unique_question_order" ON "questions" USING btree ("set_id","order");--> statement-breakpoint
CREATE INDEX "idx_question_set" ON "questions" USING btree ("set_id");--> statement-breakpoint
CREATE UNIQUE INDEX "unique_purchase" ON "purchases" USING btree ("clerk_user_id","test_id");--> statement-breakpoint
CREATE INDEX "idx_purchases_user" ON "purchases" USING btree ("clerk_user_id");--> statement-breakpoint
CREATE INDEX "idx_purchases_test" ON "purchases" USING btree ("test_id");--> statement-breakpoint
CREATE INDEX "idx_attempt_answers_attempt" ON "attempt_answers" USING btree ("attempt_id");--> statement-breakpoint
CREATE INDEX "idx_attempt_answers_question" ON "attempt_answers" USING btree ("question_id");--> statement-breakpoint
CREATE UNIQUE INDEX "unique_attempt_question" ON "attempt_answers" USING btree ("attempt_id","question_id");--> statement-breakpoint
CREATE INDEX "idx_attempts_user" ON "attempts" USING btree ("clerk_user_id");--> statement-breakpoint
CREATE INDEX "idx_attempts_test" ON "attempts" USING btree ("test_id");--> statement-breakpoint
CREATE INDEX "idx_leaderboard_set" ON "leaderboard" USING btree ("set_id");--> statement-breakpoint
CREATE INDEX "idx_leaderboard_user" ON "leaderboard" USING btree ("clerk_user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "unique_leaderboard_user" ON "leaderboard" USING btree ("set_id","clerk_user_id");--> statement-breakpoint
CREATE INDEX "idx_results_test" ON "results" USING btree ("test_id");--> statement-breakpoint
CREATE INDEX "idx_sets_test" ON "sets" USING btree ("test_id");--> statement-breakpoint
CREATE UNIQUE INDEX "unique_set_order" ON "sets" USING btree ("test_id","order");--> statement-breakpoint
CREATE INDEX "idx_sections_set" ON "sections" USING btree ("set_id");--> statement-breakpoint
CREATE UNIQUE INDEX "unique_section_order" ON "sections" USING btree ("set_id","order");