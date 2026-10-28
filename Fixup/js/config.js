/* =============================================
   FIXUP — CONFIGURATION
   ============================================= */

const FixupConfig = {
  // Brand
  brand: {
    name: 'Fixup',
    tagline: 'Repairs Made Simple.',
    supportingHeadline: 'Your Problem. The Right Expert. Right at Your Door.',
    email: 'support@fixup.in',
    phone: '+91-XXXX-XXXXXX',
    address: '[Address Placeholder]',
    social: {
      twitter: '#',
      instagram: '#',
      linkedin: '#',
      facebook: '#',
    },
  },

  // Subscription
  subscription: {
    name: 'Fixup Mechanic Monthly',
    price: 299,
    currency: '₹',
    durationDays: 30,
    features: [
      'Access to nearby repair requests',
      'Mechanic profile visibility to customers',
      'Request management dashboard',
      'Booking and status management tools',
      'Earnings overview and history',
      'Customer rating & review system',
      'Priority support access',
    ],
  },

  // Demo OTP (always the same in demo mode)
  demoOtp: '123456',

  // Service categories
  serviceCategories: [
    { id: 'mobile',     label: 'Mobile Phone',  icon: 'smartphone' },
    { id: 'laptop',     label: 'Laptop',         icon: 'laptop' },
    { id: 'computer',   label: 'Computer',       icon: 'monitor' },
    { id: 'tablet',     label: 'Tablet',         icon: 'tablet' },
    { id: 'accessories',label: 'Accessories',    icon: 'headphones' },
    { id: 'other',      label: 'Other Device',   icon: 'tool' },
  ],

  // Demo accounts
  demoAccounts: [
    {
      mobile: '9876543210',
      password: 'Demo@123',
      role: 'user',
      name: 'Rahul Sharma',
      email: 'rahul@example.com',
      gender: 'Male',
    },
    {
      mobile: '9988776655',
      password: 'Demo@123',
      role: 'mechanic',
      name: 'Vikram Singh',
      email: 'vikram@example.com',
      gender: 'Male',
    },
    {
      mobile: '9001234567',
      password: 'Admin@123',
      role: 'admin',
      name: 'Admin User',
      email: 'admin@fixup.in',
      gender: '',
    },
  ],

  // App version
  version: '1.0.0',
  isDemo: true,
};

// Freeze config to prevent accidental mutation
Object.freeze(FixupConfig);

