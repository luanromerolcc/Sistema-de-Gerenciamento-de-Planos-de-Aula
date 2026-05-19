-- Indexes for common filter/sort columns
CREATE INDEX IF NOT EXISTS "LessonPlan_discipline_idx" ON "LessonPlan" (discipline);
CREATE INDEX IF NOT EXISTS "LessonPlan_scheduledAt_idx" ON "LessonPlan" ("scheduledAt");
CREATE INDEX IF NOT EXISTS "LessonPlan_createdAt_idx" ON "LessonPlan" ("createdAt");
