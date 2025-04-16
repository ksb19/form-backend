\c claims_db;

CREATE TABLE claims (
    id SERIAL PRIMARY KEY,
    claim_no VARCHAR(255) NOT NULL,
    claim_date DATE NOT NULL,
    monthly_rent DECIMAL(10,2) NOT NULL,
    tenant_id VARCHAR(255) NOT NULL,
    landlord_id VARCHAR(255) NOT NULL,
    ll_period VARCHAR(7) NOT NULL,
    mobile_no VARCHAR(10) NOT NULL,
    email_id VARCHAR(255) NOT NULL,
    ll_agreement BOOLEAN DEFAULT true,
    bond_id VARCHAR(255) NOT NULL,
    bond_period VARCHAR(255) NOT NULL,
    ll_expiry_date DATE NOT NULL,
    bond_version VARCHAR(255) NOT NULL,
    bond_value DECIMAL(10,2) NOT NULL,
    bond_status VARCHAR(50) NOT NULL,
    claim_status VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE claim_information (
    id SERIAL PRIMARY KEY,
    claim_id INTEGER REFERENCES claims(id),
    check_in_date DATE NOT NULL,
    check_out_date DATE NOT NULL,
    stay_days INTEGER NOT NULL,
    checkout_notice_date DATE NOT NULL,
    lockin_period VARCHAR(255),
    notice_period VARCHAR(255),
    breach_lockin_days VARCHAR(255),
    breach_notice_days VARCHAR(255),
    actual_locking_period VARCHAR(255),
    actual_notice_period VARCHAR(255),
    move_in_video VARCHAR(500),
    move_out_video VARCHAR(500)
);

CREATE TABLE claim_payments (
    id SERIAL PRIMARY KEY,
    claim_id INTEGER REFERENCES claims(id),
    payment_date DATE NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    utr_no VARCHAR(255),
    bank_name VARCHAR(255) NOT NULL,
    t2ll BOOLEAN DEFAULT false,
    eqaro BOOLEAN DEFAULT false,
    tat BOOLEAN DEFAULT false,
    type VARCHAR(255)
);

CREATE TABLE claim_recoveries (
    id SERIAL PRIMARY KEY,
    claim_id INTEGER REFERENCES claims(id),
    receipt_date DATE NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    utr_no VARCHAR(255),
    bank_name VARCHAR(255) NOT NULL,
    t2ll BOOLEAN DEFAULT false,
    eqaro BOOLEAN DEFAULT false,
    tat BOOLEAN DEFAULT false,
    type VARCHAR(255)
);