-- Insert default system settings

INSERT INTO system_settings (setting_key, setting_value, description) VALUES
('borrow_duration_days', '14', 'Number of days a book can be borrowed'),
('fine_per_day', '1.00', 'Fine amount per day for late returns'),
('visit_confirmation_hours', '24', 'Hours within which user must visit library after borrowing'),
('max_books_per_user', '5', 'Maximum books a user can borrow at once'),
('purchase_approval_required', 'true', 'Whether purchase requests need library approval');

-- Insert default admin account

INSERT INTO users (username, password, full_name, email, user_type, city, latitude, longitude) VALUES
('admin', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'System Administrator', 'admin@library.com', 'admin', 'Mumbai', 19.0760, 72.8777);
-- Password: password (use password_hash in PHP for production)


-- username: admin
-- password: password



-- Sample Library User
INSERT INTO users (username, password, full_name, email, phone, address, city, state, pincode, latitude, longitude, user_type) VALUES
('central_library', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Central Public Library', 'central@library.com', '9876543210', 'MG Road', 'Mumbai', 'Maharashtra', '400001', 19.0760, 72.8777, 'library');

INSERT INTO libraries (user_id, library_name, registration_number, established_year, description, opening_hours) VALUES
(2, 'Central Public Library', 'LIB-2024-001', 2020, 'A modern public library with vast collection', 'Mon-Sat: 9AM-8PM');

-- Sample Regular User
INSERT INTO users (username, password, full_name, email, phone, address, city, state, pincode, latitude, longitude, user_type) VALUES
('john_doe', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'John Doe', 'john@example.com', '9876543211', 'Andheri West', 'Mumbai', 'Maharashtra', '400058', 19.1136, 72.8697, 'user');

-- Sample Books
INSERT INTO books (library_id, isbn, title, author, publisher, publication_year, category, price, total_copies, available_copies, description) VALUES
(1, '978-0743273565', 'The Great Gatsby', 'F. Scott Fitzgerald', 'Scribner', 1925, 'Fiction', 15.99, 5, 5, 'A classic American novel'),
(1, '978-0061120084', 'To Kill a Mockingbird', 'Harper Lee', 'Harper Perennial', 1960, 'Fiction', 14.99, 3, 3, 'A gripping tale of racial injustice'),
(1, '978-0451524935', '1984', 'George Orwell', 'Signet Classic', 1949, 'Science Fiction', 13.99, 4, 4, 'Dystopian social science fiction');