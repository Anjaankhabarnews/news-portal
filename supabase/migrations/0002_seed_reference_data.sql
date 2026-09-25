-- Reference data generated from src/config/taxonomy.ts — re-run safely.

insert into sections (slug, name, short_name, kind, description, is_home, sort_order) values
  ('jharkhand', 'Jharkhand', null, 'state', 'Our home state. Reporting from Jamshedpur, Ranchi and all 24 districts of Jharkhand.', true, 1),
  ('bihar', 'Bihar', null, 'state', 'News and developments from across Bihar.', false, 2),
  ('odisha', 'Odisha', null, 'state', 'News and developments from across Odisha.', false, 3),
  ('west-bengal', 'West Bengal', 'Bengal', 'state', 'News and developments from across West Bengal.', false, 4),
  ('uttar-pradesh', 'Uttar Pradesh', 'UP', 'state', 'News and developments from across Uttar Pradesh.', false, 5),
  ('india', 'India', null, 'national', 'National news, policy and developments from across India.', false, 6),
  ('business', 'Business', null, 'topic', 'Economy, industry, markets, jobs and money — with a regional lens.', false, 7),
  ('sports', 'Sports', null, 'topic', 'Cricket, football, hockey, athletics and grassroots sport.', false, 8),
  ('politics', 'Politics', null, 'topic', 'Governance, elections, policy and public life.', false, 9),
  ('education', 'Education', null, 'topic', 'Schools, colleges, exams and careers.', false, 10),
  ('health', 'Health', null, 'topic', 'Public health, hospitals and wellbeing.', false, 11),
  ('entertainment', 'Entertainment', null, 'topic', 'Film, music, culture and regional cinema.', false, 12),
  ('technology', 'Technology', null, 'topic', 'Digital life, startups and technology policy.', false, 13)
on conflict (slug) do update set name = excluded.name, short_name = excluded.short_name, kind = excluded.kind, description = excluded.description, is_home = excluded.is_home, sort_order = excluded.sort_order;

insert into localities (section_slug, slug, name, type, district, featured, description, sort_order) values
  ('jharkhand', 'jamshedpur', 'Jamshedpur', 'city', 'East Singhbhum', true, 'News from the Steel City and East Singhbhum district.', 1),
  ('jharkhand', 'ranchi', 'Ranchi', 'district', null, true, 'News from the state capital and Ranchi district.', 2),
  ('jharkhand', 'dhanbad', 'Dhanbad', 'district', null, false, null, 3),
  ('jharkhand', 'bokaro', 'Bokaro', 'district', null, false, null, 4),
  ('jharkhand', 'hazaribagh', 'Hazaribagh', 'district', null, false, null, 5),
  ('jharkhand', 'deoghar', 'Deoghar', 'district', null, false, null, 6),
  ('jharkhand', 'giridih', 'Giridih', 'district', null, false, null, 7),
  ('jharkhand', 'seraikela-kharsawan', 'Seraikela Kharsawan', 'district', null, false, null, 8),
  ('jharkhand', 'west-singhbhum', 'West Singhbhum', 'district', null, false, null, 9),
  ('jharkhand', 'ramgarh', 'Ramgarh', 'district', null, false, null, 10),
  ('jharkhand', 'dumka', 'Dumka', 'district', null, false, null, 11),
  ('jharkhand', 'palamu', 'Palamu', 'district', null, false, null, 12),
  ('jharkhand', 'koderma', 'Koderma', 'district', null, false, null, 13),
  ('jharkhand', 'chatra', 'Chatra', 'district', null, false, null, 14),
  ('jharkhand', 'garhwa', 'Garhwa', 'district', null, false, null, 15),
  ('jharkhand', 'godda', 'Godda', 'district', null, false, null, 16),
  ('jharkhand', 'gumla', 'Gumla', 'district', null, false, null, 17),
  ('jharkhand', 'jamtara', 'Jamtara', 'district', null, false, null, 18),
  ('jharkhand', 'khunti', 'Khunti', 'district', null, false, null, 19),
  ('jharkhand', 'latehar', 'Latehar', 'district', null, false, null, 20),
  ('jharkhand', 'lohardaga', 'Lohardaga', 'district', null, false, null, 21),
  ('jharkhand', 'pakur', 'Pakur', 'district', null, false, null, 22),
  ('jharkhand', 'sahebganj', 'Sahebganj', 'district', null, false, null, 23),
  ('jharkhand', 'simdega', 'Simdega', 'district', null, false, null, 24)
on conflict (section_slug, slug) do update set name = excluded.name, type = excluded.type, district = excluded.district, featured = excluded.featured, description = excluded.description, sort_order = excluded.sort_order;

insert into authors (slug, name, role, is_desk) values
  ('newsroom', 'Anjaan Khabar Newsroom', 'Newsroom', true),
  ('jharkhand-desk', 'Jharkhand Desk', 'State desk', true),
  ('jamshedpur-desk', 'Jamshedpur Desk', 'City desk', true),
  ('ranchi-desk', 'Ranchi Desk', 'City desk', true),
  ('regional-desk', 'Regional Desk', 'States desk', true),
  ('national-desk', 'National Desk', 'National desk', true),
  ('business-desk', 'Business Desk', 'Business desk', true),
  ('sports-desk', 'Sports Desk', 'Sports desk', true),
  ('explainers-desk', 'Explainers Desk', 'Explainers', true)
on conflict (slug) do nothing;

insert into social_links (id, label, href, sort_order) values
  ('instagram', 'Instagram', 'https://www.instagram.com/anjaan_khabar/', 1),
  ('facebook', 'Facebook', 'https://www.facebook.com/profile.php?id=61585995166150', 2)
on conflict (id) do update set label = excluded.label, href = excluded.href, sort_order = excluded.sort_order;
