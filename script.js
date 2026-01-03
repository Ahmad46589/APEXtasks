// // --- Global State ---
// const state = {
//     user: localStorage.getItem('apexUser') || null,
//     tasks: JSON.parse(localStorage.getItem('apexTasks')) || [],
//     timer: {
//         timeLeft: 25 * 60,
//         isActive: false,
//         mode: 'focus', // 'focus' or 'break'
//         focusDuration: 25,
//         breakDuration: 5,
//         intervalId: null,
//         isMuted: false,
//         audioCtx: null,
//         nextNoteTime: 0
//     },
//     filter: 'all',
//     calendar: {
//         currentDate: new Date()
//     }
// };

// // --- DOM Elements ---
// const elements = {
//     authOverlay: document.getElementById('auth-overlay'),
//     appContainer: document.getElementById('app-container'),
//     authForm: document.getElementById('auth-form'),
//     usernameInput: document.getElementById('username'),
//     welcomeMsg: document.getElementById('welcome-msg'),
//     logoutBtn: document.getElementById('logout-btn'),
    
//     // Clock
//     clockTime: document.getElementById('clock-time'),
//     dayName: document.getElementById('day-name'),
//     fullDate: document.getElementById('full-date'),
    
//     // Timer
//     timerDisplay: document.getElementById('timer-display'),
//     timerStatus: document.getElementById('timer-status'),
//     progressCircle: document.getElementById('progress-ring-circle'),
//     btnTimerToggle: document.getElementById('timer-toggle'),
//     btnTimerReset: document.getElementById('timer-reset'),
//     btnTimerSettings: document.getElementById('timer-settings'),
//     btnTimerMute: document.getElementById('timer-mute'),
//     settingsPanel: document.getElementById('timer-settings-panel'),
//     inputFocus: document.getElementById('focus-duration'),
//     inputBreak: document.getElementById('break-duration'),
//     btnSaveSettings: document.getElementById('save-timer-settings'),
    
//     // YouTube
//     ytInput: document.getElementById('yt-search-input'),
//     ytBtn: document.getElementById('yt-search-btn'),
//     ytResults: document.getElementById('yt-results'),
//     ytSearchContainer: document.getElementById('yt-search-container'),
//     ytPlayerContainer: document.getElementById('yt-player-container'),
//     ytPlayerIframe: document.getElementById('yt-player-iframe'),
//     ytClosePlayer: document.getElementById('yt-close-player'),
    
//     // Calendar
//     currentMonthYear: document.getElementById('current-month-year'),
//     calendarGrid: document.getElementById('calendar-grid'),
//     btnPrevMonth: document.getElementById('prev-month'),
//     btnNextMonth: document.getElementById('next-month'),

//     // Tasks
//     taskForm: document.getElementById('task-form'),
//     taskInput: document.getElementById('task-input'),
//     taskCategory: document.getElementById('task-category'),
//     taskDate: document.getElementById('task-date'),
//     taskList: document.getElementById('task-list'),
//     progressFill: document.getElementById('progress-fill'),
//     progressText: document.getElementById('progress-text'),
//     filterBtns: document.querySelectorAll('.filter-btn')
// };

// // --- Initialization ---
// document.addEventListener('DOMContentLoaded', () => {
//     checkAuth();
//     initClock();
//     initTimerEvents();
//     initYouTube();
//     initCalendar();
//     initTaskEvents();
// });

// // --- Authentication ---
// function checkAuth() {
//     if (state.user) {
//         elements.authOverlay.classList.add('hidden');
//         elements.appContainer.classList.remove('hidden');
//         elements.welcomeMsg.textContent = `Welcome, ${state.user}`;
//         renderTasks();
//     } else {
//         elements.authOverlay.classList.remove('hidden');
//         elements.appContainer.classList.add('hidden');
//     }
// }

// elements.authForm.addEventListener('submit', (e) => {
//     e.preventDefault();
//     const username = elements.usernameInput.value.trim();
//     if (username) {
//         state.user = username;
//         localStorage.setItem('apexUser', username);
//         checkAuth();
//     }
// });

// elements.logoutBtn.addEventListener('click', () => {
//     if (confirm('Are you sure you want to logout?')) {
//         localStorage.removeItem('apexUser');
//         state.user = null;
//         location.reload();
//     }
// });

// // --- Clock Section ---
// function initClock() {
//     const updateClock = () => {
//         const now = new Date();
//         let hours = now.getHours();
//         const minutes = String(now.getMinutes()).padStart(2, '0');
//         const ampm = hours >= 12 ? 'PM' : 'AM';
        
//         hours = hours % 12;
//         hours = hours ? hours : 12; // 0 should be 12
        
//         elements.clockTime.innerHTML = `${String(hours).padStart(2, '0')}:${minutes}<span class="ampm">${ampm}</span>`;
        
//         const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
//         const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
        
//         elements.dayName.textContent = days[now.getDay()];
//         elements.fullDate.textContent = `${months[now.getMonth()]} ${now.getDate()}, ${now.getFullYear()}`;
//     };
    
//     updateClock();
//     setInterval(updateClock, 1000);
// }

// // --- Pomodoro Timer & Audio ---
// function initTimerEvents() {
//     // Circle Props
//     const radius = elements.progressCircle.r.baseVal.value;
//     const circumference = radius * 2 * Math.PI;
//     elements.progressCircle.style.strokeDasharray = `${circumference} ${circumference}`;
//     elements.progressCircle.style.strokeDashoffset = 0;

//     // Web Audio API Context
//     function playTickSound() {
//         if (state.timer.isMuted) return;
        
//         if (!state.timer.audioCtx) {
//             state.timer.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
//         }

//         const ctx = state.timer.audioCtx;
//         const osc = ctx.createOscillator();
//         const gainNode = ctx.createGain();

//         osc.connect(gainNode);
//         gainNode.connect(ctx.destination);

//         // Create a very short, high-pitched "tick" sound
//         osc.type = 'sine';
//         osc.frequency.setValueAtTime(800, ctx.currentTime);
//         osc.frequency.exponentialRampToValueAtTime(1200, ctx.currentTime + 0.05);

//         gainNode.gain.setValueAtTime(0.05, ctx.currentTime); // Low volume
//         gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);

//         osc.start();
//         osc.stop(ctx.currentTime + 0.05);
//     }

//     function setProgress(percent) {
//         const offset = circumference - (percent / 100) * circumference;
//         elements.progressCircle.style.strokeDashoffset = offset;
//     }

//     function updateTimerDisplay() {
//         const minutes = Math.floor(state.timer.timeLeft / 60);
//         const seconds = state.timer.timeLeft % 60;
//         elements.timerDisplay.textContent = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
        
//         const totalTime = state.timer.mode === 'focus' ? state.timer.focusDuration * 60 : state.timer.breakDuration * 60;
//         const percent = ((totalTime - state.timer.timeLeft) / totalTime) * 100;
//         setProgress(percent);
//     }

//     function toggleTimer() {
//         if (state.timer.isActive) {
//             clearInterval(state.timer.intervalId);
//             state.timer.isActive = false;
//             elements.btnTimerToggle.innerHTML = '<i class="fa-solid fa-play"></i>';
//         } else {
//             // Resume Audio Context if suspended (browser policy)
//             if (state.timer.audioCtx && state.timer.audioCtx.state === 'suspended') {
//                 state.timer.audioCtx.resume();
//             }

//             state.timer.isActive = true;
//             elements.btnTimerToggle.innerHTML = '<i class="fa-solid fa-pause"></i>';
//             state.timer.intervalId = setInterval(() => {
//                 if (state.timer.timeLeft > 0) {
//                     state.timer.timeLeft--;
//                     updateTimerDisplay();
//                     // Play tick sound every second if active and focused
//                     if (state.timer.mode === 'focus') playTickSound();
//                 } else {
//                     switchMode();
//                 }
//             }, 1000);
//         }
//     }

//     function switchMode() {
//         clearInterval(state.timer.intervalId);
//         state.timer.isActive = false;
//         elements.btnTimerToggle.innerHTML = '<i class="fa-solid fa-play"></i>';
        
//         if (state.timer.mode === 'focus') {
//             state.timer.mode = 'break';
//             state.timer.timeLeft = state.timer.breakDuration * 60;
//             elements.timerStatus.textContent = 'Break Time';
//             elements.timerStatus.style.borderColor = 'var(--success)';
//             elements.timerStatus.style.color = 'var(--success)';
//         } else {
//             state.timer.mode = 'focus';
//             state.timer.timeLeft = state.timer.focusDuration * 60;
//             elements.timerStatus.textContent = 'Focus';
//             elements.timerStatus.style.borderColor = 'var(--accent-color)';
//             elements.timerStatus.style.color = 'var(--accent-color)';
//         }
//         updateTimerDisplay();
//     }

//     function resetTimer() {
//         clearInterval(state.timer.intervalId);
//         state.timer.isActive = false;
//         elements.btnTimerToggle.innerHTML = '<i class="fa-solid fa-play"></i>';
//         state.timer.mode = 'focus';
//         state.timer.timeLeft = state.timer.focusDuration * 60;
//         elements.timerStatus.textContent = 'Focus';
//         updateTimerDisplay();
//         setProgress(0);
//     }

//     elements.btnTimerToggle.addEventListener('click', toggleTimer);
//     elements.btnTimerReset.addEventListener('click', resetTimer);
    
//     // Mute Button Logic
//     elements.btnTimerMute.addEventListener('click', () => {
//         state.timer.isMuted = !state.timer.isMuted;
//         if (state.timer.isMuted) {
//             elements.btnTimerMute.innerHTML = '<i class="fa-solid fa-volume-xmark"></i>';
//             elements.btnTimerMute.style.color = 'var(--text-secondary)';
//         } else {
//             elements.btnTimerMute.innerHTML = '<i class="fa-solid fa-volume-high"></i>';
//             elements.btnTimerMute.style.color = 'var(--text-primary)';
//         }
//     });

//     elements.btnTimerSettings.addEventListener('click', () => {
//         elements.settingsPanel.classList.toggle('hidden');
//     });

//     elements.btnSaveSettings.addEventListener('click', () => {
//         const newFocus = parseInt(elements.inputFocus.value);
//         const newBreak = parseInt(elements.inputBreak.value);
        
//         if (newFocus > 0 && newBreak > 0) {
//             state.timer.focusDuration = newFocus;
//             state.timer.breakDuration = newBreak;
//             resetTimer();
//             elements.settingsPanel.classList.add('hidden');
//         }
//     });

//     // Init display
//     resetTimer();
// }

// // --- YouTube Search (Dynamic via Invidious API) ---
// function initYouTube() {
//     // API Configuration
//     // Using a list of public Invidious instances for failover
//     const API_INSTANCES = [
//         'https://inv.tux.pizza/api/v1',
//         'https://vid.puffyan.us/api/v1',
//         'https://invidious.projectsegfau.lt/api/v1'
//     ];
    
//     elements.ytBtn.addEventListener('click', performSearch);
//     elements.ytInput.addEventListener('keypress', (e) => {
//         if (e.key === 'Enter') performSearch();
//     });

//     elements.ytClosePlayer.addEventListener('click', () => {
//         elements.ytPlayerContainer.classList.add('hidden');
//         elements.ytSearchContainer.classList.remove('hidden');
//         elements.ytResults.classList.remove('hidden');
//         elements.ytPlayerIframe.src = ''; // Stop video playback
//     });

//     /**
//      * Tries to fetch data from instances in order until one succeeds
//      */
//     async function fetchFromApi(endpoint) {
//         for (const base of API_INSTANCES) {
//             try {
//                 const controller = new AbortController();
//                 const timeoutId = setTimeout(() => controller.abort(), 5000); // 5s timeout
                
//                 const response = await fetch(`${base}${endpoint}`, {
//                     signal: controller.signal
//                 });
//                 clearTimeout(timeoutId);

//                 if (response.ok) {
//                     return await response.json();
//                 }
//             } catch (err) {
//                 console.warn(`Failed to fetch from ${base}:`, err);
//                 continue; // Try next instance
//             }
//         }
//         throw new Error('All API instances failed');
//     }

//     /**
//      * HTML Escape helper to prevent XSS
//      */
//     function escapeHtml(text) {
//         const div = document.createElement('div');
//         div.textContent = text;
//         return div.innerHTML;
//     }

//     async function performSearch() {
//         const query = elements.ytInput.value.trim();
//         if (!query) return;

//         // UI Loading State
//         elements.ytResults.innerHTML = `
//             <div style="text-align: center; color: var(--text-secondary); padding: 2rem;">
//                 <i class="fa-solid fa-spinner fa-spin" style="font-size: 2rem; margin-bottom: 1rem;"></i>
//                 <p>Searching YouTube...</p>
//             </div>
//         `;
        
//         try {
//             // Fetch from Invidious API (Video type only)
//             const data = await fetchFromApi(`/search?q=${encodeURIComponent(query)}&type=video`);
            
//             // Filter and slice results
//             const videos = data
//                 .filter(item => item.type === 'video')
//                 .slice(0, 12);

//             displayResults(videos);

//         } catch (error) {
//             console.error('Search Error:', error);
//             elements.ytResults.innerHTML = `
//                 <div style="text-align: center; color: var(--danger); padding: 2rem;">
//                     <i class="fa-solid fa-triangle-exclamation" style="font-size: 2rem; margin-bottom: 1rem;"></i>
//                     <p>Unable to load results. Please check your connection or try again later.</p>
//                 </div>
//             `;
//         }
//     }

//     function displayResults(videos) {
//         elements.ytResults.innerHTML = '';
        
//         if (!videos || videos.length === 0) {
//             elements.ytResults.innerHTML = `
//                 <div style="text-align: center; color: var(--text-secondary); padding: 2rem;">
//                     <p>No videos found for this search.</p>
//                 </div>
//             `;
//             return;
//         }

//         videos.forEach(video => {
//             const card = document.createElement('div');
//             card.className = 'yt-card';
            
//             // Construct thumbnail URL safely
//             const thumbUrl = `https://img.youtube.com/vi/${video.videoId}/mqdefault.jpg`;
//             const safeTitle = escapeHtml(video.title);
            
//             card.innerHTML = `
//                 <img src="${thumbUrl}" class="yt-thumb" alt="${safeTitle}" loading="lazy">
//                 <div class="yt-info">
//                     <div class="yt-title">${safeTitle}</div>
//                 </div>
//             `;
            
//             card.addEventListener('click', () => {
//                 playVideo(video.videoId);
//             });
            
//             elements.ytResults.appendChild(card);
//         });
//     }

//     function playVideo(videoId) {
//         elements.ytSearchContainer.classList.add('hidden');
//         elements.ytResults.classList.add('hidden');
//         elements.ytPlayerContainer.classList.remove('hidden');
//         // Autoplay enabled for better UX
//         elements.ytPlayerIframe.src = `https://www.youtube.com/embed/${videoId}?autoplay=1`;
//     }
// }

// // --- Calendar Section ---
// function initCalendar() {
//     function renderCalendar() {
//         const date = state.calendar.currentDate;
//         const year = date.getFullYear();
//         const month = date.getMonth();

//         // Update Header
//         const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
//         elements.currentMonthYear.textContent = `${monthNames[month]} ${year}`;

//         // Get first day and days in month
//         const firstDay = new Date(year, month, 1).getDay();
//         const daysInMonth = new Date(year, month + 1, 0).getDate();

//         elements.calendarGrid.innerHTML = '';

//         // Empty cells for days before first day
//         for (let i = 0; i < firstDay; i++) {
//             const div = document.createElement('div');
//             div.className = 'calendar-day empty';
//             elements.calendarGrid.appendChild(div);
//         }

//         // Days
//         const today = new Date();
//         for (let i = 1; i <= daysInMonth; i++) {
//             const div = document.createElement('div');
//             div.className = 'calendar-day';
//             div.textContent = i;
            
//             if (i === today.getDate() && month === today.getMonth() && year === today.getFullYear()) {
//                 div.classList.add('today');
//             }
            
//             elements.calendarGrid.appendChild(div);
//         }
//     }

//     elements.btnPrevMonth.addEventListener('click', () => {
//         state.calendar.currentDate.setMonth(state.calendar.currentDate.getMonth() - 1);
//         renderCalendar();
//     });

//     elements.btnNextMonth.addEventListener('click', () => {
//         state.calendar.currentDate.setMonth(state.calendar.currentDate.getMonth() + 1);
//         renderCalendar();
//     });

//     renderCalendar();
// }

// // --- Task Management ---
// function initTaskEvents() {
//     elements.taskForm.addEventListener('submit', (e) => {
//         e.preventDefault();
//         const text = elements.taskInput.value.trim();
//         const category = elements.taskCategory.value;
//         const date = elements.taskDate.value;
        
//         if (text) {
//             const newTask = {
//                 id: Date.now(),
//                 text,
//                 category,
//                 date: date || 'No Date',
//                 completed: false
//             };
            
//             state.tasks.push(newTask);
//             saveTasks();
//             renderTasks();
//             elements.taskInput.value = '';
//         }
//     });

//     elements.filterBtns.forEach(btn => {
//         btn.addEventListener('click', () => {
//             elements.filterBtns.forEach(b => b.classList.remove('active'));
//             btn.classList.add('active');
//             state.filter = btn.dataset.filter;
//             renderTasks();
//         });
//     });
// }

// function saveTasks() {
//     localStorage.setItem('apexTasks', JSON.stringify(state.tasks));
//     updateProgress();
// }

// function deleteTask(id) {
//     const taskElement = document.getElementById(`task-${id}`);
//     if (taskElement) {
//         taskElement.classList.add('slide-out');
//         taskElement.addEventListener('animationend', () => {
//             state.tasks = state.tasks.filter(t => t.id !== id);
//             saveTasks();
//             renderTasks();
//         });
//     }
// }

// function toggleTask(id) {
//     const task = state.tasks.find(t => t.id === id);
//     if (task) {
//         task.completed = !task.completed;
//         saveTasks();
//         renderTasks();
//     }
// }

// function renderTasks() {
//     elements.taskList.innerHTML = '';
    
//     const filteredTasks = state.tasks.filter(task => {
//         if (state.filter === 'pending') return !task.completed;
//         if (state.filter === 'completed') return task.completed;
//         return true;
//     });

//     filteredTasks.forEach(task => {
//         const li = document.createElement('li');
//         li.className = `task-item priority-${task.category} ${task.completed ? 'completed' : ''}`;
//         li.id = `task-${task.id}`;
        
//         li.innerHTML = `
//             <input type="checkbox" class="task-check" ${task.completed ? 'checked' : ''} onchange="toggleTask(${task.id})">
//             <div class="task-content">
//                 <span class="task-text">${task.text}</span>
//                 <div class="task-meta">
//                     <span><i class="fa-regular fa-calendar"></i> ${task.date}</span>
//                     <span style="text-transform: capitalize;">${task.category}</span>
//                 </div>
//             </div>
//             <div class="task-actions">
//                 <button class="btn-delete" onclick="deleteTask(${task.id})"><i class="fa-solid fa-trash"></i></button>
//             </div>
//         `;
        
//         elements.taskList.appendChild(li);
//     });
    
//     updateProgress();
// }

// function updateProgress() {
//     const total = state.tasks.length;
//     if (total === 0) {
//         elements.progressFill.style.width = '0%';
//         elements.progressText.textContent = '0%';
//         return;
//     }
//     const completed = state.tasks.filter(t => t.completed).length;
//     const percent = Math.round((completed / total) * 100);
    
//     elements.progressFill.style.width = `${percent}%`;
//     elements.progressText.textContent = `${percent}%`;
// }

// // Expose functions globally for inline HTML events
// window.deleteTask = deleteTask;
// window.toggleTask = toggleTask;




// --- Global State ---
const state = {
    user: localStorage.getItem('apexUser') || null,
    tasks: JSON.parse(localStorage.getItem('apexTasks')) || [],
    timer: {
        timeLeft: 25 * 60,
        isActive: false,
        mode: 'focus', // 'focus' or 'break'
        focusDuration: 25,
        breakDuration: 5,
        intervalId: null,
        isMuted: false,
        audioCtx: null,
        nextNoteTime: 0
    },
    filter: 'all',
    calendar: {
        currentDate: new Date()
    }
};

// --- DOM Elements ---
const elements = {
    authOverlay: document.getElementById('auth-overlay'),
    appContainer: document.getElementById('app-container'),
    authForm: document.getElementById('auth-form'),
    usernameInput: document.getElementById('username'),
    welcomeMsg: document.getElementById('welcome-msg'),
    logoutBtn: document.getElementById('logout-btn'),
    
    // Clock
    clockTime: document.getElementById('clock-time'),
    dayName: document.getElementById('day-name'),
    fullDate: document.getElementById('full-date'),
    
    // Timer
    timerDisplay: document.getElementById('timer-display'),
    timerStatus: document.getElementById('timer-status'),
    progressCircle: document.getElementById('progress-ring-circle'),
    btnTimerToggle: document.getElementById('timer-toggle'),
    btnTimerReset: document.getElementById('timer-reset'),
    btnTimerSettings: document.getElementById('timer-settings'),
    btnTimerMute: document.getElementById('timer-mute'),
    settingsPanel: document.getElementById('timer-settings-panel'),
    inputFocus: document.getElementById('focus-duration'),
    inputBreak: document.getElementById('break-duration'),
    btnSaveSettings: document.getElementById('save-timer-settings'),
    
    // YouTube
    ytInput: document.getElementById('yt-search-input'),
    ytBtn: document.getElementById('yt-search-btn'),
    ytResults: document.getElementById('yt-results'),
    ytSearchContainer: document.getElementById('yt-search-container'),
    ytPlayerContainer: document.getElementById('yt-player-container'),
    ytPlayerIframe: document.getElementById('yt-player-iframe'),
    ytClosePlayer: document.getElementById('yt-close-player'),
    
    // Calendar
    currentMonthYear: document.getElementById('current-month-year'),
    calendarGrid: document.getElementById('calendar-grid'),
    btnPrevMonth: document.getElementById('prev-month'),
    btnNextMonth: document.getElementById('next-month'),

    // Tasks
    taskForm: document.getElementById('task-form'),
    taskInput: document.getElementById('task-input'),
    taskCategory: document.getElementById('task-category'),
    taskDate: document.getElementById('task-date'),
    taskList: document.getElementById('task-list'),
    progressFill: document.getElementById('progress-fill'),
    progressText: document.getElementById('progress-text'),
    filterBtns: document.querySelectorAll('.filter-btn')
};

// --- Initialization ---
document.addEventListener('DOMContentLoaded', () => {
    checkAuth();
    initClock();
    initTimerEvents();
    initYouTube();
    initCalendar();
    initTaskEvents();
});

// --- Authentication ---
function checkAuth() {
    if (state.user) {
        elements.authOverlay.classList.add('hidden');
        elements.appContainer.classList.remove('hidden');
        elements.welcomeMsg.textContent = `Welcome, ${state.user}`;
        renderTasks();
    } else {
        elements.authOverlay.classList.remove('hidden');
        elements.appContainer.classList.add('hidden');
    }
}

elements.authForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const username = elements.usernameInput.value.trim();
    if (username) {
        state.user = username;
        localStorage.setItem('apexUser', username);
        checkAuth();
    }
});

elements.logoutBtn.addEventListener('click', () => {
    if (confirm('Are you sure you want to logout?')) {
        localStorage.removeItem('apexUser');
        state.user = null;
        location.reload();
    }
});

// --- Clock Section ---
function initClock() {
    const updateClock = () => {
        const now = new Date();
        let hours = now.getHours();
        const minutes = String(now.getMinutes()).padStart(2, '0');
        const ampm = hours >= 12 ? 'PM' : 'AM';
        
        hours = hours % 12;
        hours = hours ? hours : 12; // 0 should be 12
        
        elements.clockTime.innerHTML = `${String(hours).padStart(2, '0')}:${minutes}<span class="ampm">${ampm}</span>`;
        
        const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
        
        elements.dayName.textContent = days[now.getDay()];
        elements.fullDate.textContent = `${months[now.getMonth()]} ${now.getDate()}, ${now.getFullYear()}`;
    };
    
    updateClock();
    setInterval(updateClock, 1000);
}

// --- Pomodoro Timer & Audio ---
function initTimerEvents() {
    const radius = elements.progressCircle.r.baseVal.value;
    const circumference = radius * 2 * Math.PI;
    elements.progressCircle.style.strokeDasharray = `${circumference} ${circumference}`;
    elements.progressCircle.style.strokeDashoffset = 0;

    function playTickSound() {
        if (state.timer.isMuted) return;
        
        if (!state.timer.audioCtx) {
            state.timer.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        }

        const ctx = state.timer.audioCtx;
        const osc = ctx.createOscillator();
        const gainNode = ctx.createGain();

        osc.connect(gainNode);
        gainNode.connect(ctx.destination);

        osc.type = 'sine';
        osc.frequency.setValueAtTime(800, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(1200, ctx.currentTime + 0.05);

        gainNode.gain.setValueAtTime(0.05, ctx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);

        osc.start();
        osc.stop(ctx.currentTime + 0.05);
    }

    function setProgress(percent) {
        const offset = circumference - (percent / 100) * circumference;
        elements.progressCircle.style.strokeDashoffset = offset;
    }

    function updateTimerDisplay() {
        const minutes = Math.floor(state.timer.timeLeft / 60);
        const seconds = state.timer.timeLeft % 60;
        elements.timerDisplay.textContent = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
        
        const totalTime = state.timer.mode === 'focus' ? state.timer.focusDuration * 60 : state.timer.breakDuration * 60;
        const percent = ((totalTime - state.timer.timeLeft) / totalTime) * 100;
        setProgress(percent);
    }

    function toggleTimer() {
        if (state.timer.isActive) {
            clearInterval(state.timer.intervalId);
            state.timer.isActive = false;
            elements.btnTimerToggle.innerHTML = '<i class="fa-solid fa-play"></i>';
        } else {
            if (state.timer.audioCtx && state.timer.audioCtx.state === 'suspended') {
                state.timer.audioCtx.resume();
            }

            state.timer.isActive = true;
            elements.btnTimerToggle.innerHTML = '<i class="fa-solid fa-pause"></i>';
            state.timer.intervalId = setInterval(() => {
                if (state.timer.timeLeft > 0) {
                    state.timer.timeLeft--;
                    updateTimerDisplay();
                    if (state.timer.mode === 'focus') playTickSound();
                } else {
                    switchMode();
                }
            }, 1000);
        }
    }

    function switchMode() {
        clearInterval(state.timer.intervalId);
        state.timer.isActive = false;
        elements.btnTimerToggle.innerHTML = '<i class="fa-solid fa-play"></i>';
        
        if (state.timer.mode === 'focus') {
            state.timer.mode = 'break';
            state.timer.timeLeft = state.timer.breakDuration * 60;
            elements.timerStatus.textContent = 'Break Time';
            elements.timerStatus.style.borderColor = 'var(--success)';
            elements.timerStatus.style.color = 'var(--success)';
        } else {
            state.timer.mode = 'focus';
            state.timer.timeLeft = state.timer.focusDuration * 60;
            elements.timerStatus.textContent = 'Focus';
            elements.timerStatus.style.borderColor = 'var(--accent-color)';
            elements.timerStatus.style.color = 'var(--accent-color)';
        }
        updateTimerDisplay();
    }

    function resetTimer() {
        clearInterval(state.timer.intervalId);
        state.timer.isActive = false;
        elements.btnTimerToggle.innerHTML = '<i class="fa-solid fa-play"></i>';
        state.timer.mode = 'focus';
        state.timer.timeLeft = state.timer.focusDuration * 60;
        elements.timerStatus.textContent = 'Focus';
        updateTimerDisplay();
        setProgress(0);
    }

    elements.btnTimerToggle.addEventListener('click', toggleTimer);
    elements.btnTimerReset.addEventListener('click', resetTimer);

    elements.btnTimerMute.addEventListener('click', () => {
        state.timer.isMuted = !state.timer.isMuted;
        if (state.timer.isMuted) {
            elements.btnTimerMute.innerHTML = '<i class="fa-solid fa-volume-xmark"></i>';
            elements.btnTimerMute.style.color = 'var(--text-secondary)';
        } else {
            elements.btnTimerMute.innerHTML = '<i class="fa-solid fa-volume-high"></i>';
            elements.btnTimerMute.style.color = 'var(--text-primary)';
        }
    });

    elements.btnTimerSettings.addEventListener('click', () => {
        elements.settingsPanel.classList.toggle('hidden');
    });

    elements.btnSaveSettings.addEventListener('click', () => {
        const newFocus = parseInt(elements.inputFocus.value);
        const newBreak = parseInt(elements.inputBreak.value);
        if (newFocus > 0 && newBreak > 0) {
            state.timer.focusDuration = newFocus;
            state.timer.breakDuration = newBreak;
            resetTimer();
            elements.settingsPanel.classList.add('hidden');
        }
    });

    resetTimer();
}

// --- YouTube Search (YouTube Data API v3) ---
// --- YouTube Search (YouTube Data API v3) ---
function initYouTube() {
    const API_KEY = '...';
    const MAX_RESULTS = 12;

    elements.ytBtn.addEventListener('click', performSearch);
    elements.ytInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') performSearch();
    });

    elements.ytClosePlayer.addEventListener('click', () => {
        elements.ytPlayerContainer.classList.add('hidden');
        elements.ytSearchContainer.classList.remove('hidden');
        elements.ytResults.classList.remove('hidden');
        elements.ytPlayerIframe.src = ''; // Stop video playback
    });

    async function performSearch() {
        const query = elements.ytInput.value.trim();
        if (!query) return;

        elements.ytResults.innerHTML = `
            <div style="text-align: center; color: var(--text-secondary); padding: 2rem;">
                <i class="fa-solid fa-spinner fa-spin" style="font-size: 2rem; margin-bottom: 1rem;"></i>
                <p>Searching YouTube...</p>
            </div>
        `;

        try {
            const response = await fetch(
                `https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&maxResults=${MAX_RESULTS}&q=${encodeURIComponent(query)}&key=${API_KEY}`
            );

            if (!response.ok) throw new Error('Failed to fetch');

            const data = await response.json();
            displayResults(data.items);
        } catch (error) {
            console.error('Search Error:', error);
            elements.ytResults.innerHTML = `
                <div style="text-align: center; color: var(--danger); padding: 2rem;">
                    <i class="fa-solid fa-triangle-exclamation" style="font-size: 2rem; margin-bottom: 1rem;"></i>
                    <p>Unable to load results. Please check your connection or try again later.</p>
                </div>
            `;
        }
    }

    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    function displayResults(videos) {
        elements.ytResults.innerHTML = '';

        if (!videos || videos.length === 0) {
            elements.ytResults.innerHTML = `
                <div style="text-align: center; color: var(--text-secondary); padding: 2rem;">
                    <p>No videos found for this search.</p>
                </div>
            `;
            return;
        }

        videos.forEach(video => {
            const videoId = video.id.videoId;
            const title = escapeHtml(video.snippet.title);
            const thumbUrl = video.snippet.thumbnails.medium.url;

            const card = document.createElement('div');
            card.className = 'yt-card';
            card.innerHTML = `
                <img src="${thumbUrl}" class="yt-thumb" alt="${title}" loading="lazy">
                <div class="yt-info">
                    <div class="yt-title">${title}</div>
                </div>
            `;
            card.addEventListener('click', () => {
                playVideo(videoId);
            });
            elements.ytResults.appendChild(card);
        });
    }

    function playVideo(videoId) {
        elements.ytSearchContainer.classList.add('hidden');
        elements.ytResults.classList.add('hidden');
        elements.ytPlayerContainer.classList.remove('hidden');
        elements.ytPlayerIframe.src = `https://www.youtube.com/embed/${videoId}?autoplay=1`;
    }
}


// --- Calendar Section ---
function initCalendar() {
    function renderCalendar() {
        const date = state.calendar.currentDate;
        const year = date.getFullYear();
        const month = date.getMonth();

        const monthNames = ["January","February","March","April","May","June","July","August","September","October","November","December"];
        elements.currentMonthYear.textContent = `${monthNames[month]} ${year}`;

        const firstDay = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();

        elements.calendarGrid.innerHTML = '';

        for (let i = 0; i < firstDay; i++) {
            const div = document.createElement('div');
            div.className = 'calendar-day empty';
            elements.calendarGrid.appendChild(div);
        }

        const today = new Date();
        for (let i = 1; i <= daysInMonth; i++) {
            const div = document.createElement('div');
            div.className = 'calendar-day';
            div.textContent = i;
            if (i === today.getDate() && month === today.getMonth() && year === today.getFullYear()) {
                div.classList.add('today');
            }
            elements.calendarGrid.appendChild(div);
        }
    }

    elements.btnPrevMonth.addEventListener('click', () => {
        state.calendar.currentDate.setMonth(state.calendar.currentDate.getMonth() - 1);
        renderCalendar();
    });

    elements.btnNextMonth.addEventListener('click', () => {
        state.calendar.currentDate.setMonth(state.calendar.currentDate.getMonth() + 1);
        renderCalendar();
    });

    renderCalendar();
}

// --- Task Management ---
function initTaskEvents() {
    elements.taskForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const text = elements.taskInput.value.trim();
        const category = elements.taskCategory.value;
        const date = elements.taskDate.value;
        
        if (text) {
            const newTask = {
                id: Date.now(),
                text,
                category,
                date: date || 'No Date',
                completed: false
            };
            
            state.tasks.push(newTask);
            saveTasks();
            renderTasks();
            elements.taskInput.value = '';
        }
    });

    elements.filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            elements.filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            state.filter = btn.dataset.filter;
            renderTasks();
        });
    });
}

function saveTasks() {
    localStorage.setItem('apexTasks', JSON.stringify(state.tasks));
    updateProgress();
}

function deleteTask(id) {
    const taskElement = document.getElementById(`task-${id}`);
    if (taskElement) {
        taskElement.classList.add('slide-out');
        taskElement.addEventListener('animationend', () => {
            state.tasks = state.tasks.filter(t => t.id !== id);
            saveTasks();
            renderTasks();
        });
    }
}

function toggleTask(id) {
    const task = state.tasks.find(t => t.id === id);
    if (task) {
        task.completed = !task.completed;
        saveTasks();
        renderTasks();
    }
}

function renderTasks() {
    elements.taskList.innerHTML = '';
    
    const filteredTasks = state.tasks.filter(task => {
        if (state.filter === 'pending') return !task.completed;
        if (state.filter === 'completed') return task.completed;
        return true;
    });

    filteredTasks.forEach(task => {
        const li = document.createElement('li');
        li.className = `task-item priority-${task.category} ${task.completed ? 'completed' : ''}`;
        li.id = `task-${task.id}`;
        
        li.innerHTML = `
            <input type="checkbox" class="task-check" ${task.completed ? 'checked' : ''} onchange="toggleTask(${task.id})">
            <div class="task-content">
                <span class="task-text">${task.text}</span>
                <div class="task-meta">
                    <span><i class="fa-regular fa-calendar"></i> ${task.date}</span>
                    <span style="text-transform: capitalize;">${task.category}</span>
                </div>
            </div>
            <div class="task-actions">
                <button class="btn-delete" onclick="deleteTask(${task.id})"><i class="fa-solid fa-trash"></i></button>
            </div>
        `;
        
        elements.taskList.appendChild(li);
    });
    
    updateProgress();
}

function updateProgress() {
    const total = state.tasks.length;
    if (total === 0) {
        elements.progressFill.style.width = '0%';
        elements.progressText.textContent = '0%';
        return;
    }
    const completed = state.tasks.filter(t => t.completed).length;
    const percent = Math.round((completed / total) * 100);
    
    elements.progressFill.style.width = `${percent}%`;
    elements.progressText.textContent = `${percent}%`;
}

// Expose functions globally for inline HTML events
window.deleteTask = deleteTask;
window.toggleTask = toggleTask;
