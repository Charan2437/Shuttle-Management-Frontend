-- Additional tables for enhanced shuttle management system functionality

-- Vehicles table for fleet management
CREATE TABLE vehicles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    vehicle_number VARCHAR(20) UNIQUE NOT NULL,
    model VARCHAR(100) NOT NULL,
    capacity INTEGER NOT NULL CHECK (capacity > 0),
    current_route_id UUID REFERENCES routes(id) ON DELETE SET NULL,
    driver_name VARCHAR(100),
    driver_contact VARCHAR(20),
    gps_device_id VARCHAR(50),
    fuel_type VARCHAR(20) NOT NULL CHECK (fuel_type IN ('diesel', 'electric', 'hybrid')),
    last_maintenance_date DATE,
    next_maintenance_due DATE,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Vehicle location tracking
CREATE TABLE vehicle_locations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    vehicle_id UUID NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
    latitude DECIMAL(10, 8) NOT NULL,
    longitude DECIMAL(11, 8) NOT NULL,
    speed DECIMAL(5, 2),
    heading DECIMAL(5, 2),
    accuracy DECIMAL(8, 2),
    battery_level INTEGER CHECK (battery_level >= 0 AND battery_level <= 100),
    fuel_level INTEGER CHECK (fuel_level >= 0 AND fuel_level <= 100),
    engine_status VARCHAR(20) NOT NULL CHECK (engine_status IN ('running', 'idle', 'off')),
    recorded_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Trip instances (actual shuttle runs)
CREATE TABLE trips (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    route_id UUID NOT NULL REFERENCES routes(id) ON DELETE CASCADE,
    vehicle_id UUID NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
    scheduled_start_time TIMESTAMP WITH TIME ZONE NOT NULL,
    actual_start_time TIMESTAMP WITH TIME ZONE,
    scheduled_end_time TIMESTAMP WITH TIME ZONE NOT NULL,
    actual_end_time TIMESTAMP WITH TIME ZONE,
    current_stop_id UUID REFERENCES stops(id) ON DELETE SET NULL,
    next_stop_id UUID REFERENCES stops(id) ON DELETE SET NULL,
    status VARCHAR(20) NOT NULL CHECK (status IN ('scheduled', 'in_progress', 'completed', 'cancelled', 'delayed')),
    delay_minutes INTEGER DEFAULT 0,
    passenger_count INTEGER NOT NULL DEFAULT 0,
    max_capacity INTEGER NOT NULL,
    driver_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Trip occupancy tracking
CREATE TABLE trip_occupancy (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    trip_id UUID NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
    stop_id UUID NOT NULL REFERENCES stops(id) ON DELETE CASCADE,
    passengers_boarded INTEGER NOT NULL DEFAULT 0,
    passengers_alighted INTEGER NOT NULL DEFAULT 0,
    current_occupancy INTEGER NOT NULL DEFAULT 0,
    recorded_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Booking trip details
CREATE TABLE booking_trips (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_id UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
    trip_id UUID NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
    boarded_at TIMESTAMP WITH TIME ZONE,
    alighted_at TIMESTAMP WITH TIME ZONE,
    actual_boarding_stop_id UUID REFERENCES stops(id) ON DELETE SET NULL,
    actual_alighting_stop_id UUID REFERENCES stops(id) ON DELETE SET NULL,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    feedback TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Student frequent routes
CREATE TABLE student_frequent_routes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    from_stop_id UUID NOT NULL REFERENCES stops(id) ON DELETE CASCADE,
    to_stop_id UUID NOT NULL REFERENCES stops(id) ON DELETE CASCADE,
    usage_count INTEGER NOT NULL DEFAULT 1,
    last_used TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    average_rating DECIMAL(3, 2) CHECK (average_rating >= 1 AND average_rating <= 5),
    total_points_spent INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(student_id, from_stop_id, to_stop_id)
);

-- Payment methods
CREATE TABLE payment_methods (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(50) NOT NULL,
    provider VARCHAR(50),
    is_active BOOLEAN NOT NULL DEFAULT true,
    processing_fee_percentage DECIMAL(5, 4) NOT NULL DEFAULT 0,
    minimum_amount INTEGER NOT NULL DEFAULT 1,
    maximum_amount INTEGER NOT NULL DEFAULT 10000,
    supported_currencies JSONB NOT NULL DEFAULT '["INR"]',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Wallet recharge transactions
CREATE TABLE wallet_recharges (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    payment_method_id UUID NOT NULL REFERENCES payment_methods(id) ON DELETE RESTRICT,
    amount INTEGER NOT NULL CHECK (amount > 0),
    processing_fee INTEGER NOT NULL DEFAULT 0,
    net_amount INTEGER NOT NULL CHECK (net_amount > 0),
    payment_gateway_transaction_id VARCHAR(100),
    payment_status VARCHAR(20) NOT NULL CHECK (payment_status IN ('pending', 'completed', 'failed', 'refunded')),
    payment_reference VARCHAR(50) NOT NULL UNIQUE,
    gateway_response JSONB,
    processed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Service alerts
CREATE TABLE service_alerts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    alert_type VARCHAR(20) NOT NULL CHECK (alert_type IN ('info', 'warning', 'emergency', 'maintenance')),
    severity VARCHAR(20) NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
    affected_routes JSONB,
    affected_stops JSONB,
    start_time TIMESTAMP WITH TIME ZONE NOT NULL,
    end_time TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_by UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Route optimization suggestions
CREATE TABLE route_optimizations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    from_stop_id UUID NOT NULL REFERENCES stops(id) ON DELETE CASCADE,
    to_stop_id UUID NOT NULL REFERENCES stops(id) ON DELETE CASCADE,
    suggested_routes JSONB NOT NULL,
    factors_considered JSONB NOT NULL DEFAULT '["time", "cost", "transfers", "occupancy"]',
    peak_hour_adjustment DECIMAL(3, 2) NOT NULL DEFAULT 1.0,
    base_calculation_time TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- System performance metrics
CREATE TABLE system_metrics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    metric_name VARCHAR(100) NOT NULL,
    metric_value DECIMAL(15, 4) NOT NULL,
    metric_unit VARCHAR(20) NOT NULL,
    category VARCHAR(20) NOT NULL CHECK (category IN ('performance', 'usage', 'financial', 'operational')),
    recorded_at TIMESTAMP WITH TIME ZONE NOT NULL,
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- User preferences
CREATE TABLE user_preferences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    preference_key VARCHAR(100) NOT NULL,
    preference_value TEXT NOT NULL,
    data_type VARCHAR(20) NOT NULL CHECK (data_type IN ('string', 'number', 'boolean', 'json')),
    category VARCHAR(20) NOT NULL CHECK (category IN ('notification', 'booking', 'display', 'privacy')),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, preference_key)
);

-- Booking feedback
CREATE TABLE booking_feedback (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_id UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    trip_id UUID REFERENCES trips(id) ON DELETE SET NULL,
    overall_rating INTEGER NOT NULL CHECK (overall_rating >= 1 AND overall_rating <= 5),
    punctuality_rating INTEGER CHECK (punctuality_rating >= 1 AND punctuality_rating <= 5),
    cleanliness_rating INTEGER CHECK (cleanliness_rating >= 1 AND cleanliness_rating <= 5),
    driver_rating INTEGER CHECK (driver_rating >= 1 AND driver_rating <= 5),
    comfort_rating INTEGER CHECK (comfort_rating >= 1 AND comfort_rating <= 5),
    feedback_text TEXT,
    improvement_suggestions TEXT,
    would_recommend BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(booking_id, student_id)
);

-- Emergency contacts
CREATE TABLE emergency_contacts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    contact_name VARCHAR(100) NOT NULL,
    relationship VARCHAR(50) NOT NULL,
    phone_number VARCHAR(20) NOT NULL,
    email VARCHAR(255),
    is_primary BOOLEAN NOT NULL DEFAULT false,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Route schedule templates
CREATE TABLE route_schedule_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    route_id UUID NOT NULL REFERENCES routes(id) ON DELETE CASCADE,
    template_name VARCHAR(100) NOT NULL,
    day_type VARCHAR(20) NOT NULL CHECK (day_type IN ('weekday', 'weekend', 'holiday')),
    season VARCHAR(20) NOT NULL CHECK (season IN ('regular', 'summer', 'winter', 'exam')),
    frequency_minutes INTEGER NOT NULL CHECK (frequency_minutes > 0),
    first_departure TIME NOT NULL,
    last_departure TIME NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Dynamic pricing rules
CREATE TABLE pricing_rules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    rule_name VARCHAR(100) NOT NULL,
    route_id UUID REFERENCES routes(id) ON DELETE CASCADE,
    time_start TIME NOT NULL,
    time_end TIME NOT NULL,
    days_of_week JSONB NOT NULL DEFAULT '[0,1,2,3,4,5,6]',
    multiplier DECIMAL(4, 2) NOT NULL DEFAULT 1.0,
    fixed_adjustment INTEGER NOT NULL DEFAULT 0,
    condition_type VARCHAR(20) NOT NULL CHECK (condition_type IN ('peak_hour', 'low_demand', 'special_event', 'weather')),
    is_active BOOLEAN NOT NULL DEFAULT true,
    valid_from DATE NOT NULL,
    valid_until DATE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for performance
CREATE INDEX idx_vehicle_locations_vehicle_recorded ON vehicle_locations(vehicle_id, recorded_at DESC);
CREATE INDEX idx_trips_route_scheduled_start ON trips(route_id, scheduled_start_time);
CREATE INDEX idx_trips_vehicle_status ON trips(vehicle_id, status);
CREATE INDEX idx_trip_occupancy_trip_recorded ON trip_occupancy(trip_id, recorded_at);
CREATE INDEX idx_student_frequent_routes_student ON student_frequent_routes(student_id, usage_count DESC);
CREATE INDEX idx_wallet_recharges_student_created ON wallet_recharges(student_id, created_at DESC);
CREATE INDEX idx_service_alerts_active_start ON service_alerts(is_active, start_time DESC) WHERE is_active = true;
CREATE INDEX idx_route_optimizations_stops ON route_optimizations(from_stop_id, to_stop_id);
CREATE INDEX idx_system_metrics_category_recorded ON system_metrics(category, recorded_at DESC);
CREATE INDEX idx_user_preferences_user_category ON user_preferences(user_id, category);
CREATE INDEX idx_booking_feedback_booking ON booking_feedback(booking_id);
CREATE INDEX idx_emergency_contacts_student_primary ON emergency_contacts(student_id, is_primary) WHERE is_active = true;
CREATE INDEX idx_pricing_rules_route_active ON pricing_rules(route_id, is_active) WHERE is_active = true;

-- Insert default payment methods
INSERT INTO payment_methods (name, provider, processing_fee_percentage, minimum_amount, maximum_amount) VALUES
('UPI', 'Razorpay', 0.0, 10, 5000),
('Credit Card', 'Razorpay', 2.5, 50, 10000),
('Debit Card', 'Razorpay', 1.5, 50, 10000),
('Net Banking', 'Razorpay', 1.0, 100, 10000),
('Digital Wallet', 'Paytm', 0.5, 10, 2000);

-- Insert default transaction types for the new features
INSERT INTO transaction_types (name, description) VALUES
('wallet_recharge', 'Wallet recharge transaction'),
('booking_refund', 'Refund for cancelled booking'),
('admin_credit', 'Credit added by admin'),
('penalty_deduction', 'Penalty for no-show or violation');

-- Insert default booking status types
INSERT INTO booking_status_types (name, description, color) VALUES
('boarded', 'Student has boarded the shuttle', '#10B981'),
('completed', 'Trip completed successfully', '#059669'),
('no_show', 'Student did not show up', '#EF4444'),
('missed', 'Student missed the shuttle', '#F59E0B');

-- Create triggers for updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_vehicles_updated_at BEFORE UPDATE ON vehicles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_trips_updated_at BEFORE UPDATE ON trips FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_student_frequent_routes_updated_at BEFORE UPDATE ON student_frequent_routes FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_service_alerts_updated_at BEFORE UPDATE ON service_alerts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_user_preferences_updated_at BEFORE UPDATE ON user_preferences FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_emergency_contacts_updated_at BEFORE UPDATE ON emergency_contacts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_route_schedule_templates_updated_at BEFORE UPDATE ON route_schedule_templates FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
