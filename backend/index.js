const functions = require('firebase-functions');
const express = require('express');
const admin = require('firebase-admin');
const cors = require('cors');

// Initialize Firebase Admin SDK
admin.initializeApp();

const db = admin.firestore();
const auth = admin.auth();

const app = express();
app.use(express.json());
app.use(cors({ origin: true }));

// Middleware to verify Firebase token
const verifyToken = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split('Bearer ')[1];
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }
    const decodedToken = await auth.verifyIdToken(token);
    req.user = decodedToken;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid token', details: error.message });
  }
};

// ============================================
// SIGNUP API
// ============================================
app.post('/signup', async (req, res) => {
  try {
    const { name, email, password, instituteName } = req.body;

    if (!name || !email || !password || !instituteName) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    const userRecord = await auth.createUser({
      email,
      password,
      displayName: name
    });

    await db.collection('users').doc(userRecord.uid).set({
      name,
      email,
      instituteName,
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    });

    res.status(201).json({
      message: 'User created successfully',
      userId: userRecord.uid,
      user: {
        name,
        email,
        instituteName
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ============================================
// LOGIN API
// ============================================
app.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const userRecord = await auth.getUserByEmail(email);
    const customToken = await auth.createCustomToken(userRecord.uid);

    const userDoc = await db.collection('users').doc(userRecord.uid).get();
    const userData = userDoc.data();

    res.status(200).json({
      message: 'Login successful',
      userId: userRecord.uid,
      customToken,
      user: userData
    });
  } catch (error) {
    if (error.code === 'auth/user-not-found') {
      return res.status(404).json({ error: 'User not found' });
    }
    res.status(500).json({ error: error.message });
  }
});

// ============================================
// LISTING CRUD APIS
// ============================================

// CREATE Listing
app.post('/listings', async (req, res) => {
  try {
    const { foodName, expiry, foodType, address, phone, amount, status, uid } = req.body;

    if (!foodName || !expiry || !foodType || !address || !phone || !amount) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    const listingData = {
      foodName,
      expiry,
      foodType,
      address,
      phone,
      amount,
      status: status || 'available',
      donorId: uid,
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    };

    const docRef = await db.collection('listings').add(listingData);

    res.status(201).json({
      message: 'Listing created successfully',
      listingId: docRef.id,
      listing: { id: docRef.id, ...listingData }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// READ All Listings
app.get('/listings', async (req, res) => {
  try {
    const snapshot = await db.collection('listings').orderBy('createdAt', 'desc').get();
    
    const listings = [];
    snapshot.forEach(doc => {
      listings.push({
        id: doc.id,
        ...doc.data()
      });
    });

    res.status(200).json({ listings });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// READ Single Listing
app.get('/listings/:id', async (req, res) => {
  try {
    const doc = await db.collection('listings').doc(req.params.id).get();

    if (!doc.exists) {
      return res.status(404).json({ error: 'Listing not found' });
    }

    res.status(200).json({
      id: doc.id,
      ...doc.data()
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// UPDATE Listing
app.put('/listings/:id', async (req, res) => {
  try {
    const { foodName, expiry, foodType, address, phone, amount, status } = req.body;
    
    const listingDoc = await db.collection('listings').doc(req.params.id).get();
    
    if (!listingDoc.exists) {
      return res.status(404).json({ error: 'Listing not found' });
    }

    const updateData = {};
    if (foodName) updateData.foodName = foodName;
    if (expiry) updateData.expiry = expiry;
    if (foodType) updateData.foodType = foodType;
    if (address) updateData.address = address;
    if (phone) updateData.phone = phone;
    if (amount) updateData.amount = amount;
    if (status) updateData.status = status;

    await db.collection('listings').doc(req.params.id).update(updateData);

    res.status(200).json({
      message: 'Listing updated successfully',
      listingId: req.params.id
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE Listing
app.delete('/listings/:id', async (req, res) => {
  try {
    const listingDoc = await db.collection('listings').doc(req.params.id).get();
    
    if (!listingDoc.exists) {
      return res.status(404).json({ error: 'Listing not found' });
    }

    await db.collection('listings').doc(req.params.id).delete();

    res.status(200).json({
      message: 'Listing deleted successfully',
      listingId: req.params.id
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET Listings by specific user
app.get('/users/:userId/listings', async (req, res) => {
  try {
    const snapshot = await db.collection('listings')
      .where('donorId', '==', req.params.userId)
      .orderBy('createdAt', 'desc')
      .get();
    
    const listings = [];
    snapshot.forEach(doc => {
      listings.push({
        id: doc.id,
        ...doc.data()
      });
    });

    res.status(200).json({ listings });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Export the Express app as a Firebase Function
exports.api = functions.https.onRequest(app);