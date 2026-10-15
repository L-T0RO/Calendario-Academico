
let semesters = {};
let exams = [];

let currentSemester = 1;
let selectedSubject = "all";
let currentDate = new Date();

let activeMode = localStorage.getItem('activeMode') || 'director';

const colorsPalette = [
    "#4F46E5", "#0891B2", "#16A34A", "#EA580C", 
    "#7C3AED", "#0284C7", "#059669", "#DC2626", 
    "#9333EA", "#2563EB", "#0D9488", "#D97706",
    "#DB2777", "#CA8A04", "#2c02fb"
];

function parseJwt(token) {
    try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));
        return JSON.parse(jsonPayload);
    } catch (e) {
        return null;
    }
}

document.addEventListener("DOMContentLoaded", async () => {
    checkAuthStatus();
    await loadDataDesdeAPI();
});

function checkAuthStatus() {
    const token = localStorage.getItem('token');
    
    let roles = [];
    const rolesGuardados = localStorage.getItem('roles');
    if (rolesGuardados) {
        try { roles = JSON.parse(rolesGuardados); } catch(e) {}
    } else if (token) {
        const payload = parseJwt(token);
        if (payload && payload.roles) roles = payload.roles;
    }
    
    const loginBtn = document.getElementById('loginBtn');
    const addExamBtn = document.getElementById('addExamBtn');
    const logoutBtn = document.getElementById('logoutBtn');
    const toggleRoleBtn = document.getElementById('toggleRoleBtn');
    
    const esDirector = Array.isArray(roles) && roles.includes('director');

    if (token) {
        if (loginBtn) loginBtn.classList.add('hidden');
        if (logoutBtn) logoutBtn.classList.remove('hidden');

        if (esDirector) {
            // Mostrar botón para alternar de rol
            if (toggleRoleBtn) {
                toggleRoleBtn.classList.remove('hidden');
                toggleRoleBtn.textContent = (activeMode === 'profesor')
                    ? "Cambiar a Modo Director"
                    : "Cambiar a Modo Profesor";
            }

            if (activeMode === 'profesor') {
                if (addExamBtn) addExamBtn.classList.remove('hidden');
            } else {
                if (addExamBtn) addExamBtn.classList.add('hidden');
            }
        } else {
            if (toggleRoleBtn) toggleRoleBtn.classList.add('hidden');
            if (addExamBtn) addExamBtn.classList.remove('hidden');
        }
    } else {
        if (loginBtn) loginBtn.classList.remove('hidden');
        if (addExamBtn) addExamBtn.classList.add('hidden');
        if (logoutBtn) logoutBtn.classList.add('hidden');
        if (toggleRoleBtn) toggleRoleBtn.classList.add('hidden');
    }
    
    renderExamList();
}

async function toggleDirectorMode() {
    activeMode = (activeMode === 'director') ? 'profesor' : 'director';
    localStorage.setItem('activeMode', activeMode);
    checkAuthStatus();
    await populateTeacherSubjects();
}

function openLoginModal() {
    const modal = document.getElementById("loginModal");
    if (modal) {
        modal.classList.add("show");
        modal.style.display = "block";
    }
}

function closeLoginModal() {
    const modal = document.getElementById("loginModal");
    if (modal) {
        modal.classList.remove("show");
        modal.style.display = "none";
    }
}

async function login(event) {
    event.preventDefault();
    const email = document.getElementById("loginEmail").value;
    const password = document.getElementById("loginPassword").value;

    try {
        const res = await fetch('/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });

        if (res.ok) {
            const data = await res.json();
            localStorage.setItem('token', data.token);
            
            let roles = [];
            if (data.usuario && data.usuario.roles) {
                roles = data.usuario.roles;
            } else if (data.roles) {
                roles = data.roles;
            } else {
                const payload = parseJwt(data.token);
                if (payload && payload.roles) roles = payload.roles;
            }
            localStorage.setItem('roles', JSON.stringify(roles));

            activeMode = 'director';
            localStorage.setItem('activeMode', activeMode);

            checkAuthStatus();
            closeLoginModal();
            document.getElementById("loginForm").reset();

            await loadDataDesdeAPI();
        } else {
            alert("Credenciales inválidas. Verificá tu email o contraseña.");
        }
    } catch (error) {
        console.error("Error al iniciar sesión:", error);
        alert("Ocurrió un error al intentar conectarse al servidor.");
    }
}

async function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('roles');
    localStorage.removeItem('activeMode');
    activeMode = 'director';
    checkAuthStatus();
    await loadDataDesdeAPI();
}

async function loadDataDesdeAPI() {
    try {
        // 1. Cargar Cuatrimestres y Materias (vista completa para el calendario)
        const resMaterias = await fetch('/api/cuatrimestres');
        const cuatrimestresData = await resMaterias.json();
        
        semesters = {};
        let colorIndex = 0;

        cuatrimestresData.forEach(c => {
            semesters[c.numero] = {
                id: c.id,
                name: c.numero + "° Cuatrimestre",
                subjects: (c.materias || []).map(m => {
                    const assignedColor = colorsPalette[colorIndex % colorsPalette.length];
                    colorIndex++;
                    return {
                        id: m.id,
                        name: m.nombre,
                        color: assignedColor
                    };
                })
            };
        });

        const resExamenes = await fetch('/api/examenes');
        const examenesData = await resExamenes.json();
        
        exams = examenesData.map(ex => {
            let subjectName = "Materia Desconocida";
            let semesterNum = 1;

            for (const [num, sem] of Object.entries(semesters)) {
                const materiaEncontrada = sem.subjects.find(s => s.id === ex.materia_id);
                if (materiaEncontrada) {
                    subjectName = materiaEncontrada.name;
                    semesterNum = parseInt(num);
                    break;
                }
            }

            const dateOnly = ex.fecha ? ex.fecha.split('T')[0] : "";

            return {
                id: ex.id,
                semester: semesterNum,
                subject: subjectName,
                date: dateOnly,
                time: "00:00",
                type: ex.titulo,
                units: ex.unidades_evaluadas,
                description: ""
            };
        });

        // 3. Renderizar Vistas
        loadSemester();
        await populateTeacherSubjects();
        renderCalendar();
        renderExamList();

    } catch (error) {
        console.error("Error al obtener datos:", error);
    }
}

async function populateTeacherSubjects() {
    const select = document.getElementById("examSubject");
    if (!select) return;
    select.innerHTML = "";

    const token = localStorage.getItem('token');
    if (!token) return;

    try {
        const response = await fetch('/api/profesor/materias', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) return;

        const materias = await response.json();

        if (materias.length === 0) {
            const option = document.createElement("option");
            option.value = "";
            option.textContent = "No tienes materias asignadas";
            select.appendChild(option);
            return;
        }

        if (materias.length > 3) {
            Object.entries(semesters).forEach(([semesterNumber, semester]) => {
                const group = document.createElement("optgroup");
                group.label = semester.name;

                const materiasDelCuatrimestre = semester.subjects.filter(s => 
                    materias.some(m => m.id === s.id)
                );

                materiasDelCuatrimestre.forEach(subject => {
                    const option = document.createElement("option");
                    option.value = subject.id;
                    option.textContent = subject.name;
                    group.appendChild(option);
                });

                if (materiasDelCuatrimestre.length > 0) {
                    select.appendChild(group);
                }
            });
        } else {
            // Si es un Profesor, lista únicamente las materias asignadas a él
            materias.forEach(subject => {
                const option = document.createElement("option");
                option.value = subject.id;
                option.textContent = subject.nombre || subject.name;
                select.appendChild(option);
            });
        }

    } catch (error) {
        console.error("Error al cargar materias en el selector:", error);
    }
}

function getSubject(subjectName) {
    for (const semester of Object.values(semesters)) {
        const subject = semester.subjects.find(item => item.name === subjectName);
        if (subject) return subject;
    }
    return { name: subjectName, color: "#64748B" };
}

function selectSemester(semesterNumber) {
    currentSemester = semesterNumber;
    selectedSubject = "all";

    document.querySelectorAll(".semester").forEach(btn => btn.classList.remove("active"));
    const buttons = document.querySelectorAll(".semester");
    if (buttons[semesterNumber - 1]) {
        buttons[semesterNumber - 1].classList.add("active");
    }

    loadSemester();
    renderCalendar();
    renderExamList();
}

function loadSemester() {
    const semester = semesters[currentSemester];
    if (!semester) return;

    const titleEl = document.getElementById("semesterTitle");
    if (titleEl) titleEl.textContent = semester.name;

    const subjectsContainer = document.getElementById("subjects");
    if (!subjectsContainer) return;
    subjectsContainer.innerHTML = "";

    semester.subjects.forEach((subject, index) => {
        const card = document.createElement("div");
        card.className = "subject-card";
        card.innerHTML = `
            <div class="subject-color" style="background:${subject.color}"></div>
            <div class="subject-number" style="color:${subject.color}">${index + 1}</div>
            <h3>${subject.name}</h3>
            <p>${semester.name}</p>
        `;
        subjectsContainer.appendChild(card);
    });

    updateFilter();
    renderLegend();
}

function updateFilter() {
    const filter = document.getElementById("subjectFilter");
    if (!filter) return;
    filter.innerHTML = `<option value="all">Todas las materias</option>`;

    if (semesters[currentSemester]) {
        semesters[currentSemester].subjects.forEach(subject => {
            const option = document.createElement("option");
            option.value = subject.name;
            option.textContent = subject.name;
            filter.appendChild(option);
        });
    }
    filter.value = selectedSubject;
}

function filterExams() {
    const filter = document.getElementById("subjectFilter");
    if (filter) selectedSubject = filter.value;
    renderCalendar();
    renderExamList();
}

function changeMonth(direction) {
    currentDate.setMonth(currentDate.getMonth() + direction);
    renderCalendar();
}

function formatDate(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
}

function getVisibleExams() {
    return exams.filter(exam => {
        if (exam.semester !== currentSemester) return false;
        if (selectedSubject !== "all" && exam.subject !== selectedSubject) return false;
        return true;
    });
}

function renderCalendar() {
    const calendar = document.getElementById("calendar");
    if (!calendar) return;
    calendar.innerHTML = "";

    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const monthTitle = document.getElementById("monthTitle");
    if (monthTitle) {
        monthTitle.textContent = currentDate.toLocaleDateString("es-AR", { month: "long", year: "numeric" });
    }

    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);

    let startDay = firstDay.getDay();
    startDay = startDay === 0 ? 6 : startDay - 1;

    const previousLastDay = new Date(year, month, 0).getDate();

    for (let i = startDay - 1; i >= 0; i--) {
        const day = previousLastDay - i;
        const date = new Date(year, month - 1, day);
        calendar.appendChild(createDayCell(date, true));
    }

    const daysInMonth = lastDay.getDate();
    for (let day = 1; day <= daysInMonth; day++) {
        const date = new Date(year, month, day);
        calendar.appendChild(createDayCell(date, false));
    }

    const totalCells = 42;
    const usedCells = startDay + daysInMonth;
    const remaining = totalCells - usedCells;

    for (let day = 1; day <= remaining; day++) {
        const date = new Date(year, month + 1, day);
        calendar.appendChild(createDayCell(date, true));
    }
}

function createDayCell(date, otherMonth) {
    const cell = document.createElement("div");
    cell.className = "day";
    if (otherMonth) cell.classList.add("other-month");

    const number = document.createElement("div");
    number.className = "day-number";
    number.textContent = date.getDate();
    cell.appendChild(number);

    const today = new Date();
    if (date.getFullYear() === today.getFullYear() &&
        date.getMonth() === today.getMonth() &&
        date.getDate() === today.getDate()) {
        cell.classList.add("today");
    }

    const dateString = formatDate(date);
    const dayExams = getVisibleExams().filter(exam => exam.date === dateString);

    if (dayExams.length > 0) {
        const eventsContainer = document.createElement("div");
        eventsContainer.className = "day-exams";

        const examsToShow = dayExams.slice(0, 2);
        examsToShow.forEach(exam => {
            const event = document.createElement("div");
            event.className = "exam-event";
            if (examsToShow.length === 1) event.classList.add("single");
            else event.classList.add("half");

            const subject = getSubject(exam.subject);
            event.style.background = subject.color;

            const unitsHTML = exam.units ? `<div class="exam-event-units">${exam.units}</div>` : "";
            
            event.innerHTML = `
                <div class="exam-event-title">${exam.subject}</div>
                ${unitsHTML}
                <div class="exam-event-time">${exam.type}</div>
            `;
            
            event.title = `${exam.subject} · ${exam.type}` + (exam.units ? ` · ${exam.units}` : "");
            eventsContainer.appendChild(event);
        });

        cell.appendChild(eventsContainer);
    }
    return cell;
}

function renderLegend() {
    const container = document.getElementById("legendItems");
    if (!container) return;
    container.innerHTML = "";
    
    if (!semesters[currentSemester]) return;

    semesters[currentSemester].subjects.forEach(subject => {
        const item = document.createElement("div");
        item.className = "legend-item";
        item.innerHTML = `
            <span class="legend-color" style="background:${subject.color}"></span>
            <span>${subject.name}</span>
        `;
        container.appendChild(item);
    });
}

function renderExamList() {
    const container = document.getElementById("examList");
    if (!container) return;
    container.innerHTML = "";

    let visible = getVisibleExams();
    visible.sort((a, b) => new Date(a.date) - new Date(b.date));

    if (visible.length === 0) {
        container.innerHTML = `
            <div class="empty-message">No hay exámenes programados para esta selección.</div>
        `;
        return;
    }

    const list = document.createElement("div");
    list.className = "exam-list";

    const token = localStorage.getItem('token');
    const isLogged = !!token;

    visible.forEach(exam => {
        const subject = getSubject(exam.subject);
        const item = document.createElement("div");
        item.className = "exam-item";

        const partesFecha = exam.date.split('-');
        const fechaObj = new Date(partesFecha[0], partesFecha[1] - 1, partesFecha[2]);

        const formattedDate = fechaObj.toLocaleDateString("es-AR", {
            weekday: "short", day: "2-digit", month: "2-digit", year: "numeric"
        });

        const unitsHTML = exam.units ? `<div class="exam-item-units">📚 ${exam.units}</div>` : "";
        const btnDeleteHTML = isLogged ? `<button class="delete-exam" title="Eliminar examen" onclick="deleteExam(${exam.id})">×</button>` : "";

        item.innerHTML = `
            <div class="exam-item-color" style="background:${subject.color}"></div>
            <div class="exam-item-info">
                <div class="exam-item-subject">${exam.subject}</div>
                <div class="exam-item-details">${exam.type}</div>
                ${unitsHTML}
            </div>
            <div class="exam-item-date">${formattedDate}</div>
            ${btnDeleteHTML}
        `;
        list.appendChild(item);
    });

    container.appendChild(list);
}

/* =========================================
   MODALES Y ACCIONES DE EXAMEN
========================================= */
function openExamModal() {
    const modal = document.getElementById("examModal");
    if (modal) {
        modal.classList.add("show");
        modal.style.display = "block";
    }
}

function closeExamModal() {
    const modal = document.getElementById("examModal");
    if (modal) {
        modal.classList.remove("show");
        modal.style.display = "none";
    }
}

async function addExam(event) {
    event.preventDefault();

    const materiaId = document.getElementById("examSubject").value;
    const date = document.getElementById("examDate").value;
    const time = document.getElementById("examTime").value;
    const type = document.getElementById("examType").value;
    const units = document.getElementById("examUnits").value.trim();
    const description = document.getElementById("examDescription").value.trim();

    const tituloFinal = `${type} (${time}hs) ${description ? '- ' + description : ''}`;

    const nuevoExamenPayload = {
        materia_id: parseInt(materiaId),
        fecha: date,
        titulo: tituloFinal,
        unidades_evaluadas: units || "Sin unidades especificadas"
    };

    try {
        const token = localStorage.getItem('token');
        const response = await fetch('/api/examenes', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(nuevoExamenPayload)
        });

        if (response.ok) {
            await loadDataDesdeAPI();
            
            const examDate = new Date(`${date}T00:00:00`);
            currentDate = new Date(examDate.getFullYear(), examDate.getMonth(), 1);
            
            renderCalendar();
            closeExamModal();
            document.getElementById("examForm").reset();
        } else {
            const errData = await response.json();
            alert(`Error: ${errData.message || 'No se pudo crear el examen'}`);
        }
    } catch (error) {
        console.error("Error conectando al backend:", error);
    }
}

async function deleteExam(id) {
    const confirmed = confirm(`¿Querés eliminar este examen del calendario?`);
    if (!confirmed) return;

    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`/api/examenes/${id}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (response.ok) {
            await loadDataDesdeAPI();
        } else {
            alert("Acceso denegado: No tienes permiso para borrar exámenes.");
        }
    } catch (error) {
        console.error("Error al eliminar examen:", error);
    }
}

window.addEventListener("click", event => {
    const examModal = document.getElementById("examModal");
    const loginModal = document.getElementById("loginModal");
    if (event.target === examModal) closeExamModal();
    if (event.target === loginModal) closeLoginModal();
});

window.addEventListener("keydown", event => {
    if (event.key === "Escape") {
        closeExamModal();
        closeLoginModal();
    }
});