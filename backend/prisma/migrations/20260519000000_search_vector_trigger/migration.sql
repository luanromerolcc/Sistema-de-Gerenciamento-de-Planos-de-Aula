-- Trigger function: populates "searchVector" on every INSERT or UPDATE.
-- Weights: title=A (highest), discipline+tags=B, objective=C, summary=D.
CREATE OR REPLACE FUNCTION update_lesson_plan_search_vector()
RETURNS trigger AS $$
BEGIN
  NEW."searchVector" :=
    setweight(to_tsvector('portuguese', coalesce(NEW.title, '')), 'A') ||
    setweight(to_tsvector('portuguese', coalesce(NEW.discipline, '')), 'B') ||
    setweight(to_tsvector('portuguese', coalesce(array_to_string(NEW.tags, ' '), '')), 'B') ||
    setweight(to_tsvector('portuguese', coalesce(NEW.objective, '')), 'C') ||
    setweight(to_tsvector('portuguese', coalesce(NEW.summary, '')), 'D');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER lesson_plan_search_vector_trigger
BEFORE INSERT OR UPDATE ON "LessonPlan"
FOR EACH ROW EXECUTE FUNCTION update_lesson_plan_search_vector();

-- GIN index for fast tsvector queries
CREATE INDEX IF NOT EXISTS lesson_plan_search_vector_idx
  ON "LessonPlan" USING GIN ("searchVector");

-- Backfill existing rows by re-triggering the trigger
UPDATE "LessonPlan" SET title = title WHERE TRUE;
