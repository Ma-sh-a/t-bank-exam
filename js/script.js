document.addEventListener('DOMContentLoaded', function() {
  const state = {
    isEditMode: false,
    resumeData: {
      languages: [
        { name: 'Английский', level: 70 },
        { name: 'Немецкий', level: 40 }
      ],
      personalInfo: {
        name: 'Karthik SR',
        position: 'UX/UI Designer',
        greeting: 'Hello I\'m'
      },
      experiences: [],
      education: [],
      tools: [],
      interests: [],
      contact: {
        message: 'Let\'s chat! I\'m ready to work on exciting projects',
        email: 'srkarthik.designscape@gmail.com'
      }
    }
  };

  const elements = {
    editBtn: document.getElementById('editBtn'),
    downloadBtn: document.getElementById('downloadBtn'),
    languageList: document.getElementById('languageList'),
    cvContainer: document.querySelector('.cvv_box'),
    greetingElement: document.querySelector('.info-greeting h2'),
    nameElement: document.querySelector('.info-details h1'),
    positionElement: document.querySelector('.info-details p'),
    experienceElements: document.querySelectorAll('.experience-section'),
    educationElements: document.querySelectorAll('.education-card'),
    toolsElements: document.querySelectorAll('.tools li'),
    interestElements: document.querySelectorAll('.interest'),
    contactMessage: document.querySelector('.contact h2'),
    contactEmail: document.querySelector('.contact-email')
  };

  function init() {
    setupEventListeners();
    loadFromLocalStorage();
    renderResume();
  }

  function setupEventListeners() {
    elements.editBtn.addEventListener('click', toggleEditMode);
    elements.downloadBtn.addEventListener('click', downloadAsPDF);
    elements.languageList.addEventListener('input', handleLanguageInput);
    document.addEventListener('blur', handleContentEdit, true);
  }

  function toggleEditMode() {
    state.isEditMode = !state.isEditMode;
    document.body.classList.toggle('edit-mode', state.isEditMode);
    elements.editBtn.textContent = state.isEditMode ? 'Сохранить' : 'Редактировать';
    
    const sliders = document.querySelectorAll('.language-level-slider');
    const levels = document.querySelectorAll('.language-level');
    
    sliders.forEach(slider => slider.style.display = state.isEditMode ? 'block' : 'none');
    levels.forEach(level => level.style.display = state.isEditMode ? 'none' : 'block');
    
    toggleContentEditable(state.isEditMode);
    
    if (!state.isEditMode) saveToLocalStorage();
  }

  function handleLanguageInput(e) {
    if (!state.isEditMode) return;
    const target = e.target;
    
    if (target.classList.contains('language-level-slider')) {
      const listItem = target.closest('.language-item');
      const index = Array.from(listItem.parentNode.children).indexOf(listItem);
      if (index >= 0) {
        state.resumeData.languages[index].level = target.value;
        listItem.querySelector('.language-level').style.setProperty('--level', `${target.value}%`);
      }
    }
  }

  function handleContentEdit(e) {
    if (!state.isEditMode) return;
    const target = e.target;
    
    if (target.classList.contains('language-name')) {
      const listItem = target.closest('.language-item');
      const index = Array.from(listItem.parentNode.children).indexOf(listItem);
      if (index >= 0) state.resumeData.languages[index].name = target.textContent;
    }
  }

  function toggleContentEditable(enable) {
    elements.greetingElement.contentEditable = enable;
    elements.nameElement.contentEditable = enable;
    elements.positionElement.contentEditable = enable;
    
    elements.experienceElements.forEach(section => {
      section.querySelector('.job-details h3').contentEditable = enable;
      section.querySelector('.job-details p').contentEditable = enable;
      section.querySelector('.date').contentEditable = enable;
      section.querySelectorAll('.job-description li').forEach(item => item.contentEditable = enable);
    });
    
    elements.educationElements.forEach(card => {
      card.querySelector('.title').contentEditable = enable;
      card.querySelector('.year').contentEditable = enable;
      card.querySelector('.description').contentEditable = enable;
      card.querySelector('.source, .institution').contentEditable = enable;
    });
    
    elements.toolsElements.forEach(tool => tool.contentEditable = enable);
    elements.interestElements.forEach(interest => interest.contentEditable = enable);
    elements.contactMessage.contentEditable = enable;
    elements.contactEmail.contentEditable = enable;
    
    document.querySelectorAll('.language-name').forEach(name => {
      name.contentEditable = enable;
    });
  }

  function renderResume() {
    elements.greetingElement.textContent = state.resumeData.personalInfo.greeting;
    elements.nameElement.textContent = state.resumeData.personalInfo.name;
    elements.positionElement.textContent = state.resumeData.personalInfo.position;
    renderLanguages();
    elements.contactMessage.textContent = state.resumeData.contact.message;
    elements.contactEmail.textContent = state.resumeData.contact.email;
  }

  function renderLanguages() {
    elements.languageList.innerHTML = '';
    
    state.resumeData.languages.forEach(language => {
      const languageItem = document.createElement('li');
      languageItem.className = 'language-item';
      languageItem.innerHTML = `
        <div class="language-name-container">
          <div class="language-name" contenteditable="${state.isEditMode}">
            ${language.name}
          </div>
        </div>
        <div class="language-controls">
          <div class="language-level" style="--level: ${language.level}%"></div>
          <input type="range" class="language-level-slider" min="0" max="100" value="${language.level}" style="display: none">
        </div>
      `;
      elements.languageList.appendChild(languageItem);
    });
  }

  function saveToLocalStorage() {
    updateStateFromDOM();
    localStorage.setItem('resumeData', JSON.stringify(state.resumeData));
  }

  function updateStateFromDOM() {
    state.resumeData.personalInfo.greeting = elements.greetingElement.textContent;
    state.resumeData.personalInfo.name = elements.nameElement.textContent;
    state.resumeData.personalInfo.position = elements.positionElement.textContent;
    
    state.resumeData.languages = Array.from(document.querySelectorAll('.language-item')).map(item => ({
      name: item.querySelector('.language-name').textContent,
      level: parseInt(item.querySelector('.language-level-slider').value)
    }));
  }

  function loadFromLocalStorage() {
    const savedData = localStorage.getItem('resumeData');
    if (savedData) {
      state.resumeData = JSON.parse(savedData);
      renderResume();
    }
  }

  function downloadAsPDF() {
    if (state.isEditMode) toggleEditMode();
    
    const options = {
      scale: 2,
      logging: false,
      useCORS: true
    };
    
    html2canvas(elements.cvContainer, options).then(canvas => {
      const { jsPDF } = window.jspdf;
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgData = canvas.toDataURL('image/png', 1.0);
      const imgWidth = 210;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
      pdf.save('resume.pdf');
    });
  }

  init();
});