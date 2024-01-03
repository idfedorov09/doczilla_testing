function forTests() {
    let currentTasks = [];

    testTask1 = {
        id: "3fa85f64-5717-4562-b3fc-2c963f66afa6",
        name: "Выпить воды",
        shortDesc: "Короткое описание первой задачи",
        fullDesc: "Полное описание первой задачи",
        date: "2024-01-03T11:33:19.319Z",
        status: true
    }
    testTask2 = {
        id: "3fa85f64-5717-4562-b4fc-2c963f66afa6",
        name: "Почистить картошку",
        shortDesc: "Короткое описание второй задачи - почистить картоху!",
        fullDesc: "Полное описание второй задачи лучше не приводить..",
        date: "2024-01-04T11:33:19.319Z",
        status: false
    }
    currentTasks.push(testTask1);
    currentTasks.push(testTask2);
    frizeBody();
    updateTaskList(currentTasks);
}

const bodyWrapper = document.querySelector('.body-wrapper');
const modal = document.querySelector('.modal');
forTests();


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
    var todoElement = $('<div class="todo-element"></div>');
    var titleElement = $('<div class="title"></div>');
    titleElement.append('<span class="name">' + task.name + '</span>');
    titleElement.append('<span class="date">' + task.date + '<i class="fa-solid fa-circle status-' + (task.status ? 'ok' : 'bad') + '"></i></span>');
    todoElement.append(titleElement);
    todoElement.append('<hr>');
    var descElement = $('<div class="desc"></div>');
    descElement.append('<span>' + task.shortDesc + '</span>');
    todoElement.append(descElement);
    $('.content-wrapper').append(todoElement);

    todoElement.on('click', function () {
        preRenderFullTask(task);
        openFullTask();
    });
}

// Обновляет текущий список
// TODO: анимация
function updateTaskList(newTaskList) {
    $('.content-wrapper').empty();
    for (let i = 0; i < newTaskList.length; i++) {
        renderTask(newTaskList[i]);
    }
}

document.addEventListener('DOMContentLoaded', function () {
    var closeModalBtn = document.querySelector('.modal button');

    closeModalBtn.addEventListener('click', function () {
        closeFullTask();
    });
});


function preRenderFullTask(task) {
    newStatus = task.status ? 'ok' : 'bad';
    $('.modal-wrapper .name i').removeClass('fa-circle status-ok').addClass('fa-circle ' + newStatus);
    $('.modal-wrapper .name').text(task.name);
    $('.modal-wrapper .full-desc').text(task.fullDesc);
    $('.modal-wrapper .date').text(convertToMoscowTime(task.date));
}
