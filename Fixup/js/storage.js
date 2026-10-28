/* =============================================
   FIXUP — LOCAL STORAGE MANAGER
   ============================================= */

const Storage = (() => {
  const PREFIX = 'fixup_';

  function key(k) { return PREFIX + k; }

  function get(k, fallback = null) {
    try {
      const val = localStorage.getItem(key(k));
      if (val === null) return fallback;
      return JSON.parse(val);
    } catch {
      return fallback;
    }
  }

  function set(k, value) {
    try {
      localStorage.setItem(key(k), JSON.stringify(value));
      return true;
    } catch {
      return false;
    }
  }

  function remove(k) {
    localStorage.removeItem(key(k));
  }

  function clear(prefix = '') {
    const keys = Object.keys(localStorage).filter(k =>
      k.startsWith(PREFIX + prefix)
    );
    keys.forEach(k => localStorage.removeItem(k));
  }

  function resetDemo() {
    clear();
    sessionStorage.removeItem('fixup_session');
    // Re-seed with demo data
    DemoData.seed();
    console.info('[Fixup] Demo data reset.');
  }

  return { get, set, remove, clear, resetDemo };
})();


/* =============================================
   FIXUP — DEMO DATA SEED
   ============================================= */

const DemoData = (() => {
  function seed() {
    // ── Demo Users ──
    if (!Storage.get('users')) {
      Storage.set('users', [
        {
          id: 'u001',
          mobile: '9876543210',
          password: 'Demo@123',
          role: 'user',
          name: 'Rahul Sharma',
          email: 'rahul@example.com',
          gender: 'Male',
          address: {
            house: '42', street: 'MG Road', landmark: 'Near City Mall',
            city: 'Bengaluru', state: 'Karnataka', pin: '560001',
          },
          prefs: { notifications: true, theme: 'light' },
          createdAt: '2026-01-15T10:00:00.000Z',
        },
        {
          id: 'u002',
          mobile: '9988776655',
          password: 'Demo@123',
          role: 'mechanic',
          name: 'Vikram Singh',
          email: 'vikram@example.com',
          gender: 'Male',
          address: {
            house: '7', street: 'Rajajinagar', landmark: 'Near Post Office',
            city: 'Bengaluru', state: 'Karnataka', pin: '560010',
          },
          mechanic: {
            categories: ['mobile', 'laptop'],
            experience: 5,
            radius: 10,
            rating: 4.8,
            reviewCount: 127,
            available: true,
            startPrice: 299,
            upiId: '',
            workingHours: '9 AM – 8 PM',
            bio: 'Expert mobile and laptop technician with 5+ years experience.',
            subscription: {
              active: true,
              startDate: '2026-10-01T00:00:00.000Z',
              expiryDate: '2026-10-31T00:00:00.000Z',
              plan: 'monthly',
            },
          },
          createdAt: '2026-02-20T10:00:00.000Z',
        },
        {
          id: 'u003',
          mobile: '9876500001',
          password: 'Demo@123',
          role: 'mechanic',
          name: 'Priya Mehta',
          email: 'priya@example.com',
          gender: 'Female',
          address: {
            house: '15', street: 'Indiranagar', landmark: 'Near 100ft Road',
            city: 'Bengaluru', state: 'Karnataka', pin: '560038',
          },
          mechanic: {
            categories: ['mobile', 'tablet', 'accessories'],
            experience: 3,
            radius: 8,
            rating: 4.6,
            reviewCount: 89,
            available: true,
            startPrice: 249,
            upiId: '',
            workingHours: '10 AM – 7 PM',
            bio: 'Specialised in mobile and tablet repairs. Quick turnaround guaranteed.',
            subscription: {
              active: true,
              startDate: '2026-10-05T00:00:00.000Z',
              expiryDate: '2026-11-04T00:00:00.000Z',
              plan: 'monthly',
            },
          },
          createdAt: '2026-03-10T10:00:00.000Z',
        },
        {
          id: 'u004',
          mobile: '9876500002',
          password: 'Demo@123',
          role: 'mechanic',
          name: 'Arjun Nair',
          email: 'arjun@example.com',
          gender: 'Male',
          address: {
            house: '22', street: 'Whitefield', landmark: 'Near Forum Mall',
            city: 'Bengaluru', state: 'Karnataka', pin: '560066',
          },
          mechanic: {
            categories: ['laptop', 'computer'],
            experience: 7,
            radius: 12,
            rating: 4.9,
            reviewCount: 203,
            available: false,
            startPrice: 399,
            upiId: '',
            workingHours: '8 AM – 9 PM',
            bio: 'Senior laptop and desktop technician. Certified hardware engineer.',
            subscription: {
              active: true,
              startDate: '2026-10-10T00:00:00.000Z',
              expiryDate: '2026-11-09T00:00:00.000Z',
              plan: 'monthly',
            },
          },
          createdAt: '2026-01-05T10:00:00.000Z',
        },
        {
          id: 'u005',
          mobile: '9001234567',
          password: 'Admin@123',
          role: 'admin',
          name: 'Admin User',
          email: 'admin@fixup.in',
          gender: '',
          createdAt: '2026-01-01T00:00:00.000Z',
        },
      ]);
    }

    // ── Demo Bookings ──
    if (!Storage.get('bookings')) {
      Storage.set('bookings', [
        {
          id: 'BK-2026-001',
          userId: 'u001',
          mechanicId: 'u002',
          mechanicName: 'Vikram Singh',
          device: { category: 'mobile', model: 'Samsung Galaxy S23', fault: 'Screen cracked, touch not responding' },
          location: { address: '42 MG Road', city: 'Bengaluru', pin: '560001' },
          estimate: 1800,
          platformFee: 0,
          total: 1800,
          status: 'completed',
          timeline: [
            { step: 'request_sent',       label: 'Request Sent',       time: '2026-10-15T09:00:00.000Z', done: true },
            { step: 'mechanic_accepted',  label: 'Mechanic Accepted',  time: '2026-10-15T09:15:00.000Z', done: true },
            { step: 'booking_confirmed',  label: 'Booking Confirmed',  time: '2026-10-15T09:30:00.000Z', done: true },
            { step: 'on_the_way',         label: 'Mechanic on the Way',time: '2026-10-15T10:00:00.000Z', done: true },
            { step: 'repairing_started',  label: 'Repairing Started',  time: '2026-10-15T10:30:00.000Z', done: true },
            { step: 'repair_completed',   label: 'Repair Completed',   time: '2026-10-15T11:45:00.000Z', done: true },
          ],
          paymentStatus: 'paid',
          paymentMethod: 'UPI',
          transactionId: 'TXN-2026-001',
          createdAt: '2026-10-15T09:00:00.000Z',
          completedAt: '2026-10-15T11:45:00.000Z',
          reviewed: true,
          review: { rating: 5, comment: 'Excellent service! Very professional.' },
        },
        {
          id: 'BK-2026-002',
          userId: 'u001',
          mechanicId: 'u003',
          mechanicName: 'Priya Mehta',
          device: { category: 'tablet', model: 'iPad Air 5', fault: 'Battery draining fast' },
          location: { address: '42 MG Road', city: 'Bengaluru', pin: '560001' },
          estimate: 1200,
          platformFee: 0,
          total: 1200,
          status: 'active',
          timeline: [
            { step: 'request_sent',      label: 'Request Sent',      time: '2026-10-28T08:00:00.000Z', done: true },
            { step: 'mechanic_accepted', label: 'Mechanic Accepted', time: '2026-10-28T08:20:00.000Z', done: true },
            { step: 'booking_confirmed', label: 'Booking Confirmed', time: '2026-10-28T08:40:00.000Z', done: true },
            { step: 'on_the_way',        label: 'Mechanic on the Way',time: '', done: false },
            { step: 'repairing_started', label: 'Repairing Started', time: '', done: false },
            { step: 'repair_completed',  label: 'Repair Completed',  time: '', done: false },
          ],
          paymentStatus: 'pending',
          paymentMethod: '',
          transactionId: '',
          createdAt: '2026-10-28T08:00:00.000Z',
          completedAt: '',
          reviewed: false,
        },
      ]);
    }

    // ── Demo Transactions ──
    if (!Storage.get('transactions')) {
      Storage.set('transactions', [
        {
          id: 'TXN-2026-001',
          bookingId: 'BK-2026-001',
          userId: 'u001',
          mechanicName: 'Vikram Singh',
          amount: 1800,
          method: 'UPI',
          status: 'completed',
          refundStatus: 'none',
          createdAt: '2026-10-15T12:00:00.000Z',
        },
      ]);
    }

    // ── Demo Mechanic Requests (for mechanic dashboard) ──
    if (!Storage.get('mechanic_requests')) {
      Storage.set('mechanic_requests', [
        {
          id: 'REQ-2026-001',
          mechanicId: 'u002',
          userId: 'u001',
          customerArea: 'MG Road, Bengaluru',
          device: { category: 'mobile', model: 'OnePlus 11', fault: 'Charging port not working' },
          distance: '2.3 km',
          requestTime: '2026-10-28T23:00:00.000Z',
          status: 'pending',
          estimate: null,
        },
        {
          id: 'REQ-2026-002',
          mechanicId: 'u002',
          userId: 'u001',
          customerArea: 'Koramangala, Bengaluru',
          device: { category: 'laptop', model: 'Dell XPS 15', fault: 'Not booting up' },
          distance: '4.1 km',
          requestTime: '2026-10-28T22:00:00.000Z',
          status: 'pending',
          estimate: null,
        },
      ]);
    }

    // ── Demo Notifications ──
    if (!Storage.get('notifications')) {
      Storage.set('notifications', [
        {
          id: 'n001',
          userId: 'u001',
          title: 'Booking Confirmed',
          desc: 'Your repair booking BK-2026-002 has been confirmed.',
          type: 'success',
          read: false,
          createdAt: '2026-10-28T08:45:00.000Z',
        },
        {
          id: 'n002',
          userId: 'u001',
          title: 'Mechanic Accepted',
          desc: 'Priya Mehta has accepted your tablet repair request.',
          type: 'info',
          read: false,
          createdAt: '2026-10-28T08:20:00.000Z',
        },
        {
          id: 'n003',
          userId: 'u001',
          title: 'Repair Completed',
          desc: 'Your Samsung Galaxy S23 repair has been completed.',
          type: 'success',
          read: true,
          createdAt: '2026-10-15T11:50:00.000Z',
        },
        {
          id: 'n004',
          userId: 'u002',
          title: 'New Repair Request',
          desc: 'A new request for mobile repair has arrived near MG Road.',
          type: 'info',
          read: false,
          createdAt: '2026-10-28T23:05:00.000Z',
        },
        {
          id: 'n005',
          userId: 'u002',
          title: 'Subscription Active',
          desc: 'Your Fixup subscription is active until Oct 31, 2026.',
          type: 'info',
          read: true,
          createdAt: '2026-10-01T10:00:00.000Z',
        },
      ]);
    }

    // ── Demo Complaints ──
    if (!Storage.get('complaints')) {
      Storage.set('complaints', [
        {
          id: 'CPL-2026-001',
          userId: 'u001',
          category: 'Booking Issue',
          subject: 'Unable to track mechanic',
          message: 'The booking status is not updating in real-time.',
          status: 'resolved',
          createdAt: '2026-10-16T09:00:00.000Z',
          resolvedAt: '2026-10-17T14:00:00.000Z',
        },
      ]);
    }

    // ── Demo Reviews ──
    if (!Storage.get('reviews')) {
      Storage.set('reviews', [
        {
          id: 'rv001',
          mechanicId: 'u002',
          userId: 'u001',
          bookingId: 'BK-2026-001',
          customerName: 'Rahul S.',
          rating: 5,
          comment: 'Excellent service! Very professional and on time.',
          createdAt: '2026-10-15T13:00:00.000Z',
        },
        {
          id: 'rv002',
          mechanicId: 'u002',
          userId: 'u_demo',
          bookingId: 'BK-DEMO-001',
          customerName: 'Ananya P.',
          rating: 4,
          comment: 'Good service overall. Took a bit longer than expected.',
          createdAt: '2026-09-22T15:00:00.000Z',
        },
        {
          id: 'rv003',
          mechanicId: 'u003',
          userId: 'u_demo2',
          bookingId: 'BK-DEMO-002',
          customerName: 'Rohan K.',
          rating: 5,
          comment: 'Priya was amazing! Fixed my tablet super quickly.',
          createdAt: '2026-10-10T11:00:00.000Z',
        },
      ]);
    }
  }

  function reset() {
    Storage.clear();
    sessionStorage.removeItem('fixup_session');
    seed();
  }

  // Mechanic list helper
  function getMechanics() {
    const users = Storage.get('users', []);
    return users.filter(u => u.role === 'mechanic');
  }

  function getUsers() {
    const users = Storage.get('users', []);
    return users.filter(u => u.role === 'user');
  }

  function getBookings(userId = null) {
    const bookings = Storage.get('bookings', []);
    return userId ? bookings.filter(b => b.userId === userId) : bookings;
  }

  function updateBooking(id, updates) {
    const bookings = Storage.get('bookings', []);
    const idx = bookings.findIndex(b => b.id === id);
    if (idx !== -1) {
      bookings[idx] = { ...bookings[idx], ...updates };
      Storage.set('bookings', bookings);
      return bookings[idx];
    }
    return null;
  }

  function addBooking(booking) {
    const bookings = Storage.get('bookings', []);
    bookings.unshift(booking);
    Storage.set('bookings', bookings);
  }

  function getNotifications(userId) {
    const all = Storage.get('notifications', []);
    return all.filter(n => n.userId === userId).sort(
      (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
    );
  }

  function addNotification(notif) {
    const all = Storage.get('notifications', []);
    all.unshift(notif);
    Storage.set('notifications', all);
  }

  function markNotifRead(id) {
    const all = Storage.get('notifications', []);
    const idx = all.findIndex(n => n.id === id);
    if (idx !== -1) {
      all[idx].read = true;
      Storage.set('notifications', all);
    }
  }

  function markAllNotifsRead(userId) {
    const all = Storage.get('notifications', []);
    all.forEach(n => { if (n.userId === userId) n.read = true; });
    Storage.set('notifications', all);
  }

  function getComplaints(userId) {
    const all = Storage.get('complaints', []);
    return userId ? all.filter(c => c.userId === userId) : all;
  }

  function addComplaint(complaint) {
    const all = Storage.get('complaints', []);
    all.unshift(complaint);
    Storage.set('complaints', all);
  }

  function generateBookingId() {
    const year = new Date().getFullYear();
    const num = String(Math.floor(Math.random() * 9000) + 1000);
    return `BK-${year}-${num}`;
  }

  function generateTxnId() {
    const year = new Date().getFullYear();
    const num = String(Math.floor(Math.random() * 900000) + 100000);
    return `TXN-${year}-${num}`;
  }

  function generateComplaintId() {
    const year = new Date().getFullYear();
    const num = String(Math.floor(Math.random() * 9000) + 1000);
    return `CPL-${year}-${num}`;
  }

  function generateNotifId() {
    return 'n' + Date.now();
  }

  return {
    seed, reset, getMechanics, getUsers, getBookings, updateBooking,
    addBooking, getNotifications, addNotification, markNotifRead,
    markAllNotifsRead, getComplaints, addComplaint,
    generateBookingId, generateTxnId, generateComplaintId, generateNotifId,
  };
})();

// Auto-seed on load
DemoData.seed();
