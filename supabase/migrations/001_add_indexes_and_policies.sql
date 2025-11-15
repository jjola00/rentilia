-- Performance Indexes
-- These indexes improve query performance for common operations

-- Items table indexes
CREATE INDEX IF NOT EXISTS idx_items_owner ON items(owner_id);
CREATE INDEX IF NOT EXISTS idx_items_category ON items(category);
CREATE INDEX IF NOT EXISTS idx_items_available ON items(is_available) WHERE is_available = true;
CREATE INDEX IF NOT EXISTS idx_items_created ON items(created_at DESC);

-- Bookings table indexes
CREATE INDEX IF NOT EXISTS idx_bookings_renter ON bookings(renter_id);
CREATE INDEX IF NOT EXISTS idx_bookings_item ON bookings(item_id);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status);
CREATE INDEX IF NOT EXISTS idx_bookings_dates ON bookings(start_datetime, end_datetime);

-- Messages table indexes
CREATE INDEX IF NOT EXISTS idx_messages_recipient ON messages(recipient_id) WHERE is_read = false;
CREATE INDEX IF NOT EXISTS idx_messages_sender ON messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_booking ON messages(booking_id);

-- Reviews table indexes
CREATE INDEX IF NOT EXISTS idx_reviews_reviewee ON reviews(reviewee_id);
CREATE INDEX IF NOT EXISTS idx_reviews_item ON reviews(item_id);
CREATE INDEX IF NOT EXISTS idx_reviews_booking ON reviews(booking_id);

-- Licenses table indexes
CREATE INDEX IF NOT EXISTS idx_licenses_user ON licenses(user_id);
CREATE INDEX IF NOT EXISTS idx_licenses_verified ON licenses(is_verified) WHERE is_verified = true;

-- User roles table indexes
CREATE INDEX IF NOT EXISTS idx_user_roles_user ON user_roles(user_id);

-- Additional RLS Policies

-- User Roles policies
CREATE POLICY "Users can view their own roles" ON user_roles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own roles" ON user_roles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Bookings policies
CREATE POLICY "Users can view bookings they're involved in" ON bookings
  FOR SELECT USING (
    auth.uid() = renter_id OR 
    auth.uid() IN (SELECT owner_id FROM items WHERE id = item_id)
  );

CREATE POLICY "Renters can create bookings" ON bookings
  FOR INSERT WITH CHECK (auth.uid() = renter_id);

CREATE POLICY "Participants can update booking status" ON bookings
  FOR UPDATE USING (
    auth.uid() = renter_id OR 
    auth.uid() IN (SELECT owner_id FROM items WHERE id = item_id)
  );

-- Messages policies
CREATE POLICY "Users can view their messages" ON messages
  FOR SELECT USING (
    auth.uid() = sender_id OR 
    auth.uid() = recipient_id
  );

CREATE POLICY "Users can send messages" ON messages
  FOR INSERT WITH CHECK (auth.uid() = sender_id);

CREATE POLICY "Recipients can update read status" ON messages
  FOR UPDATE USING (auth.uid() = recipient_id);

-- Reviews policies
CREATE POLICY "Anyone can view reviews" ON reviews
  FOR SELECT USING (true);

CREATE POLICY "Users can create reviews" ON reviews
  FOR INSERT WITH CHECK (auth.uid() = reviewer_id);

-- Licenses policies
CREATE POLICY "Users can view their own licenses" ON licenses
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all licenses" ON licenses
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Users can upload their own licenses" ON licenses
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can update license verification" ON licenses
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin')
  );

-- Return Evidence policies
CREATE POLICY "Booking participants can view return evidence" ON return_evidence
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM bookings 
      WHERE id = booking_id 
      AND (renter_id = auth.uid() OR item_id IN (SELECT id FROM items WHERE owner_id = auth.uid()))
    )
  );

CREATE POLICY "Item owners can upload return evidence" ON return_evidence
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM bookings b
      JOIN items i ON b.item_id = i.id
      WHERE b.id = booking_id AND i.owner_id = auth.uid()
    )
  );

-- Items delete policy
CREATE POLICY "Owners can delete their items" ON items
  FOR DELETE USING (auth.uid() = owner_id);

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_items_updated_at BEFORE UPDATE ON items
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_bookings_updated_at BEFORE UPDATE ON bookings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
