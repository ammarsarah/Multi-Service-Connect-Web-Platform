-- =============================================================================
-- Multi-Service Connect Web Platform - Seed Data
-- =============================================================================
-- Passwords:
--   Admin:    Admin@123456  -> bcrypt hash below
--   Provider: Provider@123  -> bcrypt hash below
--   Client:   Client@123    -> bcrypt hash below
--
-- All bcrypt hashes use cost factor 12.
-- Admin@123456  => $2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4tbOAOuSXe
-- Provider@123  => $2b$12$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi
-- Client@123    => $2b$12$WGAoFd0ylRMuSV2MR6FDneZpGT6M0T.TgqiPDAoW7p7CiCvBc3ghu
-- =============================================================================

-- =============================================================================
-- CATEGORIES
-- =============================================================================

INSERT INTO categories (id, name, description, icon, is_active) VALUES
  ('11111111-1111-1111-1111-111111111101', 'Plomberie',    'Installation, réparation et entretien de systèmes de plomberie', 'wrench',  true),
  ('11111111-1111-1111-1111-111111111102', 'Électricité',  'Travaux électriques, installation et dépannage',                 'zap',     true),
  ('11111111-1111-1111-1111-111111111103', 'Jardinage',    'Entretien de jardins, taille de haies et paysagisme',            'leaf',    true),
  ('11111111-1111-1111-1111-111111111104', 'Ménage',       'Nettoyage, entretien ménager et services de propreté',           'home',    true),
  ('11111111-1111-1111-1111-111111111105', 'Informatique', 'Dépannage informatique, installation et assistance technique',   'monitor', true)
ON CONFLICT (id) DO NOTHING;

-- =============================================================================
-- USERS
-- =============================================================================

-- Admin user
INSERT INTO users (id, name, email, password_hash, role, phone, is_email_verified, is_active) VALUES
  (
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    'Admin Système',
    'admin@multiservice.com',
    '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4tbOAOuSXe',
    'admin',
    '+33600000000',
    true,
    true
  )
ON CONFLICT (id) DO NOTHING;

-- Provider users
INSERT INTO users (id, name, email, password_hash, role, phone, is_email_verified, is_active) VALUES
  (
    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbb01',
    'Jean Dupont',
    'jean.dupont@provider.com',
    '$2b$12$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
    'prestataire',
    '+33611111111',
    true,
    true
  ),
  (
    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbb02',
    'Marie Martin',
    'marie.martin@provider.com',
    '$2b$12$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
    'prestataire',
    '+33622222222',
    true,
    true
  ),
  (
    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbb03',
    'Pierre Bernard',
    'pierre.bernard@provider.com',
    '$2b$12$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
    'prestataire',
    '+33633333333',
    true,
    true
  )
ON CONFLICT (id) DO NOTHING;

-- Client users
INSERT INTO users (id, name, email, password_hash, role, phone, is_email_verified, is_active) VALUES
  (
    'cccccccc-cccc-cccc-cccc-cccccccccc01',
    'Sophie Leroy',
    'sophie.leroy@client.com',
    '$2b$12$WGAoFd0ylRMuSV2MR6FDneZpGT6M0T.TgqiPDAoW7p7CiCvBc3ghu',
    'client',
    '+33644444444',
    true,
    true
  ),
  (
    'cccccccc-cccc-cccc-cccc-cccccccccc02',
    'Thomas Moreau',
    'thomas.moreau@client.com',
    '$2b$12$WGAoFd0ylRMuSV2MR6FDneZpGT6M0T.TgqiPDAoW7p7CiCvBc3ghu',
    'client',
    '+33655555555',
    true,
    true
  ),
  (
    'cccccccc-cccc-cccc-cccc-cccccccccc03',
    'Isabelle Petit',
    'isabelle.petit@client.com',
    '$2b$12$WGAoFd0ylRMuSV2MR6FDneZpGT6M0T.TgqiPDAoW7p7CiCvBc3ghu',
    'client',
    '+33666666666',
    true,
    true
  )
ON CONFLICT (id) DO NOTHING;

-- =============================================================================
-- PROVIDER PROFILES
-- =============================================================================

INSERT INTO provider_profiles (
  id, user_id, bio, location, latitude, longitude,
  skills, years_experience, is_validated, validated_at, validated_by,
  availability_status, response_time_hours
) VALUES
  (
    'dddddddd-dddd-dddd-dddd-dddddddddd01',
    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbb01',
    'Plombier certifié avec plus de 10 ans d''expérience. Intervention rapide en urgence.',
    'Paris, Île-de-France',
    48.85341,
    2.34880,
    ARRAY['plomberie', 'chauffage', 'sanitaire', 'chauffe-eau'],
    10,
    true,
    NOW() - INTERVAL '30 days',
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    'available',
    4
  ),
  (
    'dddddddd-dddd-dddd-dddd-dddddddddd02',
    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbb02',
    'Électricienne qualifiée, spécialisée dans la rénovation et la mise aux normes.',
    'Lyon, Auvergne-Rhône-Alpes',
    45.74846,
    4.84671,
    ARRAY['électricité', 'tableaux électriques', 'domotique', 'éclairage'],
    7,
    true,
    NOW() - INTERVAL '20 days',
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    'available',
    8
  ),
  (
    'dddddddd-dddd-dddd-dddd-dddddddddd03',
    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbb03',
    'Expert en jardinage et paysagisme. Création et entretien d''espaces verts.',
    'Marseille, Provence-Alpes-Côte d''Azur',
    43.29695,
    5.38107,
    ARRAY['jardinage', 'paysagisme', 'taille', 'pelouse', 'arrosage'],
    15,
    true,
    NOW() - INTERVAL '15 days',
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    'available',
    12
  )
ON CONFLICT (id) DO NOTHING;

-- =============================================================================
-- SERVICES
-- =============================================================================

INSERT INTO services (
  id, provider_id, category_id, title, description,
  price, price_type, location, latitude, longitude,
  tags, is_active
) VALUES
  (
    'eeeeeeee-eeee-eeee-eeee-eeeeeeeeee01',
    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbb01',
    '11111111-1111-1111-1111-111111111101',
    'Réparation de fuite d''eau urgente',
    'Intervention rapide pour toute fuite d''eau : robinets, tuyaux, siphons. Disponible 7j/7.',
    80.00,
    'fixed',
    'Paris et petite couronne',
    48.85341,
    2.34880,
    ARRAY['fuite', 'urgence', 'robinet', 'tuyau'],
    true
  ),
  (
    'eeeeeeee-eeee-eeee-eeee-eeeeeeeeee02',
    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbb02',
    '11111111-1111-1111-1111-111111111102',
    'Installation tableau électrique',
    'Remplacement et mise aux normes de tableaux électriques résidentiels et professionnels.',
    150.00,
    'fixed',
    'Lyon et agglomération',
    45.74846,
    4.84671,
    ARRAY['tableau électrique', 'mise aux normes', 'disjoncteur'],
    true
  ),
  (
    'eeeeeeee-eeee-eeee-eeee-eeeeeeeeee03',
    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbb03',
    '11111111-1111-1111-1111-111111111103',
    'Entretien jardin mensuel',
    'Tonte, désherbage, taille des haies et arrosage. Contrat mensuel disponible.',
    60.00,
    'hourly',
    'Marseille et alentours',
    43.29695,
    5.38107,
    ARRAY['tonte', 'taille', 'entretien', 'jardin'],
    true
  ),
  (
    'eeeeeeee-eeee-eeee-eeee-eeeeeeeeee04',
    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbb01',
    '11111111-1111-1111-1111-111111111104',
    'Nettoyage appartement complet',
    'Nettoyage en profondeur de votre appartement : cuisine, salle de bain, chambres.',
    120.00,
    'fixed',
    'Paris, 75',
    48.86000,
    2.35000,
    ARRAY['ménage', 'nettoyage', 'appartement', 'entretien'],
    true
  ),
  (
    'eeeeeeee-eeee-eeee-eeee-eeeeeeeeee05',
    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbb02',
    '11111111-1111-1111-1111-111111111105',
    'Dépannage informatique à domicile',
    'Résolution de problèmes PC/Mac, installation logiciels, configuration réseau Wi-Fi.',
    50.00,
    'hourly',
    'Lyon, Villeurbanne',
    45.76000,
    4.85000,
    ARRAY['informatique', 'PC', 'réseau', 'Wi-Fi', 'virus'],
    true
  )
ON CONFLICT (id) DO NOTHING;

-- =============================================================================
-- REQUESTS
-- =============================================================================

INSERT INTO requests (
  id, service_id, client_id, provider_id, status,
  title, description, budget, agreed_price, scheduled_date,
  started_at, completed_at
) VALUES
  (
    'ffffffff-ffff-ffff-ffff-ffffffffffff01',
    'eeeeeeee-eeee-eeee-eeee-eeeeeeeeee01',
    'cccccccc-cccc-cccc-cccc-cccccccccc01',
    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbb01',
    'completed',
    'Fuite sous l''évier cuisine',
    'J''ai une fuite importante sous l''évier de ma cuisine. Besoin d''intervention rapide.',
    100.00,
    80.00,
    NOW() - INTERVAL '10 days',
    NOW() - INTERVAL '10 days',
    NOW() - INTERVAL '9 days'
  ),
  (
    'ffffffff-ffff-ffff-ffff-ffffffffffff02',
    'eeeeeeee-eeee-eeee-eeee-eeeeeeeeee02',
    'cccccccc-cccc-cccc-cccc-cccccccccc02',
    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbb02',
    'accepted',
    'Remplacement tableau électrique vétuste',
    'Mon tableau a plus de 30 ans, je souhaite le faire remplacer pour être aux normes.',
    200.00,
    150.00,
    NOW() + INTERVAL '3 days',
    NULL,
    NULL
  ),
  (
    'ffffffff-ffff-ffff-ffff-ffffffffffff03',
    'eeeeeeee-eeee-eeee-eeee-eeeeeeeeee03',
    'cccccccc-cccc-cccc-cccc-cccccccccc03',
    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbb03',
    'pending',
    'Entretien jardin printemps',
    'Besoin d''un entretien complet de mon jardin pour le printemps. Environ 200m².',
    150.00,
    NULL,
    NOW() + INTERVAL '7 days',
    NULL,
    NULL
  )
ON CONFLICT (id) DO NOTHING;

-- =============================================================================
-- TRANSACTIONS
-- =============================================================================

INSERT INTO transactions (
  id, request_id, client_id, provider_id,
  amount, commission_amount, provider_amount,
  currency, status, stripe_payment_intent_id, metadata
) VALUES
  (
    'gggggggg-gggg-gggg-gggg-gggggggggg01',
    'ffffffff-ffff-ffff-ffff-ffffffffffff01',
    'cccccccc-cccc-cccc-cccc-cccccccccc01',
    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbb01',
    80.00,
    8.00,   -- 10% commission
    72.00,
    'EUR',
    'succeeded',
    'pi_test_seed_001',
    '{"service": "Réparation fuite eau", "note": "seed data"}'
  ),
  (
    'gggggggg-gggg-gggg-gggg-gggggggggg02',
    'ffffffff-ffff-ffff-ffff-ffffffffffff02',
    'cccccccc-cccc-cccc-cccc-cccccccccc02',
    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbb02',
    150.00,
    15.00,  -- 10% commission
    135.00,
    'EUR',
    'pending',
    'pi_test_seed_002',
    '{"service": "Installation tableau électrique", "note": "seed data"}'
  )
ON CONFLICT (id) DO NOTHING;

-- =============================================================================
-- REVIEWS
-- =============================================================================

INSERT INTO reviews (
  id, request_id, reviewer_id, provider_id,
  rating, comment, is_visible
) VALUES
  (
    'hhhhhhhh-hhhh-hhhh-hhhh-hhhhhhhhhh01',
    'ffffffff-ffff-ffff-ffff-ffffffffffff01',
    'cccccccc-cccc-cccc-cccc-cccccccccc01',
    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbb01',
    5,
    'Intervention très rapide et professionnelle. Jean a résolu mon problème en moins d''une heure. Je recommande vivement !',
    true
  )
ON CONFLICT (id) DO NOTHING;

-- Seed a second review (without a linked request to avoid UNIQUE constraint issues)
INSERT INTO reviews (
  id, request_id, reviewer_id, provider_id,
  rating, comment, is_visible
) VALUES
  (
    'hhhhhhhh-hhhh-hhhh-hhhh-hhhhhhhhhh02',
    NULL,
    'cccccccc-cccc-cccc-cccc-cccccccccc02',
    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbb02',
    4,
    'Marie est très compétente. Le tableau a été installé proprement. Légèrement en retard mais travail de qualité.',
    true
  ),
  (
    'hhhhhhhh-hhhh-hhhh-hhhh-hhhhhhhhhh03',
    NULL,
    'cccccccc-cccc-cccc-cccc-cccccccccc03',
    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbb03',
    5,
    'Pierre est passionné par son métier. Mon jardin est magnifique ! Je l''ai pris en abonnement mensuel.',
    true
  )
ON CONFLICT (id) DO NOTHING;

-- =============================================================================
-- Refresh provider stats after seed
-- =============================================================================

SELECT update_provider_stats('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbb01');
SELECT update_provider_stats('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbb02');
SELECT update_provider_stats('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbb03');
