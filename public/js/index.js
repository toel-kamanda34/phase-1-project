// Handle form submission
document.getElementById('searchForm').addEventListener('submit', async function(e) {
  e.preventDefault();

  const searchQuery = document.getElementById('searchQuery').value.trim();
  const filterType = document.getElementById('filterType').value;
  const filterDepartment = document.getElementById('filterDepartment').value;
  const filterCourse = document.getElementById('filterCourse').value;

  if (filterType === 'research') {
    try {
      const apiKey = 'Gn70w6NdWiSF1UxPmBrHZfu59OkzoYIc';
      const apiUrl = `https://api.core.ac.uk/v3/search/works?q=${searchQuery}&page=1&pageSize=10`;
      const response = await fetch(apiUrl, {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
        },
      });
      const data = await response.json();
      const papers = data.results;

      displayResearchPapers(papers);

      // Scroll to the research papers section
      const researchPapersSection = document.getElementById('research-papers');
      researchPapersSection.scrollIntoView({ behavior: 'smooth' });
    } catch (error) {
      console.error('Error fetching research papers:', error);
    }
  } else {
    try {
      const response = await fetch(`http://localhost:3001/resources?searchQuery=${searchQuery}&filterType=${filterType}&filterDepartment=${filterDepartment}&filterCourse=${filterCourse}`);
      const resources = await response.json();
      updateResourceList(resources);

      // Scroll to the resources section
      const resourcesSection = document.getElementById('resources');
      resourcesSection.scrollIntoView({ behavior: 'smooth' });
    } catch (error) {
      console.error('Error fetching resources:', error);
    }
  }
});

// Display research papers
function displayResearchPapers(papers) {
  const papersContainer = document.getElementById('papersContainer');
  papersContainer.innerHTML = '';

  if (papers) {
    papers.forEach((paper) => {
      const paperHTML = `
        <div>
          <h3>${paper.title}</h3>
          <p>Authors: ${paper.authors}</p>
          <p>DOI: ${paper.doi}</p>
          <p>Publication date: ${paper.publicationDate}</p>
          <p>Publisher: ${paper.publisher}</p>
          <button class="download-button" onclick="window.open('${paper.downloadUrl}', '_blank')">Download</button>
        </div>
      `;
      papersContainer.innerHTML += paperHTML;
    });
  } else {
    papersContainer.innerHTML = 'No research papers found.';
  }
}
function updateResourceList(resources) {
  const resourceContainer = document.getElementById('resourceContainer');
  resourceContainer.innerHTML = '';

  resources.forEach((resource) => {
    const resourceHTML = `
      <div>
        <h3>${resource.name}</h3>
        <p>Description: ${resource.description}</p>
        <p>Department: ${resource.department}</p>
        <p>Course: ${resource.course}</p>
        <p>Files:</p>
        <ul>
          ${resource.files.map((file) => `
            <li>
              <i class="fas fa-file-pdf" style="margin-right: 10px;"></i>
              <a href="http://localhost:3001${file.path}" target="_blank">${file.filename}</a>
            </li>
          `).join('')}
        </ul>
        <button class="upvote-button" data-resource-id="${resource.id}"><i class="fas fa-arrow-up" style="color: orange;"></i></button>
        <span class="vote-count">${resource.upvotes - resource.downvotes}</span>
        <button class="downvote-button" data-resource-id="${resource.id}"><i class="fas fa-arrow-down" style="color: blue;"></i></button>
      </div>
    `;
    resourceContainer.innerHTML += resourceHTML;
  });

  addVoteEventListeners(); // Call addVoteEventListeners here
}



function addVoteEventListeners() {
  const upvoteButtons = document.querySelectorAll('.upvote-button');
  upvoteButtons.forEach((button) => {
    button.addEventListener('click', async function(e) {
      e.preventDefault();
      const resourceId = button.dataset.resourceId;
      try {
        const response = await fetch(`http://localhost:3001/resources/${resourceId}/upvote`, {
          method: 'PUT'
        });
        if (response.ok) {
          const result = await response.json();
          const voteCountElement = button.nextElementSibling;
          voteCountElement.textContent = result.upvotes - result.downvotes;
        } else {
          throw new Error(`Error upvoting resource: ${response.status} ${response.statusText}`);
        }
      } catch (error) {
        console.error('Error upvoting resource:', error);
      }
    });
  });

  const downvoteButtons = document.querySelectorAll('.downvote-button');
  downvoteButtons.forEach((button) => {
    button.addEventListener('click', async function(e) {
      e.preventDefault();
      const resourceId = button.dataset.resourceId;
      try {
        const response = await fetch(`http://localhost:3001/resources/${resourceId}/downvote`, {
          method: 'PUT'
        });
        if (response.ok) {
          const result = await response.json();
          const voteCountElement = button.previousElementSibling;
          voteCountElement.textContent = result.upvotes - result.downvotes;
        } else {
          throw new Error(`Error downvoting resource: ${response.status} ${response.statusText}`);
        }
      } catch (error) {
        console.error('Error downvoting resource:', error);
      }
    });
  });
}

// Fetch resources from the server and update the resource list
async function fetchResources() {
  try {
    const response = await fetch('http://localhost:3001/resources');
    const resources = await response.json();
    updateResourceList(resources);
  } catch (error) {
    console.error('Error fetching resources:', error);
  }
}

// Fetch recent resources on page load
fetchResources();

// Handle form submission
document.getElementById('uploadForm').addEventListener('submit', async function(e) {
  e.preventDefault();

  const formData = new FormData(this);

  try {
    const response = await fetch('http://localhost:3001/upload', {
      method: 'POST',
      body: formData,
      mode: 'cors'
    });

    const result = await response.json();
    console.log(result);
    fetchResources(); // Update the resource list after uploading a new resource
  } catch (error) {
    console.error('Error uploading files:', error);
  }
});
