begin;

alter table public.diet_daily_report
  add column if not exists step_count integer;

alter table public.diet_daily_report
  add constraint diet_daily_report_step_count_check check (step_count is null or step_count >= 0);

comment on column public.diet_daily_report.step_count is '当日步数（选填）';

commit;
