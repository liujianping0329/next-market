begin;

alter table public.diet_daily_report
  add column if not exists nut_calories_kcal numeric(10, 2),
  add column if not exists nut_protein_g numeric(10, 2),
  add column if not exists nut_fat_g numeric(10, 2),
  add column if not exists nut_saturated_fat_g numeric(10, 2),
  add column if not exists nut_carbohydrate_g numeric(10, 2),
  add column if not exists nut_dietary_fiber_g numeric(10, 2),
  add column if not exists nut_vitamin_a_ug numeric(10, 2),
  add column if not exists nut_vitamin_b1_mg numeric(10, 2),
  add column if not exists nut_vitamin_b2_mg numeric(10, 2),
  add column if not exists nut_vitamin_b6_mg numeric(10, 2),
  add column if not exists nut_vitamin_b12_ug numeric(10, 2),
  add column if not exists nut_vitamin_c_mg numeric(10, 2),
  add column if not exists nut_vitamin_d_ug numeric(10, 2),
  add column if not exists nut_calcium_mg numeric(10, 2),
  add column if not exists nut_iron_mg numeric(10, 2),
  add column if not exists nut_sodium_mg numeric(10, 2),
  add column if not exists nut_potassium_mg numeric(10, 2);

alter table public.diet_daily_report
  drop column if exists nut_vitamin_b_group,
  drop column if exists nut_confidence,
  drop column if exists nut_model,
  drop column if exists nut_raw,
  drop column if exists nut_calculated_at;

comment on column public.diet_daily_report.nut_calories_kcal is '日报总热量（千卡）';
comment on column public.diet_daily_report.nut_protein_g is '日报总蛋白质（克）';
comment on column public.diet_daily_report.nut_fat_g is '日报总脂肪（克）';
comment on column public.diet_daily_report.nut_saturated_fat_g is '日报总饱和脂肪（克）';
comment on column public.diet_daily_report.nut_carbohydrate_g is '日报总碳水化合物（克）';
comment on column public.diet_daily_report.nut_dietary_fiber_g is '日报总膳食纤维（克）';
comment on column public.diet_daily_report.nut_vitamin_a_ug is '日报总维生素A（微克）';
comment on column public.diet_daily_report.nut_vitamin_b1_mg is '日报总维生素B1（毫克）';
comment on column public.diet_daily_report.nut_vitamin_b2_mg is '日报总维生素B2（毫克）';
comment on column public.diet_daily_report.nut_vitamin_b6_mg is '日报总维生素B6（毫克）';
comment on column public.diet_daily_report.nut_vitamin_b12_ug is '日报总维生素B12（微克）';
comment on column public.diet_daily_report.nut_vitamin_c_mg is '日报总维生素C（毫克）';
comment on column public.diet_daily_report.nut_vitamin_d_ug is '日报总维生素D（微克）';
comment on column public.diet_daily_report.nut_calcium_mg is '日报总钙（毫克）';
comment on column public.diet_daily_report.nut_iron_mg is '日报总铁（毫克）';
comment on column public.diet_daily_report.nut_sodium_mg is '日报总钠（毫克）';
comment on column public.diet_daily_report.nut_potassium_mg is '日报总钾（毫克）';

alter table public.album_item
  drop column if exists calories_kcal,
  drop column if exists protein_g,
  drop column if exists fat_g,
  drop column if exists saturated_fat_g,
  drop column if exists carbohydrate_g,
  drop column if exists dietary_fiber_g,
  drop column if exists vitamin_a_ug,
  drop column if exists vitamin_b_group,
  drop column if exists vitamin_c_mg,
  drop column if exists vitamin_d_ug,
  drop column if exists calcium_mg,
  drop column if exists iron_mg,
  drop column if exists sodium_mg,
  drop column if exists potassium_mg,
  drop column if exists nutrition_confidence,
  drop column if exists nutrition_model,
  drop column if exists nutrition_raw,
  drop column if exists nutrition_calculated_at;

commit;
