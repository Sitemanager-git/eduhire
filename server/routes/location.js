const express = require('express');
const router = express.Router();

// Static data for Indian states and districts
// You can replace this with external API calls later

const locationData = {
  states: [
    "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh",
    "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand",
    "Karnataka", "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur",
    "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab",
    "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura",
    "Uttar Pradesh", "Uttarakhand", "West Bengal",
    "Andaman and Nicobar Islands", "Chandigarh", "Dadra and Nagar Haveli and Daman and Diu",
    "Delhi", "Jammu and Kashmir", "Ladakh", "Lakshadweep", "Puducherry"
  ],
  
  districts: {
    "Maharashtra": ["Mumbai", "Pune", "Nagpur", "Thane", "Nashik", "Aurangabad", "Solapur", "Kolhapur"],
    "Delhi": ["Central Delhi", "East Delhi", "New Delhi", "North Delhi", "North East Delhi", "North West Delhi", "South Delhi", "South East Delhi", "South West Delhi", "West Delhi", "Shahdara"],
    "Karnataka": ["Bangalore Urban", "Bangalore Rural", "Mysore", "Mangalore", "Hubli", "Belgaum", "Gulbarga"],
    "Tamil Nadu": ["Chennai", "Coimbatore", "Madurai", "Tiruchirappalli", "Salem", "Tirunelveli"],
    "Uttar Pradesh": ["Lucknow", "Kanpur", "Ghaziabad", "Agra", "Varanasi", "Meerut", "Prayagraj", "Noida"],
    "West Bengal": ["Kolkata", "Howrah", "Durgapur", "Asansol", "Siliguri"],
    "Gujarat": ["Ahmedabad", "Surat", "Vadodara", "Rajkot", "Bhavnagar", "Jamnagar"],
    "Rajasthan": ["Jaipur", "Jodhpur", "Kota", "Bikaner", "Ajmer", "Udaipur"],
    "Kerala": ["Thiruvananthapuram", "Kochi", "Kozhikode", "Thrissur", "Kollam"],
    "Punjab": ["Ludhiana", "Amritsar", "Jalandhar", "Patiala", "Bathinda"],
    "Haryana": ["Faridabad", "Gurgaon", "Panipat", "Ambala", "Yamunanagar", "Rohtak"],
    "Bihar": ["Patna", "Gaya", "Bhagalpur", "Muzaffarpur", "Purnia"],
    "Telangana": ["Hyderabad", "Warangal", "Nizamabad", "Khammam", "Karimnagar"],
    "Andhra Pradesh": ["Visakhapatnam", "Vijayawada", "Guntur", "Nellore", "Kurnool", "Tirupati"]
  }
};

// Get all states
router.get('/states', (req, res) => {
  res.json({ states: locationData.states });
});

// Get districts by state
router.get('/districts/:state', (req, res) => {
  const state = req.params.state;
  const districts = locationData.districts[state] || [];
  res.json({ districts });
});

// Validate PIN code (basic validation)
router.get('/validate-pin/:pincode', (req, res) => {
  const pincode = req.params.pincode;
  
  if (!/^[0-9]{6}$/.test(pincode)) {
    return res.status(400).json({ 
      valid: false, 
      message: 'Invalid PIN code format' 
    });
  }
  
  res.json({ 
    valid: true, 
    message: 'PIN code format is valid' 
  });
});

module.exports = router;
