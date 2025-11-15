// Sample test cases for advanced filters
const testCases = [
  {
    name: 'Experience 5-10 years + CBSE + Mathematics',
    filters: {
      experienceMin: 5,
      experienceMax: 10,
      institutionType: ['CBSE'],
      subject: 'Mathematics'
    },
    expectedResults: 'Jobs with 5-10 years exp, CBSE, Math subject'
  },
  {
    name: 'Salary 50k-80k + Full-time + B.Ed',
    filters: {
      salaryMin: 50000,
      salaryMax: 80000,
      jobType: ['Full-time'],
      qualification: ['B.Ed']
    },
    expectedResults: 'Jobs with salary in range, full-time, B.Ed'
  }
  // Add more test cases
];

// Manual testing via Postman/Thunder Client recommended
