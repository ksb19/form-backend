const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
require('dotenv').config();

const app = express();

app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

app.post('/api/claims', async (req, res) => {
  const client = await pool.connect();
  
  try {
    const { bondInfo, claimInfo, claimPayment, claimRecovery } = req.body;
    
    await client.query('BEGIN');
    
    // Insert main claim
    const claimResult = await client.query(
      `INSERT INTO claims (
        claim_no, claim_date, monthly_rent, tenant_id, landlord_id, 
        ll_period, mobile_no, email_id, ll_agreement, bond_id, 
        bond_period, ll_expiry_date, bond_version, bond_value, 
        bond_status, claim_status
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16) 
      RETURNING id`,
      [
        bondInfo.claimNo,
        bondInfo.claimDate,
        bondInfo.monthlyRent.replace('₹', '').replace(/,/g, ''),
        bondInfo.tenantId,
        bondInfo.landlordId,
        bondInfo.llPeriod,
        bondInfo.mobileNo,
        bondInfo.emailId,
        bondInfo.llAgreement === 'Yes',
        bondInfo.bondId,
        bondInfo.bondPeriod,
        bondInfo.llExpiryDate,
        bondInfo.bondVersion,
        bondInfo.bondValue.replace('₹', '').replace(/,/g, ''),
        bondInfo.bondStatus,
        bondInfo.claimStatus
      ]
    );
    
    const claimId = claimResult.rows[0].id;
    
    // Insert claim information
    await client.query(
      `INSERT INTO claim_information (
        claim_id, check_in_date, check_out_date, stay_days, 
        checkout_notice_date, lockin_period, notice_period, 
        breach_lockin_days, breach_notice_days, actual_locking_period, 
        actual_notice_period, move_in_video, move_out_video
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)`,
      [
        claimId,
        claimInfo.checkInDate,
        claimInfo.checkOutDate,
        claimInfo.stayDays.replace(' Days', ''),
        claimInfo.checkoutNoticeDate,
        claimInfo.lockinPeriod,
        claimInfo.noticePeriod,
        claimInfo.breachLockinDays,
        claimInfo.breachNoticeDays,
        claimInfo.actualLockingPeriod,
        claimInfo.actualNoticePeriod,
        claimInfo.moveInVideo,
        claimInfo.moveOutVideo
      ]
    );
    
    // Insert payments
    for (const payment of claimPayment) {
      await client.query(
        `INSERT INTO claim_payments (
          claim_id, payment_date, amount, utr_no, bank_name, 
          t2ll, eqaro, tat, type
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
        [
          claimId,
          payment.paymentDate,
          payment.amount.replace('₹', '').replace(/,/g, ''),
          payment.utrNo,
          payment.bankName,
          payment.t2ll === 'Yes',
          payment.eqaro === 'Yes',
          payment.tat === 'Yes',
          payment.type
        ]
      );
    }
    
    // Insert recoveries
    for (const recovery of claimRecovery) {
      await client.query(
        `INSERT INTO claim_recoveries (
          claim_id, receipt_date, amount, utr_no, bank_name, 
          t2ll, eqaro, tat, type
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
        [
          claimId,
          recovery.receiptDate,
          recovery.amount.replace('₹', '').replace(/,/g, ''),
          recovery.utrNo,
          recovery.bankName,
          recovery.t2ll === 'Yes',
          recovery.eqaro === 'Yes',
          recovery.tat === 'Yes',
          recovery.type
        ]
      );
    }
    
    await client.query('COMMIT');
    res.json({ success: true, message: 'Claim submitted successfully' });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Error:', err);
    res.status(500).json({ 
      success: false, 
      message: 'Error submitting claim',
      error: err.message 
    });
  } finally {
    client.release();
  }
});

const PORT = process.env.PORT || 5000;
const HOST = 'localhost';
app.listen(PORT, HOST, () => {
    console.log(`Server running at http://${HOST}:${PORT}`);
  });