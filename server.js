const express = require('express');
const app = express();
const fs = require('fs');
const multer = require('multer');
const bodyParser = require('body-parser');
const path = require('path');
const cors = require('cors');
const uuid = require('uuid');

// Set up multer for file uploads
const upload = multer({ dest: './uploads/' });

// Parse incoming JSON and URL-encoded data
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Enable CORS
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Ensure db.json file exists and is properly formatted
const dbFilePath = path.join(__dirname, 'data', 'db.json');
let db;
try {
  db = JSON.parse(fs.readFileSync(dbFilePath));
  if (!Array.isArray(db.resources)) {
    db.resources = [];
  }
} catch (err) {
  db = { resources: [] };
}

// Serve static files
app.use(express.static('public'));

// Endpoint for uploading resources
app.post('/upload', upload.array('files', 12), (req, res) => {
    console.log('Request received:', req.body);
    console.log('Files:', req.files);
  
    const { resourceName, resourceDescription, resourceDepartment, resourceCourse } = req.body;
    const files = req.files;
  
    if (!files || files.length === 0) {
      return res.status(400).json({ error: 'No files were uploaded.' });
    }
  
    // Create a new resource object
    const resource = {
      id: uuid.v4(),
      name: resourceName,
      description: resourceDescription,
      department: resourceDepartment,
      course: resourceCourse,
      files: files.map((file) => ({
        filename: file.originalname, 
        path: `/uploads/${file.filename}`, 
      })),
      upvotes: 0,
      downvotes: 0,
    };
  
    // Add the resource to the database
    db.resources.push(resource);
  
    // Save the database to the JSON file
    try {
      fs.writeFileSync(dbFilePath, JSON.stringify(db, null, 2));
      res.json({ message: 'Resource uploaded successfully!', resource });
    } catch (err) {
      res.status(500).json({ error: 'Failed to save resource to the database.' });
    }
  });
  

// Endpoint for getting recent resources
app.get('/resources', (req, res) => {
  // Get the 4 most recent resources from the database
  const recentResources = db.resources.slice(-4).reverse(); // Reverse to get the most recent first
  res.json(recentResources);
});

// Endpoint for upvoting a resource
app.put('/resources/:resourceId/upvote', (req, res) => {
  const resourceId = req.params.resourceId;
  const resource = db.resources.find((resource) => resource.id === resourceId);
  if (resource) {
    resource.upvotes++;
    try {
      fs.writeFileSync(dbFilePath, JSON.stringify(db, null, 2));
      res.json({ upvotes: resource.upvotes, downvotes: resource.downvotes });
    } catch (err) {
      res.status(500).json({ error: 'Failed to save resource to the database.' });
    }
  } else {
    res.status(404).json({ error: 'Resource not found' });
  }
});

// Endpoint for downvoting a resource
app.put('/resources/:resourceId/downvote', (req, res) => {
  const resourceId = req.params.resourceId;
  const resource = db.resources.find((resource) => resource.id === resourceId);
  if (resource) {
    resource.downvotes++;
    try {
      fs.writeFileSync(dbFilePath, JSON.stringify(db, null, 2));
      res.json({ upvotes: resource.upvotes, downvotes: resource.downvotes });
    } catch (err) {
      res.status(500).json({ error: 'Failed to save resource to the database.' });
    }
  } else {
    res.status(404).json({ error: 'Resource not found' });
  }
});

app.get('/uploads/:filename', (req, res) => {
  const filename = req.params.filename;
  const filePath = path.join(__dirname, 'uploads', filename);
  if (fs.existsSync(filePath)) {
    res.sendFile(path.resolve(filePath));
  } else {
    res.status(404).json({ error: 'File not found' });
  }
});

// Start the server
const port = 3001;
app.listen(port, () => {
  console.log(`Server started on port ${port}`);
});