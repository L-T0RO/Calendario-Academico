/* =========================================
   VARIABLES GLOBALES Y ESTADO
========================================= */
let semesters = {};
let exams = [];

let currentSemester = 1;
let selectedSubject = "all";
let currentDate = new Date();

// Paleta de colores para asignar dinámicamente a las materias
const colorsPalette = [
    "#4F46E5", "#0891B2", "#16A34A", "#EA580C", 
    "#7C3AED", "#0284C7", "#059669", "#DC2626", 
    "#9333EA", "#2563EB", "#0D9488", "#D97706",
    "#DB2777", "#CA8A04", "#2c02fb"
];

/* =========================================
   INICIO
========================================= */
document.addEventListener("DOMContentLoaded", async () => {
    // 1. Verificar si el usuario está logueado
    checkAuthStatus();
    
    // 2. Cargar datos de la API de Express y DB
    await loadDataDesdeAPI();
});

/* =========================================
   AUTENTICACIÓN Y LOGIN
========================================= */
function checkAuthStatus() {
    const token = localStorage.getItem('token');
    
    const loginBtn = document.getElementById('loginBtn');
    const addExamBtn = document.getElementById('addExamBtn');
    const logoutBtn = document.getElementById('logoutBtn');
    
    if (token) {
        loginBtn.classList.add('hidden');
        addExamBtn.classList.remove('hidden');
        logoutBtn.classList.remove('hidden');
    } else {
        loginBtn.classList.remove('hidden');
        addExamBtn.classList.add('hidden');
        logoutBtn.classList.add('hidden');
    }
    
    // Recargar la lista de exámenes para mostrar/ocultar el botón "Eliminar (x)"
    renderExamList();
}

function openLoginModal() {
    document.getElementById("loginModal").classList.add("show");
}

function closeLoginModal() {
    document.getElementById("loginModal").classList.remove("show");
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
            checkAuthStatus();
            closeLoginModal();
            document.getElementById("loginForm").reset();
        } else {
            alert("Credenciales inválidas. Verificá tu email o contraseña.");
        }
    } catch (error) {
        console.error("Error al iniciar sesión:", error);
        alert("Ocurrió un error al intentar conectarse al servidor.");
    }
}

function logout() {
    localStorage.removeItem('token');
    checkAuthStatus();
}

/* =========================================
   CARGAR DATOS DESDE LA API (MySQL)
========================================= */
async function loadDataDesdeAPI() {
    try {
        // 1. Cargar Cuatrimestres y Materias 
        const resMaterias = await fetch('/api/cuatrimestres');
        const cuatrimestresData = await resMaterias.json();
        
        semesters = {};
        let colorIndex = 0;

        // Construimos el objeto interno basándonos en los datos relacionales devueltos por MySQL
        cuatrimestresData.forEach(c => {
            semesters[c.numero] = {
                id: c.id,
                name: c.numero + "° Cuatrimestre",
                subjects: c.materias.map(m => {
                    const assignedColor = colorsPalette[colorIndex % colorsPalette.length];
                    colorIndex++;
                    return {
                        id: m.id, // Guardamos el ID real de MySQL
                        name: m.nombre,
                        color: assignedColor
                    };
                })
            };
        });

        // 2. Cargar Exámenes
        const resExamenes = await fetch('/api/examenes');
        const examenesData = await resExamenes.json();
        
        exams = examenesData.map(ex => {
            // Buscamos a qué cuatrimestre y materia corresponde el materia_id de la BD
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

            // Normalizar la fecha ISO
            const dateOnly = ex.fecha.split('T')[0];

            return {
                id: ex.id,
                semester: semesterNum,
                subject: subjectName,
                date: dateOnly,
                time: "00:00", // El backend agrupa esto en titulo, mantenemos para la UI
                type: ex.titulo,
                units: ex.unidades_evaluadas,
                description: ""
            };
        });

        // 3. Renderizar la UI con los datos
        loadSemester();
        populateTeacherSubjects();
        renderCalendar();
        renderExamList();

    } catch (error) {
        console.error("Error obteniendo datos del backend:", error);
    }
}

/* =========================================
   OBTENER MATERIA
========================================= */
function getSubject(subjectName) {
    for (const semester of Object.values(semesters)) {
        const subject = semester.subjects.find(item => item.name === subjectName);
        if (subject) return subject;
    }
    return { name: subjectName, color: "#64748B" };
}

/* =========================================
   CAMBIAR CUATRIMESTRE
========================================= */
function selectSemester(semesterNumber) {
    currentSemester = semesterNumber;
    selectedSubject = "all";

    document.querySelectorAll(".semester").forEach(btn => btn.classList.remove("active"));
    document.querySelectorAll(".semester")[semesterNumber - 1].classList.add("active");

    loadSemester();
    renderCalendar();
    renderExamList();
}

/* =========================================
   CARGAR MATERIAS EN LA VISTA
========================================= */
function loadSemester() {
    const semester = semesters[currentSemester];
    if (!semester) return;

    document.getElementById("semesterTitle").textContent = semester.name;
    const subjectsContainer = document.getElementById("subjects");
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

/* =========================================
   FILTRO DE MATERIAS
========================================= */
function updateFilter() {
    const filter = document.getElementById("subjectFilter");
    filter.innerHTML = `<option value="all">Todas las materias</option>`;

    if(semesters[currentSemester]) {
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
    selectedSubject = document.getElementById("subjectFilter").value;
    renderCalendar();
    renderExamList();
}

/* =========================================
   NAVEGAR MES
========================================= */
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

/* =========================================
   CALENDARIO
========================================= */
function renderCalendar() {
    const calendar = document.getElementById("calendar");
    calendar.innerHTML = "";

    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const monthName = currentDate.toLocaleDateString("es-AR", { month: "long", year: "numeric" });
    document.getElementById("monthTitle").textContent = monthName;

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
    container.innerHTML = "";
    
    if(!semesters[currentSemester]) return;

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

/* =========================================
   LISTA DE EXÁMENES
========================================= */
function renderExamList() {
    const container = document.getElementById("examList");
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

    // Verificamos si hay token para saber si pintar la 'x' de borrar
    const token = localStorage.getItem('token');
    const isLogged = !!token;

    visible.forEach(exam => {
        const subject = getSubject(exam.subject);
        const item = document.createElement("div");
        item.className = "exam-item";

        // Formateo estricto para evitar desfases de zona horaria
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
   MATERIAS PARA EL PROFESOR (MODAL)
========================================= */
function populateTeacherSubjects() {
    const select = document.getElementById("examSubject");
    select.innerHTML = "";

    Object.entries(semesters).forEach(([semesterNumber, semester]) => {
        const group = document.createElement("optgroup");
        group.label = semester.name;

        semester.subjects.forEach(subject => {
            const option = document.createElement("option");
            // Se envía el ID de MySQL directamente como valor[cite: 9]
            option.value = subject.id;
            option.textContent = subject.name;
            group.appendChild(option);
        });

        select.appendChild(group);
    });
}

/* =========================================
   MODAL EXÁMENES
========================================= */
function openExamModal() {
    document.getElementById("examModal").classList.add("show");
}

function closeExamModal() {
    document.getElementById("examModal").classList.remove("show");
}

/* =========================================
   AGREGAR EXAMEN EN LA BD
========================================= */
async function addExam(event) {
    event.preventDefault();

    const materiaId = document.getElementById("examSubject").value;
    const date = document.getElementById("examDate").value;
    const time = document.getElementById("examTime").value;
    const type = document.getElementById("examType").value;
    const units = document.getElementById("examUnits").value.trim();
    const description = document.getElementById("examDescription").value.trim();

    // El backend espera la información en un solo 'titulo', unimos la hora y el tipo para no perderlo[cite: 9]
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
            // Recargar datos desde MySQL para actualizar la interfaz
            await loadDataDesdeAPI();
            
            const examDate = new Date(`${date}T00:00:00`);
            currentDate = new Date(examDate.getFullYear(), examDate.getMonth(), 1);
            
            renderCalendar();
            closeExamModal();
            document.getElementById("examForm").reset();
        } else {
            alert("Acceso denegado: Necesitas iniciar sesión para crear exámenes.");
        }
    } catch (error) {
        console.error("Error conectando al backend:", error);
    }
}

/* =========================================
   ELIMINAR EXAMEN DE LA BD
========================================= */
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
        console.error("Error al eliminar:", error);
    }
}

/* =========================================
   CERRAR MODALES CLICK AFUERA
========================================= */
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