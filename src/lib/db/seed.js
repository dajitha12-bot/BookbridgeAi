const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const DATA_DIR = path.join(__dirname, '../../../data');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
  return `${salt}:${hash}`;
}

const mockPassword = hashPassword('password123');

// 1. Users & Profiles
const users = [
  { id: 'usr-admin', email: 'admin@bookbridge.com', name: 'Platform Admin', phone: '9988776655', passwordHash: mockPassword, role: 'ADMIN', status: 'ACTIVE', createdAt: new Date().toISOString() },
  { id: 'usr-staff1', email: 'dhinesh@delivery.com', name: 'Dhinesh Kumar', phone: '9876543210', passwordHash: mockPassword, role: 'DELIVERY_STAFF', status: 'ACTIVE', createdAt: new Date().toISOString() },
  { id: 'usr-staff2', email: 'karthik@delivery.com', name: 'Karthik Raja', phone: '9876543211', passwordHash: mockPassword, role: 'DELIVERY_STAFF', status: 'ACTIVE', createdAt: new Date().toISOString() },
  { id: 'usr-staff3', email: 'suresh@delivery.com', name: 'Suresh Kumar', phone: '9876543212', passwordHash: mockPassword, role: 'DELIVERY_STAFF', status: 'ACTIVE', createdAt: new Date().toISOString() },
  
  { id: 'usr-user1', email: 'ajitha@gmail.com', name: 'Ajitha Priya', phone: '9123456780', passwordHash: mockPassword, role: 'USER', status: 'ACTIVE', createdAt: new Date().toISOString() },
  { id: 'usr-user2', email: 'rahul@gmail.com', name: 'Rahul Subramanian', phone: '9123456781', passwordHash: mockPassword, role: 'USER', status: 'ACTIVE', createdAt: new Date().toISOString() },
  { id: 'usr-user3', email: 'priya@gmail.com', name: 'Priya Dharshini', phone: '9123456782', passwordHash: mockPassword, role: 'USER', status: 'ACTIVE', createdAt: new Date().toISOString() },
  { id: 'usr-user4', email: 'vignesh@gmail.com', name: 'Vignesh Balaji', phone: '9123456783', passwordHash: mockPassword, role: 'USER', status: 'ACTIVE', createdAt: new Date().toISOString() },
  { id: 'usr-user5', email: 'meena@gmail.com', name: 'Meenakshi Sundaram', phone: '9123456784', passwordHash: mockPassword, role: 'USER', status: 'ACTIVE', createdAt: new Date().toISOString() },
  { id: 'usr-user6', email: 'srinivasan@gmail.com', name: 'Srinivasan Raman', phone: '9123456785', passwordHash: mockPassword, role: 'USER', status: 'ACTIVE', createdAt: new Date().toISOString() },
  { id: 'usr-user7', email: 'swetha@gmail.com', name: 'Swetha Ram', phone: '9123456786', passwordHash: mockPassword, role: 'USER', status: 'ACTIVE', createdAt: new Date().toISOString() },
];

const profiles = [
  { userId: 'usr-admin', city: 'Chennai', area: 'Nungambakkam', address: '12, College Road', pincode: '600006', latitude: 13.0612, longitude: 80.2514 },
  { userId: 'usr-staff1', city: 'Chennai', area: 'Guindy', address: '45, Mount Road', pincode: '600032', latitude: 13.0067, longitude: 80.2206 },
  { userId: 'usr-staff2', city: 'Madurai', area: 'Anna Nagar', address: '8, Sathamangalam', pincode: '625020', latitude: 9.9252, longitude: 78.1198 },
  { userId: 'usr-staff3', city: 'Coimbatore', area: 'Gandhipuram', address: '102, Cross Cut Road', pincode: '641012', latitude: 11.0168, longitude: 76.9558 },
  
  { userId: 'usr-user1', city: 'Chennai', area: 'Adyar', address: '10, Kasturiba Nagar', pincode: '600020', latitude: 13.0067, longitude: 80.2572 },
  { userId: 'usr-user2', city: 'Chennai', area: 'Mylapore', address: '14, Luz Church Road', pincode: '600004', latitude: 13.0333, longitude: 80.2667 },
  { userId: 'usr-user3', city: 'Chennai', area: 'Velachery', address: '8, Bypass Road', pincode: '600042', latitude: 12.9815, longitude: 80.2185 },
  { userId: 'usr-user4', city: 'Madurai', area: 'KK Nagar', address: '22, Lake View Road', pincode: '625020', latitude: 9.9322, longitude: 78.1485 },
  { userId: 'usr-user5', city: 'Coimbatore', area: 'Peelamedu', address: '55, Avinashi Road', pincode: '641004', latitude: 11.0264, longitude: 77.0185 },
  { userId: 'usr-user6', city: 'Tiruchirappalli', area: 'Cantonment', address: '15, Royal Road', pincode: '620001', latitude: 10.7905, longitude: 78.7047 },
  { userId: 'usr-user7', city: 'Tirunelveli', area: 'Palayamkottai', address: '3, High Ground Road', pincode: '627002', latitude: 8.7139, longitude: 77.7567 },
];

// 2. Delivery Staff Workloads
const staff = [
  { userId: 'usr-staff1', name: 'Dhinesh Kumar', phone: '9876543210', city: 'Chennai', area: 'Guindy', pincode: '600032', serviceArea: 'Adyar, Mylapore, Velachery, Guindy', availability: true, activeDeliveries: 1 },
  { userId: 'usr-staff2', name: 'Karthik Raja', phone: '9876543211', city: 'Madurai', area: 'Anna Nagar', pincode: '625020', serviceArea: 'KK Nagar, Anna Nagar, Madurai', availability: true, activeDeliveries: 0 },
  { userId: 'usr-staff3', name: 'Suresh Kumar', phone: '9876543212', city: 'Coimbatore', area: 'Gandhipuram', pincode: '641012', serviceArea: 'Gandhipuram, Peelamedu, Coimbatore', availability: true, activeDeliveries: 0 },
];

// 3. Book Listings (32 books)
const books = [
  // Programming Category ( Chennai )
  { id: 'bk-1', ownerId: 'usr-user1', title: 'Python Crash Course', author: 'Eric Matthes', category: 'Programming', subject: 'Python Development', isbn: '9781593279288', edition: 2, publicationYear: 2021, originalPrice: 1500, expectedPrice: 850, condition: 'VERY_GOOD', description: 'Clean copy with no highlight marks. Great reference for beginners.', imageUrl: null, city: 'Chennai', area: 'Adyar', pincode: '600020', deliveryAvailable: true, exchangeAvailable: true, donationAvailable: false, status: 'AVAILABLE', createdAt: new Date().toISOString() },
  { id: 'bk-2', ownerId: 'usr-user2', title: 'Eloquent JavaScript', author: 'Marijn Haverbeke', category: 'Programming', subject: 'Javascript Core', isbn: '9781593279509', edition: 3, publicationYear: 2022, originalPrice: 1200, expectedPrice: 700, condition: 'LIKE_NEW', description: 'Unopened, mint condition textbook.', imageUrl: null, city: 'Chennai', area: 'Mylapore', pincode: '600004', deliveryAvailable: true, exchangeAvailable: true, donationAvailable: false, status: 'AVAILABLE', createdAt: new Date().toISOString() },
  { id: 'bk-3', ownerId: 'usr-user3', title: 'Clean Code', author: 'Robert C. Martin', category: 'Programming', subject: 'Software Principles', isbn: '9780132350884', edition: 1, publicationYear: 2008, originalPrice: 2500, expectedPrice: 1200, condition: 'GOOD', description: 'Classic text. Slightly worn binding but fully readable.', imageUrl: null, city: 'Chennai', area: 'Velachery', pincode: '600042', deliveryAvailable: true, exchangeAvailable: true, donationAvailable: false, status: 'AVAILABLE', createdAt: new Date().toISOString() },

  // Artificial Intelligence Category ( Madurai & Coimbatore )
  { id: 'bk-4', ownerId: 'usr-user4', title: 'Artificial Intelligence: A Modern Approach', author: 'Stuart Russell', category: 'Artificial Intelligence', subject: 'AI Foundations', isbn: '9780136083207', edition: 4, publicationYear: 2020, originalPrice: 3500, expectedPrice: 1900, condition: 'VERY_GOOD', description: 'Excellent reference text for graduate studies.', imageUrl: null, city: 'Madurai', area: 'KK Nagar', pincode: '625020', deliveryAvailable: true, exchangeAvailable: true, donationAvailable: false, status: 'AVAILABLE', createdAt: new Date().toISOString() },
  { id: 'bk-5', ownerId: 'usr-user5', title: 'Hands-On Machine Learning', author: 'Aurélien Géron', category: 'Artificial Intelligence', subject: 'Machine Learning', isbn: '9781492032649', edition: 2, publicationYear: 2019, originalPrice: 2800, expectedPrice: 1500, condition: 'GOOD', description: 'Covers scikit-learn, Keras, and TensorFlow. Essential developer reference.', imageUrl: null, city: 'Coimbatore', area: 'Peelamedu', pincode: '641004', deliveryAvailable: true, exchangeAvailable: true, donationAvailable: false, status: 'AVAILABLE', createdAt: new Date().toISOString() },

  // Database Category
  { id: 'bk-6', ownerId: 'usr-user6', title: 'Database System Concepts', author: 'Abraham Silberschatz', category: 'Database', subject: 'DBMS theory', isbn: '9780073523323', edition: 7, publicationYear: 2019, originalPrice: 2200, expectedPrice: 1100, condition: 'GOOD', description: 'Perfect condition core engineering syllabus textbook.', imageUrl: null, city: 'Tiruchirappalli', area: 'Cantonment', pincode: '620001', deliveryAvailable: true, exchangeAvailable: true, donationAvailable: false, status: 'AVAILABLE', createdAt: new Date().toISOString() },
  { id: 'bk-7', ownerId: 'usr-user7', title: 'SQL Practice Guide', author: 'Ben Forta', category: 'Database', subject: 'SQL Practice', isbn: '9780672338419', edition: 5, publicationYear: 2021, originalPrice: 900, expectedPrice: 500, condition: 'LIKE_NEW', description: 'Sams Teach Yourself SQL in 10 minutes. Super handy guide.', imageUrl: null, city: 'Tirunelveli', area: 'Palayamkottai', pincode: '627002', deliveryAvailable: true, exchangeAvailable: true, donationAvailable: false, status: 'AVAILABLE', createdAt: new Date().toISOString() },

  // Donation Books (Free expectedPrice = 0)
  { id: 'bk-8', ownerId: 'usr-user1', title: 'Introduction to Algorithms', author: 'Thomas H. Cormen', category: 'Programming', subject: 'Data Structures', isbn: '9780262033848', edition: 3, publicationYear: 2009, originalPrice: 3000, expectedPrice: 0, condition: 'FAIR', description: 'Heavy highlights, loose binding. Giving it away for free to anyone who needs it.', imageUrl: null, city: 'Chennai', area: 'Adyar', pincode: '600020', deliveryAvailable: false, exchangeAvailable: false, donationAvailable: true, status: 'AVAILABLE', createdAt: new Date().toISOString() },
  { id: 'bk-9', ownerId: 'usr-user2', title: 'The C++ Programming Language', author: 'Bjarne Stroustrup', category: 'Programming', subject: 'C++', isbn: '9780321563842', edition: 4, publicationYear: 2013, originalPrice: 2600, expectedPrice: 0, condition: 'GOOD', description: 'Classic Stroustrup book. Donating for free.', imageUrl: null, city: 'Chennai', area: 'Mylapore', pincode: '600004', deliveryAvailable: false, exchangeAvailable: false, donationAvailable: true, status: 'AVAILABLE', createdAt: new Date().toISOString() },
];

// Populate up to 30 books to meet requirements
for (let i = 10; i <= 32; i++) {
  const cat = ['Web Development', 'Operating Systems', 'Computer Networks', 'Mathematics', 'Management', 'Novels', 'Competitive Exams'][i % 7];
  const user = `usr-user${(i % 7) + 1}`;
  const profile = profiles.find(p => p.userId === user);
  books.push({
    id: `bk-${i}`,
    ownerId: user,
    title: `Textbook on ${cat} Vol ${Math.floor(i/3)}`,
    author: `Author ${i}`,
    category: cat,
    subject: `Core ${cat}`,
    isbn: `9780136083${i}07`,
    edition: (i % 3) + 1,
    publicationYear: 2015 + (i % 8),
    originalPrice: 1000 + (i * 20),
    expectedPrice: 400 + (i * 10),
    condition: i % 4 === 0 ? 'LIKE_NEW' : i % 4 === 1 ? 'VERY_GOOD' : i % 4 === 2 ? 'GOOD' : 'FAIR',
    description: `Standard textbook listed under ${cat} for college students.`,
    imageUrl: null,
    city: profile.city,
    area: profile.area,
    pincode: profile.pincode,
    deliveryAvailable: true,
    exchangeAvailable: i % 2 === 0,
    donationAvailable: false,
    status: 'AVAILABLE',
    createdAt: new Date().toISOString()
  });
}

// 4. Sample Transactions & Deliveries
const orders = [
  { id: 'ord-1', bookId: 'bk-3', buyerId: 'usr-user2', sellerId: 'usr-user3', amount: 1200, deliveryMethod: 'DELIVERY', paymentStatus: 'PAID', orderStatus: 'IN_TRANSIT', createdAt: new Date().toISOString() },
  { id: 'ord-2', bookId: 'bk-8', buyerId: 'usr-user3', sellerId: 'usr-user1', amount: 0, deliveryMethod: 'PICKUP', paymentStatus: 'COD', orderStatus: 'READY_FOR_PICKUP', pickupLocation: 'Anna Nagar West Bus Stand', createdAt: new Date().toISOString() },
];

const payments = [
  { id: 'pay-1', orderId: 'ord-1', amount: 1200, method: 'ONLINE', status: 'PAID', transactionId: 'TXN-998877', createdAt: new Date().toISOString() },
  { id: 'pay-2', orderId: 'ord-2', amount: 0, method: 'COD', status: 'COD', transactionId: null, createdAt: new Date().toISOString() },
];

const deliveries = [
  { id: 'del-1', orderId: 'ord-1', staffId: 'usr-staff1', status: 'IN_TRANSIT', updatedAt: new Date().toISOString(), notes: 'Out of transit hub Guindy.' },
];

// 5. Sample Exchanges
const exchanges = [
  { id: 'exch-1', senderId: 'usr-user1', receiverId: 'usr-user2', offeredBookId: 'bk-1', requestedBookId: 'bk-2', status: 'PENDING', createdAt: new Date().toISOString() },
];

// 6. Notifications
const notifications = [
  { id: 'notif-1', userId: 'usr-user2', title: 'Exchange Request Received', message: 'Ajitha Priya proposed exchanging Python Crash Course for your Eloquent JavaScript.', isRead: false, createdAt: new Date().toISOString() },
];

// Write collections to JSON files
fs.writeFileSync(path.join(DATA_DIR, 'users.json'), JSON.stringify(users, null, 2));
fs.writeFileSync(path.join(DATA_DIR, 'profiles.json'), JSON.stringify(profiles, null, 2));
fs.writeFileSync(path.join(DATA_DIR, 'deliveries-staff.json'), JSON.stringify(staff, null, 2));
fs.writeFileSync(path.join(DATA_DIR, 'books.json'), JSON.stringify(books, null, 2));
fs.writeFileSync(path.join(DATA_DIR, 'orders.json'), JSON.stringify(orders, null, 2));
fs.writeFileSync(path.join(DATA_DIR, 'payments.json'), JSON.stringify(payments, null, 2));
fs.writeFileSync(path.join(DATA_DIR, 'deliveries.json'), JSON.stringify(deliveries, null, 2));
fs.writeFileSync(path.join(DATA_DIR, 'exchanges.json'), JSON.stringify(exchanges, null, 2));
fs.writeFileSync(path.join(DATA_DIR, 'notifications.json'), JSON.stringify(notifications, null, 2));

// Initialize empty list arrays for swapchains, reviews, wishlist, and requests
fs.writeFileSync(path.join(DATA_DIR, 'swapchains.json'), JSON.stringify([], null, 2));
fs.writeFileSync(path.join(DATA_DIR, 'reviews.json'), JSON.stringify([], null, 2));
fs.writeFileSync(path.join(DATA_DIR, 'wishlist.json'), JSON.stringify([], null, 2));
fs.writeFileSync(path.join(DATA_DIR, 'book-requests.json'), JSON.stringify([], null, 2));

console.log('Database seeded successfully into data/*.json files!');
