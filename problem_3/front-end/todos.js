const bodyWrapper = document.querySelector('.body-wrapper');
const modal = document.querySelector('.modal');
const todoUri = "http://localhost:8000"
let lastTasks = []


function frizeBody() {
    bodyWrapper.classList.remove('default')
    bodyWrapper.classList.add('frozen');
}

function unfrizeBody() {
    bodyWrapper.classList.add('default');
    bodyWrapper.classList.remove('frozen');
}

function showModal() {
    modal.classList.remove('hide-modal');
    modal.classList.add('show-modal');
}

function hideModal() {
    modal.classList.remove('show-modal');
    modal.classList.add('hide-modal');
}

function openFullTask() {
    frizeBody();
    showModal();
}

function closeFullTask() {
    hideModal();
    unfrizeBody();
}

function convertToMoscowTime(dateTimeString) {
    const utcDate = new Date(dateTimeString);

    const moscowOffset = 3 * 60;

    const moscowTime = new Date(utcDate.getTime() + (moscowOffset * 60000));

    const day = String(moscowTime.getUTCDate()).padStart(2, '0');
    const month = String(moscowTime.getUTCMonth() + 1).padStart(2, '0');
    const year = moscowTime.getUTCFullYear();
    const hours = String(moscowTime.getUTCHours()).padStart(2, '0');
    const minutes = String(moscowTime.getUTCMinutes()).padStart(2, '0');

    const formattedDateTime = `${day}.${month}.${year} ${hours}:${minutes}`;
    return formattedDateTime;
}

// Добавляет задачу
function renderTask(task) {
    let todoElement = $('<div class="todo-element"></div>');
    let titleElement = $('<div class="title"></div>');
    titleElement.append('<span class="name">' + task.name + '</span>');
    titleElement.append('<span class="date">' + convertToMoscowTime(task.date) + '<i class="fa-solid fa-circle status-' + (task.status ? 'ok' : 'bad') + '"></i></span>');
    todoElement.append(titleElement);
    todoElement.append('<hr>');
    let descElement = $('<div class="desc"></div>');
    descElement.append('<span>' + task.shortDesc + '</span>');
    todoElement.append(descElement);
    $('.content-wrapper').append(todoElement);

    todoElement.on('click', function () {
        preRenderFullTask(task);
        openFullTask();
    });
}

function renderJustSpan(text) {
    let span = $(`<span>${text}</span>`);
    $('.content-wrapper').append(span);
}

// Обновляет текущий список
// TODO: анимация
function updateTaskList(newTaskList) {
    $('.content-wrapper').empty();
    lastTasks = newTaskList;
    for (let i = 0; i < newTaskList.length; i++) {
        renderTask(newTaskList[i]);
    }

    if (newTaskList.length == 0) {
        renderJustSpan("Ничего не найдено!");
    }
}

function searchToday() {
    let fromDate = new Date();
    let toDate = new Date();
    fromDate.setHours(0, 0, 0, 0);
    toDate.setHours(23, 59, 59, 59);
    console.log(fromDate);
    console.log(toDate);
    onChangeDate(fromDate.getTime(), toDate.getTime());
}

function searchOnWeek() {
    let fromDate = getPreviosMonday();
    let toDate = getPreviosMonday();
    toDate.setDate(fromDate.getDate() + 6);
    toDate.setHours(23, 59, 59, 59);

    console.log(fromDate);
    console.log(toDate);
    onChangeDate(fromDate.getTime(), toDate.getTime());
}

document.addEventListener('DOMContentLoaded', function () {
    let closeModalBtn = document.querySelector('.modal button');
    let todayButton = document.querySelector('[name="today"]');
    let weekButton = document.querySelector('[name="week"]');

    closeModalBtn.addEventListener('click', function () {
        closeFullTask();
    });

    todayButton.addEventListener('click', function () {
        searchToday();
    });

    weekButton.addEventListener('click', function () {
        searchOnWeek();
    });

});

function getPreviosMonday() {
    const today = new Date();
    const dayOfWeek = today.getDay();
    const daysSinceLastMonday = (dayOfWeek + 6) % 7;
    const lastMonday = new Date(today);
    lastMonday.setDate(today.getDate() - daysSinceLastMonday);
    lastMonday.setHours(0, 0, 0, 0);
    return lastMonday;
}


function preRenderFullTask(task) {
    newStatus = task.status ? 'status-ok' : 'status-bad';
    $('.modal-wrapper .name i').removeClass('status-ok');
    $('.modal-wrapper .name i').removeClass('status-bad');
    $('.modal-wrapper .name i').addClass(newStatus);
    $('.modal-wrapper .name span').text(task.name);
    $('.modal-wrapper .full-desc').text(task.fullDesc);
    $('.modal-wrapper .date').text(convertToMoscowTime(task.date));
}

function preQuery() {
    $('.content-wrapper').empty();
    renderJustSpan("Ищу, подождите...");
}

// TODO: показывать, когда пусто!
function onChangeDate(from, to) {
    preQuery();

    const queryParams = new URLSearchParams({
        from_date: from,
        to_date: to
    });

    fetch(todoUri + '/api/todos/date?' + queryParams, {
        method: 'GET'
    })
        .then(response => {
            if (!response.ok) {
                console.error('Error:', response.statusText);
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            updateTaskList(data);
        })
        .catch(error => {
            console.error('Fetch error:', error);
        });
}

function findByString(text) {
    preQuery();

    const queryParams = new URLSearchParams({ q: text });

    fetch(todoUri + '/api/todos/find?' + queryParams, {
        method: 'GET'
    })
        .then(response => {
            if (!response.ok) {
                console.error('Error:', response.statusText);
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            updateTaskList(data);
        })
        .catch(error => {
            console.error('Fetch error:', error);
        });
}

$(".search-input").keypress(function (event) {
    if (event.which === 13) {
        const searchValue = $(".search-input").val();
        findByString(searchValue);
    }
});

searchToday();