alter table public.harvest_item
    add column sort_order integer;

with ordered_items as (
    select
        id,
        (row_number() over (partition by harvest_id order by id) - 1)::integer as sort_order
    from public.harvest_item
)
update public.harvest_item as harvest_item
set sort_order = ordered_items.sort_order
from ordered_items
where harvest_item.id = ordered_items.id;

alter table public.harvest_item
    alter column sort_order set not null,
    add constraint harvest_item_sort_order_check check (sort_order >= 0),
    add constraint harvest_item_harvest_order_key unique (harvest_id, sort_order);

comment on column public.harvest_item.sort_order is '正文中的行顺序，从0开始';

drop index if exists public.idx_harvest_item_harvest_id_id;
