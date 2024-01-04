
const bodyWrapper = document.querySelector('.body-wrapper');
const modal = document.querySelector('.modal');
const todoUri = "http://localhost:8000"
let lastTasks = []
let lastTasksSorted = []
let lastTasksSortedReversed = []
let onlyBad = false
let sortStatus = false;

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

function createFilterBar() {
    // false - по убыванию, true - по убыванию
    sortStatus = false;
    let filterBar = $('<div>', {
        class: 'filter-bar'
    });

    let chbxWrapper = $('<div>', {
        class: 'chbx-wrapper'
    });

    let chbxLabel = $('<label>', {
        class: 'chbx-control'
    }).append(
        $('<input>', {
            type: 'checkbox',
            id: 'checkboxStatus'
        }),
        'Только невыполненные'
    );
    chbxLabel.find('#checkboxStatus').prop('checked', onlyBad);

    chbxLabel.find('#checkboxStatus').click(function () {
        onlyBad = this.checked;
        updateTaskList(lastTasks);
    });

    let sortBar = $('<div>', {
        class: 'sort-bar'
    });

    let caretUpIcon = $('<i>', {
        class: 'compare-flag'
    });

    let dateSorter = $('<span>', {
        id: 'date_sorter',
        class: 'sorter'
    }).text('Сортировать по дате');

    chbxWrapper.append(chbxLabel);
    sortBar.append(caretUpIcon, dateSorter);
    filterBar.append(chbxWrapper, sortBar);

    return filterBar;
}

// Добавляет задачу
function renderTask(task, doAppend = false) {
    if (task.status && onlyBad) return;

    let todoElement = $('<div class="todo-element"></div>');
    let titleElement = $('<div class="title"></div>');
    titleElement.append('<span class="name">' + task.name + '</span>');
    titleElement.append('<span class="date">' + convertToMoscowTime(task.date) + '<i class="fa-solid fa-circle status-' + (task.status ? 'ok' : 'bad') + '"></i></span>');
    todoElement.append(titleElement);
    todoElement.append('<hr>');
    let descElement = $('<div class="desc"></div>');
    descElement.append('<span>' + task.shortDesc + '</span>');
    todoElement.append(descElement);

    let wrapperSize = $('.content-wrapper').children().length
    if (doAppend && wrapperSize == 1) {
        todoElement.css("margin", "1% 0 -2px 0");
    }

    if (wrapperSize == 0) {
        const filterBar = createFilterBar();
        $('.content-wrapper').append(filterBar);
        todoElement.css("margin", "1% 0 -2px 0");
    }

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
function updateTaskList(newTaskList, doAppend = false) {
    if (doAppend) {
        const statusBar = $('.content-wrapper').children().first();
        $('.content-wrapper').empty();
        $('.content-wrapper').append(statusBar);
    } else {
        $('.content-wrapper').empty();
    }
    lastTasks = newTaskList;
    let isOk = false;
    for (let i = 0; i < newTaskList.length; i++) {
        renderTask(newTaskList[i], doAppend);
        isOk |= (!(newTaskList[i].status && onlyBad));
    }

    if (!isOk) {
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
    let allButton = document.querySelector('[name="all_time"]');

    closeModalBtn.addEventListener('click', function () {
        closeFullTask();
    });

    todayButton.addEventListener('click', function () {
        searchToday();
    });

    weekButton.addEventListener('click', function () {
        searchOnWeek();
    });

    allButton.addEventListener('click', function () {
        allTasks();
    });

    $(".search-input").on("input", function () {
        const searchValue = $(".search-input").val();
        findByString(searchValue);
        console.log(`val=${searchValue}`);
    });

    $(".search-input").keydown(function (event) {
        const backspaceKeyCode = 8, deleteKeyCode = 46;
        if (event.which === backspaceKeyCode || event.which === deleteKeyCode) {
            const searchValue = $(".search-input").val();
            findByString(searchValue);
            console.log(`val=${searchValue}`);
        }
    });


    $('.content-wrapper').on('click', '#date_sorter', function () {
        console.log('test');
        if (sortStatus) {
            $("i.compare-flag").attr('class', 'fa-solid fa-caret-up compare-flag');
            updateTaskList(lastTasksSorted, doAppend = true);
            sortStatus = false;
        }
        else {
            $("i.compare-flag").attr('class', 'fa-solid fa-caret-down compare-flag');
            updateTaskList(lastTasksSortedReversed, doAppend = true);
            sortStatus = true;
        }
    });

    $('.content-wrapper').on('click', '#checkboxStatus', function () {
        onlyBad = this.checked;
        updateTaskList(lastTasks, doAppend = true);
    });

    // при инициализации выводим список всех задач
    allTasks();
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
    const newStatus = task.status ? 'status-ok' : 'status-bad';
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

function setLastTasks(newTaskList) {
    lastTasks = newTaskList;
    lastTasksSorted = [...lastTasks].sort((a, b) => new Date(a.date) - new Date(b.date));
    lastTasksSortedReversed = [...lastTasks].sort((a, b) => new Date(b.date) - new Date(a.date));
}

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
                throw new Error(`Network response was not ok: ${response.statusText}`);
            }
            return response.json();
        })
        .then(data => {
            setLastTasks(data);
            updateTaskList(lastTasks);
        })
        .catch(error => {
            renderJustSpan(`Ошибка: ${error}`)
        });
}

function allTasks() {
    preQuery();

    fetch(todoUri + '/api/todos', {
        method: 'GET'
    })
        .then(response => {
            if (!response.ok) {
                throw new Error(`Network response was not ok: ${response.statusText}`);
            }
            return response.json();
        })
        .then(data => {
            setLastTasks(data);
            updateTaskList(lastTasks);
        })
        .catch(error => {
            renderJustSpan(`Ошибка: ${error}`)
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
                throw new Error(`Network response was not ok: ${response.statusText}`);
            }
            return response.json();
        })
        .then(data => {
            setLastTasks(data);
            updateTaskList(lastTasks);
        })
        .catch(error => {
            renderJustSpan(`Ошибка: ${error}`)
        });
}