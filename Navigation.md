Route                       |  URL                                               |  Status   
----------------------------+----------------------------------------------------+-----------
Home                        |  http://localhost:3000/                            |  Public   
Register                    |  http://localhost:3000/register                    |  Public   
Login                       |  http://localhost:3000/login                       |  Public   
Dashboard                   |  http://localhost:3000/dashboard                   |  Protected
Post Job                    |  http://localhost:3000/post-job                    |  Protected
My Jobs                     |  http://localhost:3000/my-jobs                     |  Protected
Create Institution Profile  |  http://localhost:3000/create-institution-profile  |  Protected
Create Teacher Profile      |  http://localhost:3000/create-teacher-profile      |  Protected
Test the endpoints:
# Search with text
curl "http://localhost:5000/api/jobs/search?search=mathematics%20teacher&page=1&limit=10"

# Filter by subject and level
curl "http://localhost:5000/api/jobs/search?subject=Mathematics&level=secondary&page=1"

# Get job details
curl "http://localhost:5000/api/jobs/search/{jobId}"

# Get similar jobs
curl "http://localhost:5000/api/jobs/search/{jobId}/similar"

# Get filter options
curl "http://localhost:5000/api/jobs/search/filters"