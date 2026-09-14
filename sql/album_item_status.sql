-- album_item 新建表时，在 created_at 之后增加以下字段：
-- status integer not null default 1,
-- comment on column public.album_item.status is '成分确认状态：1未确认，2已确认';

-- 已有数据库增量执行
alter table public.album_item
add column status integer not null default 1;

comment on column public.album_item.status is '成分确认状态：1未确认，2已确认';
