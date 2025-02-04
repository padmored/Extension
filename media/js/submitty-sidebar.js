(function () {
    const vscode = acquireVsCodeApi();

    const getCourses = document.querySelector('.get-courses');
    // course type lists
    const archivedCourseList = document.querySelector('.archived-course-list');
    const droppedCourseList = document.querySelector('.dropped-course-list');
    const unarchivedCourseList = document.querySelector('.unarchived-course-list');

    getCourses.addEventListener('click', getCoursesClicked);

    function getCoursesClicked() {
        vscode.postMessage({
            type: 'get-courses',
            value: 'clicked'
        });
    }

    window.addEventListener("message", async (event) => {
        const message = event.data;
        switch (message.type) {
            case "courses":
                const { archived_courses, dropped_courses, unarchived_courses } = message.courses;

                // reset the lists
                archivedCourseList.replaceChildren();
                droppedCourseList.replaceChildren();
                unarchivedCourseList.replaceChildren();

                // update the lists
                archived_courses.forEach(course => {
                    const li = document.createElement("li");
                    li.textContent = course.title;
                    archivedCourseList.appendChild(li);
                });
                dropped_courses.forEach(course => {
                    const li = document.createElement("li");
                    li.textContent = course.title;
                    droppedCourseList.appendChild(li);
                });
                unarchived_courses.forEach(course => {
                    const li = document.createElement("li");
                    li.textContent = course.title;
                    unarchivedCourseList.appendChild(li);
                });

                break;
        }
    });

}());