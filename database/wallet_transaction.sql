-- Atomic Wallet Transaction Function
-- This function ensures wallet updates and transaction logs are consistent
-- Execute this in your Supabase SQL editor

CREATE OR REPLACE FUNCTION wallet_transaction(
  p_user_id UUID,
  p_amount DECIMAL(10,2),
  p_type TEXT,
  p_description TEXT,
  p_agent_slug TEXT DEFAULT NULL,
  p_stripe_session_id TEXT DEFAULT NULL
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  current_balance DECIMAL(10,2);
  new_balance DECIMAL(10,2);
  transaction_id UUID;
  result JSON;
BEGIN
  -- Validate input parameters
  IF p_user_id IS NULL THEN
    RAISE EXCEPTION 'User ID cannot be null';
  END IF;
  
  IF p_amount IS NULL OR p_amount = 0 THEN
    RAISE EXCEPTION 'Amount cannot be null or zero';
  END IF;
  
  IF p_type NOT IN ('top_up', 'agent_usage', 'refund') THEN
    RAISE EXCEPTION 'Invalid transaction type: %', p_type;
  END IF;

  -- Lock the user row to prevent concurrent modifications
  SELECT wallet_balance INTO current_balance
  FROM users 
  WHERE id = p_user_id
  FOR UPDATE;
  
  -- Check if user exists
  IF NOT FOUND THEN
    RAISE EXCEPTION 'User not found: %', p_user_id;
  END IF;
  
  -- Calculate new balance
  new_balance := current_balance + p_amount;
  
  -- Prevent negative balances for agent usage
  IF p_type = 'agent_usage' AND new_balance < 0 THEN
    RAISE EXCEPTION 'Insufficient balance. Current: %, Required: %', current_balance, ABS(p_amount);
  END IF;
  
  -- Update wallet balance
  UPDATE users 
  SET 
    wallet_balance = new_balance,
    updated_at = NOW()
  WHERE id = p_user_id;
  
  -- Insert transaction record
  INSERT INTO wallet_transactions (
    user_id,
    amount,
    type,
    description,
    agent_slug,
    stripe_session_id,
    created_at
  ) VALUES (
    p_user_id,
    p_amount,
    p_type,
    p_description,
    p_agent_slug,
    p_stripe_session_id,
    NOW()
  ) RETURNING id INTO transaction_id;
  
  -- Return result
  result := json_build_object(
    'success', true,
    'transaction_id', transaction_id,
    'previous_balance', current_balance,
    'new_balance', new_balance,
    'amount', p_amount,
    'type', p_type
  );
  
  RETURN result;
  
EXCEPTION
  WHEN OTHERS THEN
    -- Log the error and re-raise
    RAISE EXCEPTION 'Wallet transaction failed: %', SQLERRM;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION wallet_transaction TO authenticated;

-- Create index for better performance if not exists
CREATE INDEX IF NOT EXISTS idx_wallet_transactions_user_id_created_at 
ON wallet_transactions(user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_wallet_transactions_type 
ON wallet_transactions(type);

CREATE INDEX IF NOT EXISTS idx_wallet_transactions_stripe_session 
ON wallet_transactions(stripe_session_id) 
WHERE stripe_session_id IS NOT NULL;

-- Add database constraints for better data integrity
ALTER TABLE wallet_transactions 
ADD CONSTRAINT check_transaction_type 
CHECK (type IN ('top_up', 'agent_usage', 'refund'));

ALTER TABLE wallet_transactions 
ADD CONSTRAINT check_amount_not_zero 
CHECK (amount != 0);

ALTER TABLE users 
ADD CONSTRAINT check_wallet_balance_not_negative 
CHECK (wallet_balance >= 0);

-- Create a function to get wallet summary
CREATE OR REPLACE FUNCTION get_wallet_summary(p_user_id UUID)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result JSON;
BEGIN
  SELECT json_build_object(
    'user_id', u.id,
    'current_balance', u.wallet_balance,
    'total_topped_up', COALESCE(SUM(CASE WHEN wt.type = 'top_up' THEN wt.amount ELSE 0 END), 0),
    'total_spent', COALESCE(SUM(CASE WHEN wt.type = 'agent_usage' THEN ABS(wt.amount) ELSE 0 END), 0),
    'total_refunded', COALESCE(SUM(CASE WHEN wt.type = 'refund' THEN wt.amount ELSE 0 END), 0),
    'transaction_count', COUNT(wt.id),
    'last_transaction_date', MAX(wt.created_at)
  ) INTO result
  FROM users u
  LEFT JOIN wallet_transactions wt ON u.id = wt.user_id
  WHERE u.id = p_user_id
  GROUP BY u.id, u.wallet_balance;
  
  RETURN COALESCE(result, json_build_object('error', 'User not found'));
END;
$$;

GRANT EXECUTE ON FUNCTION get_wallet_summary TO authenticated;