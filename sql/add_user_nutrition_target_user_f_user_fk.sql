begin;

alter table public.user_nutrition_target
  add constraint user_nutrition_target_user_id_fkey
  foreign key (user_id) references public.f_user(id);

commit;
