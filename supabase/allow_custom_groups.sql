-- Allow products on any root category page (Decorations, Gifts, ...), not only Flowers/Cakes/Combos.
alter table public.products drop constraint if exists products_group_type_check;
