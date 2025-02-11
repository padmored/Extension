(function () {
    const vscode = acquireVsCodeApi();

    const login = document.querySelector('.login');

    // returns
    const returnCourse = document.querySelector('.return-course')
    const returnCourses = document.querySelector('.return-courses');
    const returnLogout = document.querySelector('.return-logout');

    // course data
    const courseTitle = document.querySelector('.course-title');
    const refreshFileContainer = document.querySelector('.refresh-file-container');
    const uploadFile = document.querySelector('.upload-file');

    // gradeable data
    const gradeableTitle = document.querySelector('.gradeable-title');

    // containers
    const loginContainer = document.querySelector('.login-container');
    const coursesContainer = document.querySelector('.courses-container');
    const courseContainer = document.querySelector('.course-container');
    const gradeablesContainer = document.querySelector('.gradeables-container');
    const gradeableContainer = document.querySelector('.gradeable-container');
    const fileContainer = document.querySelector('.file-container');

    // course type lists
    const archivedCourseContainer = document.querySelector('.archived-course-container');
    const droppedCourseContainer = document.querySelector('.dropped-course-container');
    const unarchivedCourseContainer = document.querySelector('.unarchived-course-container');

    login.addEventListener('click', loginClicked);
    refreshFileContainer.addEventListener('click', refreshFileContainerClicked);
    uploadFile.addEventListener('click', uploadFileClicked);

    // return listeners and functions
    returnCourse.addEventListener('click', returnCourseClicked);
    returnCourses.addEventListener('click', returnCoursesClicked);
    returnLogout.addEventListener('click', returnLogoutClicked);

    function returnCourseClicked() {
        vscode.postMessage({
            type: 'returnCourse',
            value: 'clicked'
        });
    }

    function returnCoursesClicked() {
        vscode.postMessage({
            type: 'returnCourses',
            value: 'clicked'
        });
    }

    function returnLogoutClicked() {
        vscode.postMessage({
            type: 'returnLogout',
            value: 'clicked'
        });
    }

    function loginClicked() {
        vscode.postMessage({
            type: 'login',
            value: 'clicked'
        });
    }

    function refreshFileContainerClicked() {
        vscode.postMessage({
            type: 'refreshFileContainer',
            value: 'clicked'
        });
    }

    function uploadFileClicked() {
        const fileDropdown = document.querySelector('#fileDropdown');
        const selectedFilePath = fileDropdown.value;
        const selectedFileName = selectedFilePath.split(/[/\\]/).pop();

        vscode.postMessage({
            type: 'uploadFile',
            filePath: selectedFilePath,
            fileName: selectedFileName
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

    function gradeableClicked(event) {
        const button = event.target;
        const gradeable_id = button.dataset.gradeable_id;
        const gradeable_title = button.dataset.gradeable_title;
    
        vscode.postMessage({
            type: "gradeable",
            gradeable_id: gradeable_id,
            gradeable_title: gradeable_title
        });
    }

    window.addEventListener("message", async (event) => {
        const message = event.data;
        switch (message.type) {
            case "logout": {
                // set visibility
                loginContainer.style.display = "block";
                coursesContainer.style.display = "none";
                courseContainer.style.display = "none";
                gradeablesContainer.style.display = "none";
                gradeableContainer.style.display = "none";

                // reset containers
                gradeablesContainer.replaceChildren();
                archivedCourseContainer.replaceChildren();
                droppedCourseContainer.replaceChildren();
                unarchivedCourseContainer.replaceChildren();

                break;
            }
            case "courses": {
                const { archived_courses, dropped_courses, unarchived_courses } = message.courses;

                // set visibility
                loginContainer.style.display = "none";
                coursesContainer.style.display = "block";
                courseContainer.style.display = "none";
                gradeablesContainer.style.display = "none";
                gradeableContainer.style.display = "none";

                // reset the divs
                archivedCourseContainer.replaceChildren();
                droppedCourseContainer.replaceChildren();
                unarchivedCourseContainer.replaceChildren();

                // update the divs
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
            }
            case "course": {
                const course = message.course;
                const semester = message.semester;
                const gradeables = message.gradeables;

                // reset div
                gradeablesContainer.replaceChildren();

                // set visibility
                loginContainer.style.display = "none";
                coursesContainer.style.display = "none";
                courseContainer.style.display = "block";
                gradeablesContainer.style.display = "block";
                gradeableContainer.style.display = "none";

                courseTitle.textContent = course + ", " + semester;

                // update gradeable div
                if(Object.keys(gradeables).length === 0) {
                    const noGradeablesMessage = document.createElement("p");
                    noGradeablesMessage.textContent = "No gradeables available for this course.";
                    gradeablesContainer.appendChild(noGradeablesMessage);
                }
                Object.values(gradeables).forEach(gradeable => {
                    const button = document.createElement("button");
                    button.textContent = gradeable.title;
                    button.dataset.gradeable_id = gradeable.id;
                    button.dataset.gradeable_title = gradeable.title;
                    button.addEventListener("click", gradeableClicked);
                    gradeablesContainer.appendChild(button);
                });

                break;
            }
            case "gradeable": {
                const openFiles = message.openFiles;
                const gradeable_title = message.gradeable_title;

                // reset div
                fileContainer.replaceChildren();

                // set visibility
                loginContainer.style.display = "none";
                coursesContainer.style.display = "none";
                courseContainer.style.display = "none";
                gradeablesContainer.style.display = "none";
                gradeableContainer.style.display = "block";

                // update gradeableTitle
                gradeableTitle.textContent = gradeable_title;

                const fileDropdown = document.createElement("select");
                fileDropdown.id = "fileDropdown";

                const defaultOption = document.createElement("option");
                defaultOption.textContent = "select an opened file";
                defaultOption.value = "";
                fileDropdown.appendChild(defaultOption);

                // add files to dropdown
                openFiles.forEach(filePath => {
                    const option = document.createElement("option");
                    const fileName = filePath.split(/[/\\]/).pop();
                    option.textContent = fileName;
                    option.value = filePath;
                    fileDropdown.appendChild(option);
                });

                fileContainer.appendChild(fileDropdown);

                break;
            }
        }
    });

}());