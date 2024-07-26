async function fetchLocalData() {
    try {
        const response = await fetch('http://127.0.0.1:5500/data/db.json');
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching local data:', error);
    }
}

async function fetchResearchPapers(query, page = 1, pageSize = 10) {
    const apiKey = 'YQUa7TeyOYVGirNsvoJfpWq5HPc1CEtIj';
    const apiUrl = `https://api.core.ac.uk/v3/search/works?q=${query}&page=${page}&pageSize=${pageSize}`;

    try {
        const response = await fetch(apiUrl, {
            headers: {
                'Authorization': `Bearer ${apiKey}`
            }
        });
        const data = await response.json();
        return data.results;
    } catch (error) {
        console.error('Error fetching research papers:', error);
    }
}

async function loadFilteredResources(query, type, department, course) {
    const localData = await fetchLocalData();
    let filteredResources = localData.resources;

    if (type === 'student') {
        filteredResources = filteredResources.filter(resource => resource.type === 'student');
    }
    if (department !== 'all') {
        filteredResources = filteredResources.filter(resource => resource.department === department);
    }
    if (course !== 'all') {
        filteredResources = filteredResources.filter(resource => resource.course === course);
    }
    if (query) {
        filteredResources = filteredResources.filter(resource => 
            resource.title.toLowerCase().includes(query.toLowerCase()) ||
            resource.description.toLowerCase().includes(query.toLowerCase())
        );
    }

    displayResources(filteredResources);
}

async function loadResearchPapers(query) {
    const papers = await fetchResearchPapers(query);
    displayResearchPapers(papers);
}

function displayResources(resources) {
    const container = document.getElementById('resourceContainer');
    container.innerHTML = '';

    resources.forEach(resource => {
        const card = createResourceCard(resource);
        container.appendChild(card);
    });
}

function displayResearchPapers(papers) {
    const container = document.getElementById('papersContainer');
    container.innerHTML = '';

    if (papers && papers.length > 0) {
        papers.forEach(paper => {
            const card = createPaperCard(paper);
            container.appendChild(card);
        });
    } else {
        container.innerHTML = '<p>No research papers found.</p>';
    }
}

function createResourceCard(resource) {
    const card = document.createElement('div');
    card.className = 'card';
    card.innerHTML = `
        <h3>${resource.title}</h3>
        <p>${resource.description}</p>
        <p>Type: ${resource.type}</p>
        <p>Department: ${resource.department}</p>
        <p>Course: ${resource.course}</p>
        <a href="${resource.link}" target="_blank">View Resource</a>
    `;
    return card;
}

function createPaperCard(paper) {
    const card = document.createElement('div');
    card.className = 'card';
    
    const title = paper.title || 'Untitled';
    const authors = paper.authors ? paper.authors.map(author => author.name).join(', ') : 'Unknown Author(s)';
    const abstract = paper.abstract || 'No abstract available';
    const downloadUrl = paper.downloadUrl || paper.url || '#';

    card.innerHTML = `
        <h3>${title}</h3>
        <p>Authors: ${authors}</p>
        <p>Abstract: ${abstract.substring(0, 200)}${abstract.length > 200 ? '...' : ''}</p>
        <a href="${downloadUrl}" target="_blank" rel="noopener noreferrer" class="paper-link">View Paper</a>
    `;

    card.addEventListener('click', function(e) {
        if (!e.target.classList.contains('paper-link')) {
            window.open(downloadUrl, '_blank', 'noopener,noreferrer');
        }
    });

    return card;
}

async function loadResources() {
    await loadFilteredResources('', 'all', 'all', 'all');
}

function scrollToElement(elementId) {
    const element = document.getElementById(elementId);
    if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
}

document.getElementById('searchForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    const searchQuery = document.getElementById('searchQuery').value;
    const filterType = document.getElementById('filterType').value;
    const filterDepartment = document.getElementById('filterDepartment').value;
    const filterCourse = document.getElementById('filterCourse').value;

    if (filterType === 'research') {
        document.getElementById('resources').style.display = 'none';
        document.getElementById('research-papers').style.display = 'block';
        await loadResearchPapers(searchQuery);
        setTimeout(() => scrollToElement('research-papers'), 100);
    } else {
        document.getElementById('research-papers').style.display = 'none';
        document.getElementById('resources').style.display = 'block';
        await loadFilteredResources(searchQuery, filterType, filterDepartment, filterCourse);
        setTimeout(() => scrollToElement('resources'), 100);
    }
});

document.getElementById('gridView').addEventListener('click', function() {
    document.getElementById('resourceContainer').className = 'grid-view';
});

document.getElementById('listView').addEventListener('click', function() {
    document.getElementById('resourceContainer').className = 'list-view';
});

// Initial load
window.addEventListener('load', loadResources);


// Global variables
let resources = JSON.parse(localStorage.getItem('resources')) || [];

//form handling
document.getElementById('uploadForm').addEventListener('submit', async (event) => {
    event.preventDefault();
  
    const formData = new FormData();
    formData.append('resourceName', document.getElementById('resourceName').value);
    formData.append('resourceDescription', document.getElementById('resourceDescription').value);
    formData.append('resourceDepartment', document.getElementById('resourceDepartment').value);
    formData.append('resourceCourse', document.getElementById('resourceCourse').value);
  

   
    const files = document.getElementById('fileInput').files;
    for (let i = 0; i < files.length; i++) {
      formData.append('files', files[i]);
    }
  
    const response = await fetch('/upload', {
      method: 'POST',
      body: formData,
    });
  
    const result = await response.json();
    alert(result.message);
  });
  


// Function to display recent uploads
document.addEventListener('DOMContentLoaded', () => {
    fetchResources();
  
    document.getElementById('gridView').addEventListener('click', () => {
      document.getElementById('resourceContainer').classList.add('grid-view');
      document.getElementById('resourceContainer').classList.remove('list-view');
    });
  
    document.getElementById('listView').addEventListener('click', () => {
      document.getElementById('resourceContainer').classList.add('list-view');
      document.getElementById('resourceContainer').classList.remove('grid-view');
    });
  
    async function fetchResources() {
      try {
        const response = await fetch('/resources');
        if (!response.ok) throw new Error('Network response was not ok');
        
        const resources = await response.json();
        displayResources(resources);
      } catch (error) {
        console.error('Error fetching resources:', error);
      }
    }
  
    function displayResources(resources) {
      const resourceContainer = document.getElementById('resourceContainer');
      resourceContainer.innerHTML = '';
  
      resources.forEach(resource => {
        const resourceElement = document.createElement('div');
        resourceElement.classList.add('resource-item');
        resourceElement.innerHTML = `
          <h3>${resource.name}</h3>
          <p>${resource.description}</p>
          <p>Department: ${resource.department}</p>
          <p>Course: ${resource.course}</p>
          <p>Date: ${new Date(resource.date).toLocaleDateString()}</p>
          <a href="/uploads/${resource.filename}" target="_blank">Download</a>
        `;
        resourceContainer.appendChild(resourceElement);
      });
    }
  });
  
// Function to populate courses based on selected department
document.getElementById('resourceDepartment').addEventListener('change', function(e) {
    const department = e.target.value;
    const courseSelect = document.getElementById('resourceCourse');
    courseSelect.innerHTML = '<option value="">Select Course</option>';

    const courses = {
        'civil': [
            { value: 'ce101', name: 'CE101: Introduction to Civil Engineering' },
            { value: 'ce202', name: 'CE202: Structural Analysis' },
            { value: 'ce303', name: 'CE303: Geotechnical Engineering' },
            { value: 'ce404', name: 'CE404: Transportation Engineering' }
        ],
        'mechanical': [
            { value: 'me101', name: 'ME101: Fundamentals of Mechanical Engineering' },
            { value: 'me202', name: 'ME202: Thermodynamics' },
            { value: 'me303', name: 'ME303: Fluid Mechanics' },
            { value: 'me404', name: 'ME404: Machine Design' }
        ],
        'electrical': [
            { value: 'ee101', name: 'EE101: Basics of Electrical Engineering' },
            { value: 'ee202', name: 'EE202: Circuit Analysis' },
            { value: 'ee303', name: 'EE303: Electromagnetic Fields and Waves' },
            { value: 'ee404', name: 'EE404: Power Systems' }
        ],
        'chemical': [
            { value: 'che101', name: 'CHE101: Introduction to Chemical Engineering' },
            { value: 'che202', name: 'CHE202: Chemical Process Principles' },
            { value: 'che303', name: 'CHE303: Thermodynamics for Chemical Engineers' },
            { value: 'che404', name: 'CHE404: Chemical Reaction Engineering' }
        ],
        'software': [
            { value: 'se101', name: 'SE101: Introduction to Software Engineering' },
            { value: 'se202', name: 'SE202: Object-Oriented Programming' },
            { value: 'se303', name: 'SE303: Software Development Methodologies' },
            { value: 'se404', name: 'SE404: Advanced Software Engineering' }
        ]
    };

    if (courses[department]) {
        courses[department].forEach(course => {
            const option = document.createElement('option');
            option.value = course.value;
            option.textContent = course.name;
            courseSelect.appendChild(option);
        });
    }
});


// Initial display of recent uploads


