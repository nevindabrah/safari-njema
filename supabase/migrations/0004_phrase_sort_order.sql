-- Adds a teaching order to the phrase bank. When two phrases fit a stop equally well, the earlier one in v1 wins.
-- No new table, so no new policies. The existing read policy on phrases covers this column.

alter table public.phrases add column sort_order int not null default 0;
create index phrases_sort_order_idx on public.phrases (sort_order);
