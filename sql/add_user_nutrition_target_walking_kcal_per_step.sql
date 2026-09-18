begin;

alter table public.user_nutrition_target
  add column walking_kcal_per_step numeric(8, 4);

comment on column public.user_nutrition_target.walking_kcal_per_step is '每步步行消耗（千卡）';

commit;
