// const express = require('express');
// const multer = require('multer');
// const fs = require('fs');
// const path = require('path');

// const app = express();
// const PORT = process.env.PORT || 3000;

// const upload = multer({ dest: 'uploads/' });

// app.use(express.static('public'));

// app.post('/upload', upload.array('files'), (req, res) => {
//   const { resourceName, resourceDescription, resourceDepartment, resourceCourse } = req.body;
//   const files = req.files.map(file => ({ filename: file.filename, originalname: file.originalname }));

//   const data = {
//     resourceName,
//     resourceDescription,
//     resourceDepartment,
//     resourceCourse,
//     files,
//   };

//   const dbFilePath = path.join(__dirname, 'data', 'db.json');
//   let db = [];

//   if (fs.existsSync(dbFilePath)) {
//     db = JSON.parse(fs.readFileSync(dbFilePath));
//   }

//   db.push(data);
//   fs.writeFileSync(dbFilePath, JSON.stringify(db, null, 2));

//   res.json({ message: 'Files uploaded and data saved successfully.' });
// });

// app.listen(PORT, () => {
//   console.log(`Server running on http://localhost:${PORT}`);
// });

//first code 
// const express = require('express');
// const multer = require('multer');
// const fs = require('fs');
// const path = require('path');

// const app = express();
// const PORT = process.env.PORT || 3000;

// // Serve static files from the public directory
// app.use(express.static('public'));

// // Set up storage for file uploads
// const storage = multer.diskStorage({
//   destination: 'uploads/',
//   filename: (req, file, cb) => {
//     cb(null, Date.now() + path.extname(file.originalname));
//   }
// });

// const upload = multer({ storage });

// // Endpoint to upload files
// app.post('/upload', upload.array('files'), (req, res) => {
//   const resources = JSON.parse(fs.readFileSync('data/db.json'));
//   req.files.forEach(file => {
//     resources.push({
//       name: req.body.resourceName,
//       description: req.body.resourceDescription,
//       department: req.body.resourceDepartment,
//       course: req.body.resourceCourse,
//       filename: file.filename,
//       date: new Date()
//     });
//   });
//   fs.writeFileSync('data/db.json', JSON.stringify(resources, null, 2));
//   res.json({ message: 'Files uploaded successfully!' });
// });

// // Endpoint to get recent uploads
// app.get('/resources', (req, res) => {
//   const resources = JSON.parse(fs.readFileSync('data/db.json'));
//   res.json(resources);
// });

// app.listen(PORT, () => {
//   console.log(`Server is running on http://localhost:${PORT}`);
// });

const express = require('express');
const multer = require('multer');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Serve static files from the public directory
app.use(express.static('public'));

// Set up storage for file uploads
const storage = multer.diskStorage({
  destination: 'uploads/',
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ storage });

// Ensure data directory and db.json exist
if (!fs.existsSync('data')) {
  fs.mkdirSync('data');
}
if (!fs.existsSync('data/db.json')) {
  fs.writeFileSync('data/db.json', '[]');
}

// Endpoint to upload files
app.post('/upload', upload.array('files'), (req, res) => {
  const resources = JSON.parse(fs.readFileSync('data/db.json'));
  req.files.forEach(file => {
    resources.push({
      name: req.body.resourceName,
      description: req.body.resourceDescription,
      department: req.body.resourceDepartment,
      course: req.body.resourceCourse,
      filename: file.filename,
      date: new Date()
    });
  });
  fs.writeFileSync('data/db.json', JSON.stringify(resources, null, 2));
  res.json({ message: 'Files uploaded successfully!' });
});

// Endpoint to get recent uploads
app.get('/resources', (req, res) => {
  const resources = JSON.parse(fs.readFileSync('data/db.json'));
  res.json(resources);
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
