-- Seed Owner user (email login). Password: "password"
-- BCrypt hash for "password": $2a$10$EIXCh3c7kq0y0jvM7XbZVu6E5FQ7Wv9w3l3M2G5m3oWf1w2o4d6mS
insert into users (email, password_hash, display_name, provider)
values ('owner@example.com', '$2a$10$EIXCh3c7kq0y0jvM7XbZVu6E5FQ7Wv9w3l3M2G5m3oWf1w2o4d6mS', 'Owner User', 'EMAIL')
on conflict do nothing;

insert into calendars (name, color, created_by)
select 'My Calendar', '#4f46e5', u.id from users u where u.email='owner@example.com'
on conflict do nothing;

insert into calendar_members (calendar_id, user_id, role)
select c.id, u.id, 'OWNER'
from calendars c
join users u on u.email='owner@example.com'
where c.name='My Calendar'
on conflict do nothing;
