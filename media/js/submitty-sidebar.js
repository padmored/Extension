(function () {
    const vscode = acquireVsCodeApi();

    const login = document.querySelector('.login');

    // course data
    const courseTitle = document.querySelector('.course-title');

    // containers
    const loginContainer = document.querySelector('.login-container');
    const coursesContainer = document.querySelector('.courses-container');
    const courseContainer = document.querySelector('.course-container');
    // course type lists
    const archivedCourseContainer = document.querySelector('.archived-course-container');
    const droppedCourseContainer = document.querySelector('.dropped-course-container');
    const unarchivedCourseContainer = document.querySelector('.unarchived-course-container');

    login.addEventListener('click', loginClicked);

    function loginClicked() {
        vscode.postMessage({
            type: 'login',
            value: 'clicked'
        });
    }

    function courseClicked(event) {
        const button = event.target;
        const course = button.dataset.name;
        const semester = button.dataset.semester;
    
        vscode.postMessage({
            type: "course",
            course: course,
            semester: semester
        });
    }

    window.addEventListener("message", async (event) => {
        const message = event.data;
        switch (message.type) {
            case "courses":
                const { archived_courses, dropped_courses, unarchived_courses } = message.courses;

                // show courses, hide login
                loginContainer.style.display = "none";
                coursesContainer.style.display = "block";

                // reset the lists
                archivedCourseContainer.replaceChildren();
                droppedCourseContainer.replaceChildren();
                unarchivedCourseContainer.replaceChildren();

                // update the lists
                if(archived_courses.length === 0) {
                    const noCoursesMessage = document.createElement("p");
                    noCoursesMessage.textContent = "No archived courses available.";
                    archivedCourseContainer.appendChild(noCoursesMessage);
                }
                archived_courses.forEach(course => {
                    const button = document.createElement("button");
                    button.textContent = course.title;
                    button.dataset.name = course.title;
                    button.dataset.semester = course.semester;
                    button.addEventListener("click", courseClicked);
                    archivedCourseContainer.appendChild(button);
                });

                if(dropped_courses.length === 0) {
                    const noCoursesMessage = document.createElement("p");
                    noCoursesMessage.textContent = "No dropped courses available.";
                    droppedCourseContainer.appendChild(noCoursesMessage);
                }
                dropped_courses.forEach(course => {
                    const button = document.createElement("button");
                    button.textContent = course.title;
                    button.dataset.name = course.title;
                    button.dataset.semester = course.semester;
                    button.addEventListener("click", courseClicked);
                    droppedCourseContainer.appendChild(button);
                });

                if(unarchived_courses.length === 0) {
                    const noCoursesMessage = document.createElement("p");
                    noCoursesMessage.textContent = "No unarchived courses available.";
                    unarchivedCourseContainer.appendChild(noCoursesMessage);
                }
                unarchived_courses.forEach(course => {
                    const button = document.createElement("button");
                    button.textContent = course.title;
                    button.dataset.name = course.title;
                    button.dataset.semester = course.semester;
                    button.addEventListener("click", courseClicked);
                    unarchivedCourseContainer.appendChild(button);
                });

                break;

            case "course":
                const course = message.course;
                const semester = message.semester;

                // show course, hide courses
                coursesContainer.style.display = "none";
                courseContainer.style.display = "block";

                courseTitle.textContent = course + ", " + semester;

                break;
        }
    });

}());