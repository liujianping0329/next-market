-- 现有表增量执行：移除不再使用的字段
alter table public.diet_daily_report
drop column if exists daily_nutrition,
drop column if exists meal_nutrition,
drop column if exists questionnaire_created_at,
drop column if exists questionnaire_push_at,
drop column if exists updated_at;
