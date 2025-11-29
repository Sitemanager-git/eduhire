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
    "Andhra Pradesh": ["Visakhapatnam", "Vijayawada", "Guntur", "Nellore", "Kurnool", "Tirupati", "Chitoor", "Kadapa", "Anantapur", "Chittoor"],
    "Arunachal Pradesh": ["Papum Pare", "Changlang", "West Kameng", "East Kameng", "Subansiri Lower", "Subansiri Upper", "Siang", "West Siang", "East Siang", "Upper Siang", "Anjaw", "Lohit", "Dibang Valley", "Tawang"],
    "Assam": ["Kamrup", "Nagaon", "Sonitpur", "Barpeta", "Cachar", "Karimganj", "Hailakandi", "Sibsagar", "Jorhat", "Golaghat", "Karbi Anglong", "Dima Hasao", "Lakhimpur", "Dhemaji", "Tinsukia", "Dibrugarh", "Kokrajhar", "Chirang", "Baksa", "Udalguri", "Nalbari"],
    "Bihar": ["Patna", "Gaya", "Bhagalpur", "Muzaffarpur", "Purnia", "East Champaran", "West Champaran", "Madhubani", "Supaul", "Araria", "Kishanganj", "Katihar", "Darbhanga", "Sitamarhi", "Sheohar", "Nalanda", "Aurangabad", "Arwal", "Jehanabad", "Saran", "Siwan", "Gopalganj", "Vaishali", "Saharsa", "Jamui"],
    "Chhattisgarh": ["Raipur", "Durg", "Bilaspur", "Rajnandgaon", "Bastar", "Kanker", "Jagdalpur", "Dhamtari", "Mandir", "Korba", "Raigarh", "Surguja", "Janjgir-Champa"],
    "Goa": ["North Goa", "South Goa"],
    "Gujarat": ["Ahmedabad", "Surat", "Vadodara", "Rajkot", "Bhavnagar", "Jamnagar", "Junagadh", "Porbandar", "Kutch", "Kheda", "Panchmahal", "Dahod", "Anand", "Arvalli", "Mahisagar", "Narmada", "Broach", "Valsad", "Navsari", "Tapi", "Gandhinagar", "Sabarkantha"],
    "Haryana": ["Faridabad", "Gurgaon", "Panipat", "Ambala", "Yamunanagar", "Rohtak", "Hisar", "Jind", "Karnal", "Kaithal", "Fatehabad", "Sonipat", "Bhiwani", "Mahendragarh", "Nuh", "Palwal", "Mewat"],
    "Himachal Pradesh": ["Shimla", "Solan", "Kangra", "Kullu", "Mandi", "Chamba", "Kinnaur", "Spiti", "Lahaul", "Sirmaur", "Una", "Bilaspur"],
    "Jharkhand": ["Ranchi", "Dhanbad", "Giridih", "Hazaribagh", "Bokaro", "Purbi Singhbhum", "Paschim Singhbhum", "Dumka", "Godda", "Deoghar", "Gumla", "Latehar", "Ramgarh", "Koderma", "Pakur", "Sahibganj", "Khunti", "Saraikela Kharsawan"],
    "Karnataka": ["Bangalore Urban", "Bangalore Rural", "Mysore", "Mangalore", "Hubli", "Belgaum", "Gulbarga", "Belagavi", "Raichur", "Ballari", "Davanagere", "Chitradurga", "Tumkur", "Kolar", "Chikmagalur", "Hassan", "Kodagu", "Uttara Kannada"],
    "Kerala": ["Thiruvananthapuram", "Kochi", "Kozhikode", "Thrissur", "Kollam", "Pathanamthitta", "Alappuzha", "Ernakulam", "Idukki", "Malappuram", "Wayanad", "Kannur", "Kasaragod"],
    "Madhya Pradesh": ["Indore", "Bhopal", "Jabalpur", "Gwalior", "Ujjain", "Sagar", "Ratlam", "Khargone", "Barwani", "Khandwa", "Burhanpur", "Dhar", "Vidisha", "Raisen", "Damoh", "Panna", "Satna", "Chhindwara", "Betul", "Hoshangabad", "Jhabua", "Dewas", "Rajgarh", "Mandsaur", "Neemuch", "Shahdol", "Umaria", "Anuppur", "Seoni", "Mandla", "Balaghat", "Ashoknagar", "Shivpuri", "Guna", "Datia"],
    "Maharashtra": ["Mumbai", "Pune", "Nagpur", "Thane", "Nashik", "Aurangabad", "Solapur", "Kolhapur", "Sangli", "Satara", "Ratnagiri", "Sindhudurg", "Ahmednagar", "Beed", "Latur", "Parbhani", "Yavatmal", "Amravati", "Akola", "Washim", "Buldhana", "Jalna", "Hingoli", "Wardha", "Chandrapur", "Gadchiroli", "Gondia"],
    "Manipur": ["Imphal East", "Imphal West", "Thoubal", "Ukhrul", "Senapati", "Bishnupur", "Kakching", "Tamenglong", "Churachandpur"],
    "Meghalaya": ["Shillong", "East Khasi Hills", "West Khasi Hills", "Jaintia Hills", "East Garo Hills", "West Garo Hills", "South Garo Hills", "Ri-Bhoi"],
    "Mizoram": ["Aizaw", "Lunglei", "Saiha", "Kolasib", "Mamit", "Lawngtlai"],
    "Nagaland": ["Kohima", "Dimapur", "Wokha", "Zunheboto", "Mokokchung", "Tuensang", "Mon", "Kiphire", "Longleng", "Peren"],
    "Odisha": ["Bhubaneswar", "Cuttack", "Balasore", "Balangir", "Bargarh", "Bhadrak", "Bolangir", "Boudh", "Deogarh", "Dhenkanal", "Gajapati", "Ganjam", "Jagatsinghpur", "Jajpur", "Jharsuguda", "Kalahandi", "Kandhamal", "Kendrapara", "Kendujhar", "Khordha", "Koraput", "Malkangiri", "Mayurbhanj", "Nabarangpur", "Nayagarh", "Nuapada", "Puri", "Rayagada", "Sambalpur", "Subarnapur", "Sundargarh"],
    "Punjab": ["Ludhiana", "Amritsar", "Jalandhar", "Patiala", "Bathinda", "Mohali", "Hoshiarpur", "Gurdaspur", "Kapurthala", "Firozpur", "Sangrur", "Barnala", "Mansa", "Faridkot", "Pathankot", "Tarn Taran", "Muktsar"],
    "Rajasthan": ["Jaipur", "Jodhpur", "Kota", "Bikaner", "Ajmer", "Udaipur", "Alwar", "Banswara", "Baran", "Barmer", "Bharatpur", "Bhilwara", "Chittorgarh", "Churu", "Dausa", "Dholpur", "Dungarpur", "Ganganagar", "Hanumangarh", "Jaisalmer", "Jalore", "Jhalawar", "Jhunjhunu", "Karauli", "Nagaur", "Pali", "Pratapgarh", "Sawai Madhopur", "Sikar", "Sirohi", "Tonk"],
    "Sikkim": ["East Sikkim", "West Sikkim", "North Sikkim", "South Sikkim"],
    "Tamil Nadu": ["Chennai", "Coimbatore", "Madurai", "Tiruchirappalli", "Salem", "Tirunelveli", "Kanyakumari", "Thoothukudi", "Virudunagar", "Dindigul", "Erode", "Namakkal", "Perambalur", "Villupuram", "Vellore", "Ranipet", "Tiruppur", "Krishnagiri", "Chengalpattu", "Kanchipuram", "Tiruvannamalai", "Ariyalur", "Cuddalore", "Kallakurichi"],
    "Telangana": ["Hyderabad", "Warangal", "Nizamabad", "Khammam", "Karimnagar", "Adilabad", "Medak", "Nalgonda", "Mahbubnagar", "Rangareddy", "Vikarabad", "Sangareddy", "Tandur", "Yadadri Bhuvanagiri"],
    "Tripura": ["Agartala", "West Tripura", "South Tripura", "Dhalai", "Gomti", "Khowai", "Sipahijala", "Unakoti"],
    "Uttar Pradesh": ["Lucknow", "Kanpur", "Ghaziabad", "Agra", "Varanasi", "Meerut", "Prayagraj", "Noida", "Aligarh", "Bareilly", "Mathura", "Azamgarh", "Etah", "Mainpuri", "Etawah", "Firozabad", "Moradabad", "Rampur", "Saharanpur", "Muzaffarnagar", "Bijnor", "Jyotiba Phule Nagar", "Maudaha", "Budaun", "Bulandshahr", "Hapur", "Pilbhit", "Sitapur", "Lakhimpur Kheri", "Hardoi", "Raibareli", "Sultanpur", "Jaunpur", "Ghazipur", "Ballia", "Deoria", "Gorakhpur", "Kushinagar", "Maharajganj", "Basti", "Sant Kabir Nagar", "Ambedkar Nagar", "Siddharthnagar", "Banda", "Hamirpur", "Jalaun", "Kanpur Dehat", "Fatehpur", "Unnao", "Sonbhadra", "Mirzapur", "Bhadohi"],
    "Uttarakhand": ["Dehradun", "Haridwar", "Uttarkashi", "Chamoli", "Rudraprayag", "Tehri", "Bageshwar", "Almora", "Nainital", "Pauri Garhwal", "Pithoragarh", "Udham Singh Nagar"],
    "West Bengal": ["Kolkata", "Howrah", "Durgapur", "Asansol", "Siliguri", "Darjeeling", "Jalpaiguri", "Cooch Behar", "West Dinajpur", "Malda", "Uttar Dinajpur", "North 24 Parganas", "South 24 Parganas", "Nadia", "Murshidabad", "Birbhum", "Bardhaman", "Purba Medinipur", "Paschim Medinipur", "Hooghly", "Bankura", "Purulia", "East Midnapore"],
    "Delhi": ["Central Delhi", "East Delhi", "New Delhi", "North Delhi", "North East Delhi", "North West Delhi", "South Delhi", "South East Delhi", "South West Delhi", "West Delhi", "Shahdara"],
    "Jammu and Kashmir": ["Srinagar", "Jammu", "Leh", "Kargil", "Anantnag", "Baramulla", "Samba", "Udhampur", "Kathua", "Kishtwar", "Doda", "Ramban", "Pulwama", "Shopian", "Ganderbal"],
    "Ladakh": ["Leh", "Kargil"],
    "Andaman and Nicobar Islands": ["North and Middle Andaman", "South Andaman", "Nicobar"],
    "Chandigarh": ["Chandigarh"],
    "Dadra and Nagar Haveli and Daman and Diu": ["Dadra and Nagar Haveli", "Daman", "Diu"],
    "Lakshadweep": ["Lakshadweep"],
    "Puducherry": ["Puducherry", "Yanam", "Mahe", "Karaikal"]
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