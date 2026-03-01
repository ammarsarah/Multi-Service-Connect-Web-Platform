-- =============================================================================
-- Multi-Service Connect Web Platform - PostgreSQL Schema
-- =============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================================================
-- ENUM TYPES
-- =============================================================================

CREATE TYPE user_role AS ENUM ('client', 'prestataire', 'admin');

CREATE TYPE request_status AS ENUM (
  'pending',
  'accepted',
  'rejected',
  'in_progress',
  'completed',
  'cancelled',
  'disputed'
);

CREATE TYPE transaction_status AS ENUM (
  'pending',
  'succeeded',
  'failed',
  'refunded',
  'partially_refunded'
);

-- =============================================================================
-- TABLES
-- =============================================================================

-- 1. Categories
CREATE TABLE IF NOT EXISTS categories (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name        VARCHAR(100) UNIQUE NOT NULL,
  description TEXT,
  icon        VARCHAR(50),
  is_active   BOOLEAN DEFAULT true,
  created_at  TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Users
CREATE TABLE IF NOT EXISTS users (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name                VARCHAR(100) NOT NULL,
  email               VARCHAR(255) UNIQUE NOT NULL,
  password_hash       VARCHAR(255) NOT NULL,
  role                user_role DEFAULT 'client',
  phone               VARCHAR(20),
  avatar_url          VARCHAR(500),
  is_email_verified   BOOLEAN DEFAULT false,
  is_active           BOOLEAN DEFAULT true,
  is_banned           BOOLEAN DEFAULT false,
  stripe_customer_id  VARCHAR(100),
  created_at          TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at          TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Provider Profiles (extended provider information)
CREATE TABLE IF NOT EXISTS provider_profiles (
  id                   UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id              UUID REFERENCES users(id) ON DELETE CASCADE UNIQUE NOT NULL,
  bio                  TEXT,
  location             VARCHAR(255),
  latitude             DECIMAL(10,8),
  longitude            DECIMAL(11,8),
  skills               TEXT[],
  years_experience     INTEGER DEFAULT 0,
  is_validated         BOOLEAN DEFAULT false,
  validated_at         TIMESTAMP WITH TIME ZONE,
  validated_by         UUID REFERENCES users(id),
  availability_status  VARCHAR(50) DEFAULT 'available',
  response_time_hours  INTEGER DEFAULT 24,
  total_requests       INTEGER DEFAULT 0,
  completed_requests   INTEGER DEFAULT 0,
  success_rate         DECIMAL(5,2) DEFAULT 0,
  avg_rating           DECIMAL(3,2) DEFAULT 0,
  total_earnings       DECIMAL(10,2) DEFAULT 0,
  created_at           TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at           TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Services
CREATE TABLE IF NOT EXISTS services (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  provider_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  category_id     UUID REFERENCES categories(id) ON DELETE SET NULL,
  title           VARCHAR(255) NOT NULL,
  description     TEXT NOT NULL,
  price           DECIMAL(10,2) NOT NULL,
  price_type      VARCHAR(20) DEFAULT 'fixed',  -- fixed, hourly, quote
  location        VARCHAR(255),
  latitude        DECIMAL(10,8),
  longitude       DECIMAL(11,8),
  tags            TEXT[],
  is_active       BOOLEAN DEFAULT true,
  views_count     INTEGER DEFAULT 0,
  requests_count  INTEGER DEFAULT 0,
  avg_rating      DECIMAL(3,2) DEFAULT 0,
  created_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT services_price_positive CHECK (price >= 0),
  CONSTRAINT services_price_type_check CHECK (price_type IN ('fixed', 'hourly', 'quote'))
);

-- 5. Requests
CREATE TABLE IF NOT EXISTS requests (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  service_id      UUID REFERENCES services(id) ON DELETE SET NULL,
  client_id       UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  provider_id     UUID NOT NULL REFERENCES users(id),
  status          request_status DEFAULT 'pending',
  title           VARCHAR(255) NOT NULL,
  description     TEXT,
  budget          DECIMAL(10,2),
  agreed_price    DECIMAL(10,2),
  scheduled_date  TIMESTAMP WITH TIME ZONE,
  started_at      TIMESTAMP WITH TIME ZONE,
  completed_at    TIMESTAMP WITH TIME ZONE,
  cancelled_at    TIMESTAMP WITH TIME ZONE,
  cancel_reason   TEXT,
  notes           TEXT,
  created_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Transactions
CREATE TABLE IF NOT EXISTS transactions (
  id                        UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  request_id                UUID REFERENCES requests(id) ON DELETE SET NULL,
  client_id                 UUID NOT NULL REFERENCES users(id),
  provider_id               UUID NOT NULL REFERENCES users(id),
  amount                    DECIMAL(10,2) NOT NULL,
  commission_amount         DECIMAL(10,2) NOT NULL,
  provider_amount           DECIMAL(10,2) NOT NULL,  -- amount - commission
  currency                  VARCHAR(3) DEFAULT 'EUR',
  status                    transaction_status DEFAULT 'pending',
  stripe_payment_intent_id  VARCHAR(255) UNIQUE,
  stripe_charge_id          VARCHAR(255),
  refund_amount             DECIMAL(10,2) DEFAULT 0,
  refund_reason             TEXT,
  metadata                  JSONB DEFAULT '{}',
  created_at                TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at                TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT transactions_amount_positive     CHECK (amount > 0),
  CONSTRAINT transactions_commission_positive CHECK (commission_amount >= 0),
  CONSTRAINT transactions_provider_positive   CHECK (provider_amount >= 0)
);

-- 7. Reviews
CREATE TABLE IF NOT EXISTS reviews (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  request_id   UUID REFERENCES requests(id) ON DELETE CASCADE UNIQUE,
  reviewer_id  UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  provider_id  UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  rating       INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment      TEXT,
  is_visible   BOOLEAN DEFAULT true,
  created_at   TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 8. Notifications
CREATE TABLE IF NOT EXISTS notifications (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id    UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type       VARCHAR(50) NOT NULL,
  title      VARCHAR(255) NOT NULL,
  message    TEXT NOT NULL,
  data       JSONB DEFAULT '{}',
  is_read    BOOLEAN DEFAULT false,
  read_at    TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 9. Fraud Logs
CREATE TABLE IF NOT EXISTS fraud_logs (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id      UUID REFERENCES users(id) ON DELETE SET NULL,
  type         VARCHAR(100) NOT NULL,
  risk_score   DECIMAL(4,2) NOT NULL,
  details      JSONB NOT NULL DEFAULT '{}',
  is_reviewed  BOOLEAN DEFAULT false,
  reviewed_by  UUID REFERENCES users(id),
  reviewed_at  TIMESTAMP WITH TIME ZONE,
  action_taken VARCHAR(100),
  created_at   TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 10. Refresh Tokens
CREATE TABLE IF NOT EXISTS refresh_tokens (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id    UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token_hash VARCHAR(255) NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 11. Password Resets
CREATE TABLE IF NOT EXISTS password_resets (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id    UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token_hash VARCHAR(255) NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  is_used    BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 12. Email Verifications
CREATE TABLE IF NOT EXISTS email_verifications (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id    UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token_hash VARCHAR(255) NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================================================
-- INDEXES
-- =============================================================================

-- Users
CREATE INDEX IF NOT EXISTS idx_users_email     ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role      ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_is_active ON users(is_active);

-- Provider Profiles
CREATE INDEX IF NOT EXISTS idx_provider_profiles_user_id     ON provider_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_provider_profiles_is_validated ON provider_profiles(is_validated);

-- Services
CREATE INDEX IF NOT EXISTS idx_services_provider_id  ON services(provider_id);
CREATE INDEX IF NOT EXISTS idx_services_category_id  ON services(category_id);
CREATE INDEX IF NOT EXISTS idx_services_is_active    ON services(is_active);
CREATE INDEX IF NOT EXISTS idx_services_location_fts ON services USING GIN (to_tsvector('french', COALESCE(location, '') || ' ' || COALESCE(title, '') || ' ' || COALESCE(description, '')));
CREATE INDEX IF NOT EXISTS idx_services_price        ON services(price);
CREATE INDEX IF NOT EXISTS idx_services_avg_rating   ON services(avg_rating DESC);

-- Requests
CREATE INDEX IF NOT EXISTS idx_requests_client_id   ON requests(client_id);
CREATE INDEX IF NOT EXISTS idx_requests_provider_id ON requests(provider_id);
CREATE INDEX IF NOT EXISTS idx_requests_status      ON requests(status);
CREATE INDEX IF NOT EXISTS idx_requests_created_at  ON requests(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_requests_service_id  ON requests(service_id);

-- Transactions
CREATE INDEX IF NOT EXISTS idx_transactions_client_id                ON transactions(client_id);
CREATE INDEX IF NOT EXISTS idx_transactions_provider_id              ON transactions(provider_id);
CREATE INDEX IF NOT EXISTS idx_transactions_status                   ON transactions(status);
CREATE INDEX IF NOT EXISTS idx_transactions_stripe_payment_intent_id ON transactions(stripe_payment_intent_id);
CREATE INDEX IF NOT EXISTS idx_transactions_request_id               ON transactions(request_id);

-- Reviews
CREATE INDEX IF NOT EXISTS idx_reviews_provider_id  ON reviews(provider_id);
CREATE INDEX IF NOT EXISTS idx_reviews_reviewer_id  ON reviews(reviewer_id);
CREATE INDEX IF NOT EXISTS idx_reviews_rating       ON reviews(rating);
CREATE INDEX IF NOT EXISTS idx_reviews_request_id   ON reviews(request_id);

-- Notifications
CREATE INDEX IF NOT EXISTS idx_notifications_user_id    ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read    ON notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at DESC);

-- Fraud Logs
CREATE INDEX IF NOT EXISTS idx_fraud_logs_user_id     ON fraud_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_fraud_logs_risk_score  ON fraud_logs(risk_score DESC);
CREATE INDEX IF NOT EXISTS idx_fraud_logs_is_reviewed ON fraud_logs(is_reviewed);

-- Refresh Tokens
CREATE INDEX IF NOT EXISTS idx_refresh_tokens_user_id    ON refresh_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_refresh_tokens_expires_at ON refresh_tokens(expires_at);

-- =============================================================================
-- TRIGGER FUNCTION: update_updated_at
-- =============================================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to all tables with updated_at
CREATE TRIGGER trg_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_provider_profiles_updated_at
  BEFORE UPDATE ON provider_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_services_updated_at
  BEFORE UPDATE ON services
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_requests_updated_at
  BEFORE UPDATE ON requests
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_transactions_updated_at
  BEFORE UPDATE ON transactions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =============================================================================
-- FUNCTION: update_provider_stats
-- Recalculates avg_rating, success_rate for a given provider
-- =============================================================================

CREATE OR REPLACE FUNCTION update_provider_stats(p_provider_id UUID)
RETURNS VOID AS $$
DECLARE
  v_avg_rating        DECIMAL(3,2);
  v_total_requests    INTEGER;
  v_completed         INTEGER;
  v_success_rate      DECIMAL(5,2);
  v_total_earnings    DECIMAL(10,2);
BEGIN
  -- Compute average rating from visible reviews
  SELECT COALESCE(ROUND(AVG(rating)::NUMERIC, 2), 0)
    INTO v_avg_rating
    FROM reviews
   WHERE provider_id = p_provider_id
     AND is_visible = true;

  -- Count total and completed requests
  SELECT
    COUNT(*),
    COUNT(*) FILTER (WHERE status = 'completed')
  INTO v_total_requests, v_completed
  FROM requests
  WHERE provider_id = p_provider_id;

  -- Compute success rate
  IF v_total_requests > 0 THEN
    v_success_rate := ROUND((v_completed::DECIMAL / v_total_requests * 100)::NUMERIC, 2);
  ELSE
    v_success_rate := 0;
  END IF;

  -- Sum total earnings from succeeded transactions
  SELECT COALESCE(SUM(provider_amount), 0)
    INTO v_total_earnings
    FROM transactions
   WHERE provider_id = p_provider_id
     AND status = 'succeeded';

  -- Update provider_profiles
  UPDATE provider_profiles
     SET avg_rating        = v_avg_rating,
         total_requests    = v_total_requests,
         completed_requests = v_completed,
         success_rate      = v_success_rate,
         total_earnings    = v_total_earnings,
         updated_at        = NOW()
   WHERE user_id = p_provider_id;

  -- Update avg_rating on all active services for this provider
  UPDATE services s
     SET avg_rating = (
           SELECT COALESCE(ROUND(AVG(r.rating)::NUMERIC, 2), 0)
             FROM reviews r
             JOIN requests req ON req.id = r.request_id
            WHERE req.service_id = s.id
              AND r.is_visible = true
         ),
         requests_count = (
           SELECT COUNT(*)
             FROM requests req
            WHERE req.service_id = s.id
         ),
         updated_at = NOW()
   WHERE s.provider_id = p_provider_id;
END;
$$ LANGUAGE plpgsql;

-- =============================================================================
-- TRIGGER: auto-update provider stats after review insert/update
-- =============================================================================

CREATE OR REPLACE FUNCTION trg_update_provider_stats_fn()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'DELETE' THEN
    PERFORM update_provider_stats(OLD.provider_id);
    RETURN OLD;
  ELSE
    PERFORM update_provider_stats(NEW.provider_id);
    RETURN NEW;
  END IF;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_reviews_update_provider_stats
  AFTER INSERT OR UPDATE OR DELETE ON reviews
  FOR EACH ROW EXECUTE FUNCTION trg_update_provider_stats_fn();

CREATE OR REPLACE FUNCTION trg_update_provider_stats_requests_fn()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM update_provider_stats(NEW.provider_id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_requests_update_provider_stats
  AFTER INSERT OR UPDATE OF status ON requests
  FOR EACH ROW EXECUTE FUNCTION trg_update_provider_stats_requests_fn();
