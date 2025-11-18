/**
 * Form Data Constants
 * Centralized configuration for dropdowns and selections
 */

// Subject options for teachers (30 subjects)
export const SUBJECT_OPTIONS = [
    'Mathematics',
    'Physics',
    'Chemistry',
    'Biology',
    'English',
    'Hindi',
    'Sanskrit',
    'Social Studies',
    'History',
    'Geography',
    'Political Science',
    'Economics',
    'Computer Science',
    'Information Technology',
    'Accountancy',
    'Business Studies',
    'Physical Education',
    'Art & Craft',
    'Music',
    'Dance',
    'Environmental Science',
    'Psychology',
    'Philosophy',
    'Sociology',
    'Home Science',
    'Agriculture',
    'Engineering Drawing',
    'French',
    'German',
    'Spanish'
];

// Curriculum options for institutions
export const CURRICULUM_OPTIONS = [
    'CBSE',
    'ICSE',
    'CISCE',
    'IB (International Baccalaureate)',
    'Cambridge International',
    'IGCSE',
    'NIOS (National Institute of Open Schooling)',
    'State Board - Maharashtra',
    'State Board - Karnataka',
    'State Board - Tamil Nadu',
    'State Board - Kerala',
    'State Board - West Bengal',
    'State Board - Uttar Pradesh',
    'State Board - Rajasthan',
    'State Board - Gujarat',
    'Montessori',
    'Waldorf',
    'Reggio Emilia'
];

// School sections offered
export const SECTIONS_OFFERED = [
    'Pre-Primary (Nursery/KG)',
    'Primary (Classes 1-5)',
    'Elementary (Classes 1-8)',
    'Secondary (Classes 9-10)',
    'Senior Secondary (Classes 11-12)',
    'K-12 (Complete)',
    'Montessori',
    'Vocational Training',
    'Polytechnic',
    'Business School',
    'Professional Courses',
    'Distance Learning'
];

// Institution types
export const INSTITUTION_TYPES = [
    { value: 'school', label: 'School' },
    { value: 'college', label: 'College' },
    { value: 'coaching', label: 'Coaching Center' },
    { value: 'university', label: 'University' },
    { value: 'training_center', label: 'Training Center' }
];

// School types
export const SCHOOL_TYPES = [
    { value: 'government', label: 'Government' },
    { value: 'private', label: 'Private' },
    { value: 'aided', label: 'Government Aided' },
    { value: 'international', label: 'International' }
];

// Education levels
export const EDUCATION_LEVELS = [
    { value: 'primary', label: 'Primary (Classes 1-5)' },
    { value: 'secondary', label: 'Secondary (Classes 6-10)' },
    { value: 'higher', label: 'Higher Education (11-12, UG, PG)' }
];

// Employment types
export const EMPLOYMENT_TYPES = [
    { value: 'full-time', label: 'Full-time' },
    { value: 'part-time', label: 'Part-time' },
    { value: 'contract', label: 'Contract' },
    { value: 'temporary', label: 'Temporary' },
    { value: 'substitute', label: 'Substitute/Guest Faculty' }
];

// Job benefits
export const INDIAN_STATES = [
    'Andhra Pradesh',
    'Arunachal Pradesh',
    'Assam',
    'Bihar',
    'Chhattisgarh',
    'Goa',
    'Gujarat',
    'Haryana',
    'Himachal Pradesh',
    'Jharkhand',
    'Karnataka',
    'Kerala',
    'Madhya Pradesh',
    'Maharashtra',
    'Manipur',
    'Meghalaya',
    'Mizoram',
    'Nagaland',
    'Odisha',
    'Punjab',
    'Rajasthan',
    'Sikkim',
    'Tamil Nadu',
    'Telangana',
    'Tripura',
    'Uttar Pradesh',
    'Uttarakhand',
    'West Bengal',
    'Andaman and Nicobar Islands',
    'Chandigarh',
    'Dadra and Nagar Haveli and Daman and Diu',
    'Delhi',
    'Jammu and Kashmir',
    'Ladakh',
    'Lakshadweep',
    'Puducherry'
];

export const DISTRICTS_BY_STATE = {
    'Delhi': ['Central Delhi', 'East Delhi', 'New Delhi', 'North Delhi', 'North East Delhi', 'North West Delhi', 'Shahdara', 'South Delhi', 'South East Delhi', 'South West Delhi', 'West Delhi'],
    'Maharashtra': ['Mumbai', 'Pune', 'Nagpur', 'Thane', 'Nashik', 'Aurangabad', 'Solapur', 'Amravati', 'Kolhapur', 'Nanded', 'Sangli', 'Jalgaon', 'Akola', 'Latur', 'Dhule', 'Ahmednagar', 'Chandrapur', 'Parbhani', 'Jalna', 'Bhiwandi', 'Navi Mumbai', 'Kalyan-Dombivli', 'Vasai-Virar', 'Raigad', 'Ratnagiri', 'Sindhudurg', 'Wardha', 'Yavatmal', 'Buldhana', 'Beed', 'Satara', 'Osmanabad', 'Hingoli', 'Washim', 'Gadchiroli', 'Gondia'],
    'Karnataka': ['Bengaluru Urban', 'Bengaluru Rural', 'Mysuru', 'Belagavi', 'Mangaluru', 'Hubballi-Dharwad', 'Kalaburagi', 'Tumakuru', 'Ballari', 'Vijayapura', 'Davanagere', 'Shivamogga', 'Raichur', 'Bidar', 'Hassan', 'Mandya', 'Chitradurga', 'Udupi', 'Chikkamagaluru', 'Kolar', 'Bagalkot', 'Haveri', 'Gadag', 'Koppal', 'Yadgir', 'Chamarajanagar', 'Chikkaballapur', 'Ramanagara', 'Kodagu', 'Dakshina Kannada', 'Uttara Kannada'],
    'Tamil Nadu': ['Chennai', 'Coimbatore', 'Madurai', 'Tiruchirappalli', 'Salem', 'Tirunelveli', 'Tiruppur', 'Erode', 'Vellore', 'Thoothukudi', 'Thanjavur', 'Dindigul', 'Kanchipuram', 'Cuddalore', 'Nagercoil', 'Karur', 'Rajapalayam', 'Pudukkottai', 'Sivakasi', 'Thiruvallur', 'Nagapattinam', 'Viluppuram', 'Chengalpattu', 'Tiruvannamalai', 'Ariyalur', 'Dharmapuri', 'Kallakurichi', 'Krishnagiri', 'Mayiladuthurai', 'Nilgiris', 'Perambalur', 'Ranipet', 'Ramanathapuram', 'Sivaganga', 'Tenkasi', 'Theni', 'Tirupathur', 'Virudhunagar'],
    'Uttar Pradesh': ['Lucknow', 'Kanpur', 'Ghaziabad', 'Agra', 'Varanasi', 'Meerut', 'Prayagraj', 'Bareilly', 'Aligarh', 'Moradabad', 'Saharanpur', 'Gorakhpur', 'Noida', 'Firozabad', 'Jhansi', 'Muzaffarnagar', 'Mathura', 'Rampur', 'Shahjahanpur', 'Farrukhabad', 'Ayodhya', 'Maunath Bhanjan', 'Hapur', 'Etawah', 'Mirzapur', 'Bulandshahr', 'Sambhal', 'Amroha', 'Hardoi', 'Fatehpur', 'Raebareli', 'Orai', 'Sitapur', 'Bahraich', 'Modinagar', 'Unnao', 'Jaunpur', 'Lakhimpur', 'Hathras', 'Banda', 'Pilibhit', 'Barabanki', 'Khurja', 'Gonda', 'Mainpuri', 'Lalitpur', 'Etah', 'Deoria', 'Budaun', 'Mughalsarai', 'Basti', 'Chandausi', 'Akbarpur', 'Ballia', 'Tanda', 'Shikohabad', 'Shamli', 'Azamgarh', 'Bijnor', 'Nagina', 'Sultanpur', 'Ghazipur', 'Chitrakoot', 'Pratapgarh', 'Hamirpur', 'Auraiya', 'Kaushambi', 'Kushinagar', 'Sant Kabir Nagar', 'Mahoba', 'Shrawasti', 'Siddharthnagar', 'Sonbhadra', 'Sant Ravidas Nagar', 'Amethi'],
    'West Bengal': ['Kolkata', 'Howrah', 'Durgapur', 'Asansol', 'Siliguri', 'Bardhaman', 'Malda', 'Baharampur', 'Habra', 'Kharagpur', 'Shantipur', 'Dankuni', 'Dhulian', 'Ranaghat', 'Haldia', 'Raiganj', 'Krishnanagar', 'Nabadwip', 'Medinipur', 'Jalpaiguri', 'Balurghat', 'Basirhat', 'Bankura', 'Chakdaha', 'Darjeeling', 'Alipurduar', 'Purulia', 'Jangipur', 'Bangaon', 'Cooch Behar', 'Birbhum', 'Murshidabad', 'Nadia', 'North 24 Parganas', 'South 24 Parganas', 'Paschim Bardhaman', 'Purba Bardhaman', 'Uttar Dinajpur', 'Dakshin Dinajpur', 'Kalimpong', 'Jhargram', 'Hooghly', 'Paschim Medinipur', 'Purba Medinipur'],
    'Gujarat': ['Ahmedabad', 'Surat', 'Vadodara', 'Rajkot', 'Bhavnagar', 'Jamnagar', 'Junagadh', 'Gandhinagar', 'Gandhidham', 'Nadiad', 'Morbi', 'Surendranagar', 'Bharuch', 'Mehsana', 'Bhuj', 'Anand', 'Vapi', 'Navsari', 'Veraval', 'Porbandar', 'Godhra', 'Botad', 'Patan', 'Amreli', 'Deesa', 'Jetpur Navagadh', 'Palanpur', 'Valsad', 'Dahod', 'Narmada', 'Aravalli', 'Chhota Udaipur', 'Devbhumi Dwarka', 'Gir Somnath', 'Mahisagar', 'Morbi', 'Botad'],
    'Rajasthan': ['Jaipur', 'Jodhpur', 'Kota', 'Bikaner', 'Ajmer', 'Udaipur', 'Bhilwara', 'Alwar', 'Bharatpur', 'Pali', 'Barmer', 'Sikar', 'Tonk', 'Sadulpur', 'Sawai Madhopur', 'Nagaur', 'Makrana', 'Sujangarh', 'Sardarshahar', 'Ladnu', 'Ratangarh', 'Nokha', 'Nimbahera', 'Suratgarh', 'Rajsamand', 'Lachhmangarh', 'Rajgarh', 'Nasirabad', 'Nohar', 'Phalodi', 'Nathdwara', 'Pilani', 'Merta City', 'Sojat', 'Neem-Ka-Thana', 'Sirohi', 'Pratapgarh', 'Rawatbhata', 'Sangaria', 'Lalsot', 'Pilibanga', 'Pipar City', 'Taranagar', 'Vijainagar', 'Sumerpur', 'Sagwara', 'Ramganj Mandi', 'Lakheri', 'Gothra', 'Rajakhera', 'Shahpura', 'Raisinghnagar', 'Malpura', 'Nadbai', 'Sanchore', 'Nagar', 'Rajgarh', 'Sheoganj', 'Sadri', 'Taranagar', 'Todabhim', 'Todra', 'Udaipurwati', 'Pratapgarh', 'Dungarpur'],
    'Andhra Pradesh': ['Visakhapatnam', 'Vijayawada', 'Guntur', 'Nellore', 'Kurnool', 'Rajahmundry', 'Tirupati', 'Kadapa', 'Kakinada', 'Anantapur', 'Vizianagaram', 'Eluru', 'Ongole', 'Nandyal', 'Machilipatnam', 'Adoni', 'Tenali', 'Chittoor', 'Hindupur', 'Proddatur', 'Bhimavaram', 'Madanapalle', 'Guntakal', 'Dharmavaram', 'Gudivada', 'Srikakulam', 'Narasaraopet', 'Tadipatri', 'Tadepalligudem', 'Chilakaluripet', 'Yemmiganur', 'Kadiri', 'Chirala', 'Anakapalle', 'Kavali', 'Palacole', 'Sullurpeta', 'Tanuku', 'Rayachoti', 'Bapatla', 'Naidupet', 'Nagari', 'Sattenapalle', 'Vinukonda', 'Narasapuram', 'Nuzvid', 'Markapur', 'Ponnur', 'Kandukur'],
    'Telangana': ['Hyderabad', 'Warangal', 'Nizamabad', 'Karimnagar', 'Ramagundam', 'Khammam', 'Mahbubnagar', 'Nalgonda', 'Adilabad', 'Suryapet', 'Miryalaguda', 'Jagtial', 'Mancherial', 'Nirmal', 'Kothagudem', 'Bodhan', 'Palwancha', 'Mandamarri', 'Koratla', 'Sircilla', 'Tandur', 'Siddipet', 'Wanaparthy', 'Kagaznagar', 'Gadwal', 'Sangareddy', 'Bellampalle', 'Bhongir', 'Vikarabad', 'Jangaon', 'Bhadrachalam', 'Bhainsa', 'Farooqnagar', 'Medak', 'Mahabubabad', 'Kamareddy', 'Nagarkurnool', 'Peddapalli', 'Rajanna Sircilla'],
    'Kerala': ['Thiruvananthapuram', 'Kochi', 'Kozhikode', 'Kollam', 'Thrissur', 'Kannur', 'Alappuzha', 'Palakkad', 'Malappuram', 'Kottayam', 'Kasaragod', 'Pathanamthitta', 'Idukki', 'Wayanad'],
    'Punjab': ['Ludhiana', 'Amritsar', 'Jalandhar', 'Patiala', 'Bathinda', 'Pathankot', 'Hoshiarpur', 'Batala', 'Moga', 'Abohar', 'Malerkotla', 'Khanna', 'Phagwara', 'Muktsar', 'Barnala', 'Rajpura', 'Firozpur', 'Kapurthala', 'Faridkot', 'Mansa', 'Gurdaspur', 'Tarn Taran', 'Nawanshahr', 'Fazilka', 'Rupnagar', 'Mohali', 'Sangrur'],
    'Haryana': ['Faridabad', 'Gurgaon', 'Hisar', 'Rohtak', 'Panipat', 'Karnal', 'Sonipat', 'Yamunanagar', 'Panchkula', 'Bhiwani', 'Bahadurgarh', 'Jind', 'Sirsa', 'Thanesar', 'Kaithal', 'Rewari', 'Palwal', 'Ambala', 'Kurukshetra', 'Fatehabad', 'Jhajjar', 'Mahendragarh', 'Nuh', 'Charkhidadri']
};

export const JOB_BENEFITS = [
    { value: 'health_insurance', label: 'Health Insurance' },
    { value: 'pension', label: 'Pension' },
    { value: 'paid_leave', label: 'Paid Leave' },
    { value: 'housing', label: 'Housing Allowance' },
    { value: 'meal', label: 'Meal Allowance' },
    { value: 'transportation', label: 'Transportation' }
];

// Salary currencies
export const CURRENCIES = [
    { value: 'INR', label: 'INR (₹)', symbol: '₹' },
    { value: 'USD', label: 'USD ($)', symbol: '$' },
    { value: 'EUR', label: 'EUR (€)', symbol: '€' },
    { value: 'GBP', label: 'GBP (£)', symbol: '£' }
];

// Salary periods
export const SALARY_PERIODS = [
    { value: 'hourly', label: 'Hourly' },
    { value: 'monthly', label: 'Monthly' },
    { value: 'annual', label: 'Annual' }
];

// Application statuses
export const APPLICATION_STATUS = [
    { value: 'pending', label: 'Pending Review', color: 'orange' },
    { value: 'shortlisted', label: 'Shortlisted', color: 'blue' },
    { value: 'rejected', label: 'Rejected', color: 'red' },
    { value: 'accepted', label: 'Accepted', color: 'green' }
];

// Job statuses
export const JOB_STATUS = [
    { value: 'active', label: 'Active', color: 'green' },
    { value: 'pending', label: 'Pending Approval', color: 'orange' },
    { value: 'expired', label: 'Expired', color: 'red' },
    { value: 'closed', label: 'Closed', color: 'gray' }
];