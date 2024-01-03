document.addEventListener("DOMContentLoaded", function () {
    const prevBtn = document.querySelector(".prev");
    const nextBtn = document.querySelector(".next");
    const monthYearElement = document.querySelector(".month-year");
    const daysContainer = document.querySelector(".days");

    let currentDate = new Date();
    let selectedStartDate = null;
    let selectedEndDate = null;

    function updateCalendarHeader() {
        const options = { month: "long", year: "numeric" };
        monthYearElement.textContent = currentDate.toLocaleDateString("ru-RU", options);
    }

    function findLast(num) {
        return num % 7 == 0 ? num : num + (7 - (num % 7));
    };

    function renderCalendarDays() {
        daysContainer.innerHTML = "";

        const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
        const startingDayOfWeek = (firstDayOfMonth.getDay() + 6) % 7;
        const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
        const daysInLastMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 0).getDate();

        const curRowsCount = findLast(daysInMonth + startingDayOfWeek) / 7;
        console.log(curRowsCount);

        function addDay(type, number) {
            const curDay = document.createElement("div");
            curDay.classList.add(type);
            curDay.textContent = number;
            daysContainer.appendChild(curDay);
            return curDay;
        }

        function addOtherDay(number) { return addDay("otherMonth", number) };


        if (curRowsCount < 6 && startingDayOfWeek == 0) {
            for (let i = 0; i < 7; i++) addOtherDay(daysInLastMonth - 7 + i + 1);
        }

        for (let i = 0; i < startingDayOfWeek; i++) {
            addOtherDay(daysInLastMonth - startingDayOfWeek + i + 1);
        }

        for (let day = 1; day <= daysInMonth; day++) {
            const dayElement = addDay("defaultDay", day);
            if (
                day === new Date().getDate() &&
                currentDate.getMonth() === new Date().getMonth() &&
                currentDate.getFullYear() === new Date().getFullYear()
            ) {
                dayElement.classList.add("current");
            }
        }

        let i = 0;

        for (; i < (findLast(daysInMonth + startingDayOfWeek) - daysInMonth - startingDayOfWeek); i++) {
            addOtherDay(i + 1);
        }

        if (curRowsCount < 6 && startingDayOfWeek > 0) {
            for (let k = 0; k < 7; k++, i++) addOtherDay(i + 1);
        }

        if (curRowsCount == 4) {
            for (i = 0; i < 7; i++) addOtherDay(i + 1);
        }
    }

    function selectDay(dayElement) {
        const selectedDay = parseInt(dayElement.textContent);

        if (isNaN(selectedDay)) {
            return;
        }

        if (!selectedStartDate) {
            selectedStartDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), selectedDay);
        } else if (!selectedEndDate) {
            selectedEndDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), selectedDay);

            if (selectedStartDate > selectedEndDate) {
                const tmp = selectedStartDate;
                selectedStartDate = selectedEndDate;
                selectedEndDate = tmp;
            }

            selectedEndDate.setHours(23, 59, 59, 59);
            
            console.log(selectedStartDate);
            console.log(selectedEndDate);
            const from = selectedStartDate.getTime(),
                to = selectedEndDate.getTime();

            onChangeDate(from, to);
            highlightSelectedRange();

            const preSelectedDays = document.querySelectorAll(".pre-selected");
            preSelectedDays.forEach(day => day.classList.remove("pre-selected"));

            selectedStartDate = null;
            selectedEndDate = null;
        }
    }

    function highlightSelectedRange() {
        const selectedDays = document.querySelectorAll(".selected");
        selectedDays.forEach(day => day.classList.remove("selected"));
        const days = document.querySelectorAll(".defaultDay");
        days.forEach(day => {
            const dayDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), parseInt(day.textContent));

            if (dayDate >= selectedStartDate && dayDate <= selectedEndDate) {
                day.classList.add("selected");
            }
        });
    }

    function updateCalendar() {
        updateCalendarHeader();
        renderCalendarDays();
    }
    prevBtn.addEventListener("click", function () {
        currentDate.setMonth(currentDate.getMonth() - 1);
        updateCalendar();
    });
    nextBtn.addEventListener("click", function () {
        currentDate.setMonth(currentDate.getMonth() + 1);
        updateCalendar();
    });

    daysContainer.addEventListener("click", function (event) {
        const clickedElement = event.target;

        if (clickedElement.classList.contains("defaultDay")) {
            const selectedDays = document.querySelectorAll(".selected");
            selectedDays.forEach(day => day.classList.remove("selected"));

            clickedElement.classList.add("pre-selected");
            selectDay(clickedElement);
        }
    });

    updateCalendar();
});
