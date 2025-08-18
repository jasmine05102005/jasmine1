// script.js
const form = document.getElementById('examForm');
const plansContainer = document.getElementById('plansContainer');
const showPlansBtn = document.getElementById('showPlansBtn');

// Save plan to localStorage
function savePlan(plan) {
  let plans = JSON.parse(localStorage.getItem('examPlans')) || [];
  plans.push(plan);
  localStorage.setItem('examPlans', JSON.stringify(plans));
}

// Delete plan by id
function deletePlan(id) {
  let plans = JSON.parse(localStorage.getItem('examPlans')) || [];
  plans = plans.filter(plan => plan.id !== id);
  localStorage.setItem('examPlans', JSON.stringify(plans));
  alert('Study plan deleted.');
  renderPlans(plans);
}

// Convert hours + minutes to total minutes
function timeToMinutes(hours, minutes) {
  return parseInt(hours || 0) * 60 + parseInt(minutes || 0);
}

// Render plans to UI
function renderPlans(plans) {
  plansContainer.innerHTML = '';
  if (plans.length === 0) {
    plansContainer.innerHTML = '<p style="text-align:center; color:#666;">No study plans found.</p>';
    return;
  }

  plans.forEach(plan => {
    const planEl = document.createElement('div');
    planEl.classList.add('plan');

    const header = document.createElement('div');
    header.classList.add('plan-header');
    header.innerHTML = `<h3>${plan.examName} - ${plan.examDate}</h3>`;

    const deleteBtn = document.createElement('button');
    deleteBtn.textContent = 'Delete';
    deleteBtn.classList.add('delete-btn');
    deleteBtn.onclick = () => deletePlan(plan.id);

    header.appendChild(deleteBtn);
    planEl.appendChild(header);

    // Create flowchart
    const flowchart = document.createElement('div');
    flowchart.classList.add('flowchart');

    plan.topics.forEach(topic => {
      const topicDiv = document.createElement('div');
      topicDiv.classList.add('topic');
      topicDiv.innerHTML = `<strong>Topic:</strong> ${topic.name} — <em>Study Time: ${Math.floor(topic.studyTime / 60)}h ${topic.studyTime % 60}m</em>`;

      topic.subtopics.forEach(sub => {
        const subDiv = document.createElement('div');
        subDiv.classList.add('subtopic');
        subDiv.innerHTML = `<strong>Sub-topic:</strong> ${sub.name} — <em>Study Time: ${Math.floor(sub.studyTime / 60)}h ${sub.studyTime % 60}m</em>`;
        topicDiv.appendChild(subDiv);
      });

      flowchart.appendChild(topicDiv);
    });

    planEl.appendChild(flowchart);
    plansContainer.appendChild(planEl);
  });
}

// Parse form input into structured data
function parseInput() {
  const examName = document.getElementById('examName').value.trim();
  const examDate = document.getElementById('examDate').value;
  const topicsRaw = document.getElementById('topics').value.trim();
  const subtopicsRaw = document.getElementById('subtopics').value.trim();
  const topicHours = document.getElementById('topicHours').value;
  const topicMinutes = document.getElementById('topicMinutes').value;
  const subtopicHours = document.getElementById('subtopicHours').value;
  const subtopicMinutes = document.getElementById('subtopicMinutes').value;

  if (!examName || !examDate || !topicsRaw || !subtopicsRaw) {
    alert('Please fill in all required fields.');
    return null;
  }

  const topics = topicsRaw.split(',').map(t => t.trim()).filter(t => t !== '');
  // subtopicsRaw is semicolon separated groups, each group corresponds to one topic
  // e.g. "sub1, sub2; sub1, sub2" for topic1 and topic2 respectively
  const subtopicGroups = subtopicsRaw.split(';').map(group => group.trim());

  if (subtopicGroups.length !== topics.length) {
    alert('Number of sub-topic groups must match number of topics.');
    return null;
  }

  const topicStudyTime = timeToMinutes(topicHours, topicMinutes);
  const subtopicStudyTime = timeToMinutes(subtopicHours, subtopicMinutes);

  // Build structured topics array
  const topicsArr = topics.map((topicName, idx) => {
    const subtopics = subtopicGroups[idx]
      .split(',')
      .map(sub => sub.trim())
      .filter(sub => sub !== '')
      .map(subName => ({
        name: subName,
        studyTime: subtopicStudyTime
      }));
    return {
      name: topicName,
      studyTime: topicStudyTime,
      subtopics: subtopics
    };
  });

  return {
    id: 'plan_' + Date.now(),
    examName,
    examDate,
    topics: topicsArr
  };
}

// Handle form submission
form.addEventListener('submit', e => {
  e.preventDefault();
  const plan = parseInput();
  if (!plan) return;
  savePlan(plan);
  alert('Study plan added!');
  form.reset();
  renderPlans(JSON.parse(localStorage.getItem('examPlans')) || []);
});

// Show previous plans
showPlansBtn.addEventListener('click', () => {
  const plans = JSON.parse(localStorage.getItem('examPlans')) || [];
  renderPlans(plans);
});

// Optional: Show plans on page load
window.onload = () => {
  // Uncomment below if you want to auto-display saved plans on load
  // const plans = JSON.parse(localStorage.getItem('examPlans')) || [];
  // renderPlans(plans);
};
