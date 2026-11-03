CREATE TABLE `applicant_team_members` (
	`id` text PRIMARY KEY NOT NULL,
	`team_applicant_id` text NOT NULL,
	`member_id` text NOT NULL,
	`expertise` text NOT NULL,
	FOREIGN KEY (`team_applicant_id`) REFERENCES `team_applicants`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`member_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `applicant_team_members_team_applicant_id_member_id_unique` ON `applicant_team_members` (`team_applicant_id`,`member_id`);--> statement-breakpoint
CREATE TABLE `experiences` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`project_name` text NOT NULL,
	`project_role` text NOT NULL,
	`start_date` text NOT NULL,
	`end_date` text,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `inboxes` (
	`id` text PRIMARY KEY NOT NULL,
	`recipient_id` text NOT NULL,
	`sender_id` text NOT NULL,
	`team_invitation_id` text,
	`project_invitation_id` text,
	`message_body_id` text,
	`category` text NOT NULL,
	`is_read` integer DEFAULT false NOT NULL,
	`created_at` integer,
	`updated_at` integer,
	FOREIGN KEY (`recipient_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`sender_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`team_invitation_id`) REFERENCES `team_invitations`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`project_invitation_id`) REFERENCES `project_invitations`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`message_body_id`) REFERENCES `message_bodies`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `inboxes_category_index` ON `inboxes` (`category`);--> statement-breakpoint
CREATE INDEX `inboxes_recipient_read_index` ON `inboxes` (`recipient_id`,`is_read`);--> statement-breakpoint
CREATE TABLE `individual_applicants` (
	`id` text PRIMARY KEY NOT NULL,
	`project_id` text NOT NULL,
	`from_id` text NOT NULL,
	`to_id` text NOT NULL,
	`expertise` text NOT NULL,
	`status` text DEFAULT 'Applying' NOT NULL,
	`self_describe` text,
	`apply_reason` text,
	`created_at` integer,
	`updated_at` integer,
	FOREIGN KEY (`project_id`) REFERENCES `projects`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`from_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`to_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `individual_applicants_status_index` ON `individual_applicants` (`status`);--> statement-breakpoint
CREATE UNIQUE INDEX `individual_applicants_project_id_from_id_to_id_unique` ON `individual_applicants` (`project_id`,`from_id`,`to_id`);--> statement-breakpoint
CREATE TABLE `leaderboards` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`expertise` text NOT NULL,
	`points` integer DEFAULT 0 NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `leaderboards_expertise_points_index` ON `leaderboards` (`expertise`,`points`);--> statement-breakpoint
CREATE UNIQUE INDEX `leaderboards_user_id_expertise_unique` ON `leaderboards` (`user_id`,`expertise`);--> statement-breakpoint
CREATE TABLE `message_bodies` (
	`id` text PRIMARY KEY NOT NULL,
	`message_header_id` text NOT NULL,
	`sender_id` text NOT NULL,
	`recipient_id` text NOT NULL,
	`message` text NOT NULL,
	`created_at` integer,
	`updated_at` integer,
	FOREIGN KEY (`message_header_id`) REFERENCES `message_headers`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`sender_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`recipient_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `message_bodies_header_created_index` ON `message_bodies` (`message_header_id`,`created_at`);--> statement-breakpoint
CREATE TABLE `message_headers` (
	`id` text PRIMARY KEY NOT NULL,
	`user_one_id` text NOT NULL,
	`user_two_id` text NOT NULL,
	FOREIGN KEY (`user_one_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`user_two_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `message_headers_user_one_id_user_two_id_unique` ON `message_headers` (`user_one_id`,`user_two_id`);--> statement-breakpoint
CREATE TABLE `password_reset_tokens` (
	`email` text PRIMARY KEY NOT NULL,
	`token` text NOT NULL,
	`created_at` integer
);
--> statement-breakpoint
CREATE TABLE `personal_access_tokens` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`name` text NOT NULL,
	`token` text NOT NULL,
	`last_used_at` integer,
	`expires_at` integer,
	`created_at` integer,
	`updated_at` integer,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `personal_access_tokens_token_unique` ON `personal_access_tokens` (`token`);--> statement-breakpoint
CREATE INDEX `personal_access_tokens_user_id_index` ON `personal_access_tokens` (`user_id`);--> statement-breakpoint
CREATE TABLE `project_boxes` (
	`id` text PRIMARY KEY NOT NULL,
	`project_id` text NOT NULL,
	`user_id` text NOT NULL,
	`status` text DEFAULT 'Waiting' NOT NULL,
	`created_at` integer,
	`updated_at` integer,
	FOREIGN KEY (`project_id`) REFERENCES `projects`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `project_boxes_status_index` ON `project_boxes` (`status`);--> statement-breakpoint
CREATE UNIQUE INDEX `project_boxes_project_id_user_id_unique` ON `project_boxes` (`project_id`,`user_id`);--> statement-breakpoint
CREATE TABLE `project_invitations` (
	`id` text PRIMARY KEY NOT NULL,
	`project_id` text NOT NULL,
	`from_id` text NOT NULL,
	`to_id` text NOT NULL,
	`status` text DEFAULT 'Pending' NOT NULL,
	`created_at` integer,
	`updated_at` integer,
	FOREIGN KEY (`project_id`) REFERENCES `projects`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`from_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`to_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `project_invitations_status_index` ON `project_invitations` (`status`);--> statement-breakpoint
CREATE UNIQUE INDEX `project_invitations_project_id_from_id_to_id_unique` ON `project_invitations` (`project_id`,`from_id`,`to_id`);--> statement-breakpoint
CREATE TABLE `project_requirements` (
	`id` text PRIMARY KEY NOT NULL,
	`project_id` text NOT NULL,
	`requirement` text NOT NULL,
	FOREIGN KEY (`project_id`) REFERENCES `projects`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `project_reviews` (
	`id` text PRIMARY KEY NOT NULL,
	`project_id` text NOT NULL,
	`overall_score` text,
	`overall_review` text,
	`project_result` text,
	FOREIGN KEY (`project_id`) REFERENCES `projects`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `project_skills` (
	`id` text PRIMARY KEY NOT NULL,
	`project_id` text NOT NULL,
	`name` text NOT NULL,
	FOREIGN KEY (`project_id`) REFERENCES `projects`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `project_skills_project_id_name_unique` ON `project_skills` (`project_id`,`name`);--> statement-breakpoint
CREATE TABLE `project_team_members` (
	`id` text PRIMARY KEY NOT NULL,
	`project_team_id` text NOT NULL,
	`member_id` text NOT NULL,
	`expertise` text,
	`assessment` text,
	`score` text,
	FOREIGN KEY (`project_team_id`) REFERENCES `project_teams`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`member_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `project_team_members_project_team_id_member_id_unique` ON `project_team_members` (`project_team_id`,`member_id`);--> statement-breakpoint
CREATE TABLE `project_teams` (
	`id` text PRIMARY KEY NOT NULL,
	`project_id` text NOT NULL,
	`leader_id` text,
	FOREIGN KEY (`project_id`) REFERENCES `projects`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`leader_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE TABLE `projects` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`title` text,
	`description` text,
	`status` text DEFAULT 'Draft' NOT NULL,
	`applicant_type` text DEFAULT 'Individual & Team' NOT NULL,
	`max_person` text DEFAULT 'Not Specified' NOT NULL,
	`thumbnail` text,
	`level_applicant` text,
	`ui_ux_designer` integer DEFAULT false NOT NULL,
	`front_end_engineer` integer DEFAULT false NOT NULL,
	`back_end_engineer` integer DEFAULT false NOT NULL,
	`data_expert` integer DEFAULT false NOT NULL,
	`certificate` integer DEFAULT false NOT NULL,
	`salary` integer DEFAULT false NOT NULL,
	`is_open_hiring` integer DEFAULT true NOT NULL,
	`currency` text DEFAULT 'IDR' NOT NULL,
	`salary_amount` text DEFAULT '0' NOT NULL,
	`payment_type` text DEFAULT 'person' NOT NULL,
	`project_url` text,
	`start_time` integer,
	`finish_time` integer,
	`created_at` integer,
	`updated_at` integer,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `projects_project_url_unique` ON `projects` (`project_url`);--> statement-breakpoint
CREATE INDEX `projects_status_index` ON `projects` (`status`);--> statement-breakpoint
CREATE TABLE `rate_limits` (
	`key` text PRIMARY KEY NOT NULL,
	`hits` integer NOT NULL,
	`reset_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `social_accounts` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`provider` text NOT NULL,
	`provider_id` text NOT NULL,
	`avatar` text,
	`created_at` integer,
	`updated_at` integer,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `social_accounts_provider_provider_id_unique` ON `social_accounts` (`provider`,`provider_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `social_accounts_user_id_provider_unique` ON `social_accounts` (`user_id`,`provider`);--> statement-breakpoint
CREATE TABLE `social_auth_codes` (
	`code` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`provider` text NOT NULL,
	`expires_at` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `team_applicants` (
	`id` text PRIMARY KEY NOT NULL,
	`project_id` text NOT NULL,
	`from_id` text NOT NULL,
	`to_id` text NOT NULL,
	`status` text DEFAULT 'Applying' NOT NULL,
	`self_describe` text,
	`apply_reason` text,
	`created_at` integer,
	`updated_at` integer,
	FOREIGN KEY (`project_id`) REFERENCES `projects`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`from_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`to_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `team_applicants_status_index` ON `team_applicants` (`status`);--> statement-breakpoint
CREATE UNIQUE INDEX `team_applicants_project_id_from_id_to_id_unique` ON `team_applicants` (`project_id`,`from_id`,`to_id`);--> statement-breakpoint
CREATE TABLE `team_invitations` (
	`id` text PRIMARY KEY NOT NULL,
	`team_id` text NOT NULL,
	`from_id` text NOT NULL,
	`to_id` text NOT NULL,
	`status` text DEFAULT 'Pending' NOT NULL,
	`created_at` integer,
	`updated_at` integer,
	FOREIGN KEY (`team_id`) REFERENCES `teams`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`from_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`to_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `team_invitations_status_index` ON `team_invitations` (`status`);--> statement-breakpoint
CREATE UNIQUE INDEX `team_invitations_team_id_from_id_to_id_unique` ON `team_invitations` (`team_id`,`from_id`,`to_id`);--> statement-breakpoint
CREATE TABLE `team_members` (
	`id` text PRIMARY KEY NOT NULL,
	`team_id` text NOT NULL,
	`member_id` text NOT NULL,
	`expertise` text,
	FOREIGN KEY (`team_id`) REFERENCES `teams`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`member_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `team_members_team_id_member_id_unique` ON `team_members` (`team_id`,`member_id`);--> statement-breakpoint
CREATE TABLE `teams` (
	`id` text PRIMARY KEY NOT NULL,
	`leader_id` text NOT NULL,
	FOREIGN KEY (`leader_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `user_skills` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`name` text NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `user_skills_user_id_name_unique` ON `user_skills` (`user_id`,`name`);--> statement-breakpoint
CREATE TABLE `users` (
	`id` text PRIMARY KEY NOT NULL,
	`first_name` text NOT NULL,
	`last_name` text NOT NULL,
	`role` text NOT NULL,
	`tagname` text,
	`identity_number` text,
	`email` text NOT NULL,
	`email_verified_at` integer,
	`password` text,
	`photo_url` text,
	`expertise` text,
	`university` text,
	`faculty` text,
	`major` text,
	`location` text,
	`biography` text,
	`is_open_hired` integer DEFAULT false NOT NULL,
	`behance` text,
	`github` text,
	`linkedin` text,
	`dribbble` text,
	`website` text,
	`cv_url` text,
	`is_admin` integer DEFAULT false NOT NULL,
	`created_at` integer,
	`updated_at` integer
);
--> statement-breakpoint
CREATE UNIQUE INDEX `users_tagname_unique` ON `users` (`tagname`);--> statement-breakpoint
CREATE UNIQUE INDEX `users_email_unique` ON `users` (`email`);--> statement-breakpoint
CREATE INDEX `users_role_index` ON `users` (`role`);--> statement-breakpoint
CREATE INDEX `users_expertise_index` ON `users` (`expertise`);--> statement-breakpoint
CREATE TABLE `wishlists` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`project_id` text NOT NULL,
	`status` integer DEFAULT true NOT NULL,
	`created_at` integer,
	`updated_at` integer,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`project_id`) REFERENCES `projects`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `wishlists_user_id_project_id_unique` ON `wishlists` (`user_id`,`project_id`);