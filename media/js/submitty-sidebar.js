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
    const gradeableVersionContainer = document.querySelector('.gradeable-version-container');
    const gradeableDueDateContainer = document.querySelector('.gradeable-due-date-container');
    const gradeableGradingContainer = document.querySelector('.gradeable-grading-container');
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

    // polling delay
    let pollingDelay = 3000;
    const minPollingDelay = 3000;   // 3 seconds
    const maxPollingDelay = 60000;  // 1 minute 
    let previousPollingState = "";

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
            value: pollingDelay
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

    function formatDate(dateString) {
        const date = new Date(dateString);

        const day = date.getUTCDate();
        const month = date.toLocaleString('en-US', { month: 'long' });
        const year = date.getUTCFullYear();
        const hours = date.getUTCHours().toString().padStart(2, '0');
        const minutes = date.getUTCMinutes().toString().padStart(2, '0');

        const ordinalSuffix = (n) => {
            if (n > 3 && n < 21) {
                return "th";
            }
            switch (n % 10) {
                case 1: return "st";
                case 2: return "nd";
                case 3: return "rd";
                default: return "th";
            }
        };

        return `${day}${ordinalSuffix(day)} ${month} ${year} at ${hours}:${minutes}`;
    }

    function formatQueuePosition(queue_position) {
        const ordinalSuffix = (n) => {
            if (n > 3 && n < 21) {
                return "th";
            }
            switch (n % 10) {
                case 1: return "st";
                case 2: return "nd";
                case 3: return "rd";
                default: return "th";
            }
        };

        if(queue_position === -1) {
            return `queued`;
        }

        return `${queue_position}${ordinalSuffix(queue_position)} in queue`;
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

    function adjustPollingDelay(gradeableData) {
        let currentPollingState = "";
        
        if(gradeableData.is_queued) {
            currentPollingState = "queued";
        }
        else {
            currentPollingState = "grading";
        }

        // adjust poll
        if(previousPollingState === currentPollingState) {
            pollingDelay = Math.min(pollingDelay * 2, maxPollingDelay);
        }
        else {
            pollingDelay = minPollingDelay;
        }

        previousPollingState = currentPollingState;
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
                const gradeableData = message.gradeableData;

                // reset div
                fileContainer.replaceChildren();
                gradeableVersionContainer.replaceChildren();
                gradeableDueDateContainer.replaceChildren();
                gradeableGradingContainer.replaceChildren();

                // set visibility
                loginContainer.style.display = "none";
                coursesContainer.style.display = "none";
                courseContainer.style.display = "none";
                gradeablesContainer.style.display = "none";
                gradeableContainer.style.display = "block";

                // update gradeableTitle
                gradeableTitle.textContent = gradeable_title;

                // update the gradeableDueDate
                const dueDateMessage = document.createElement("p");
                dueDateMessage.textContent = "Deadline " + formatDate(gradeableData.due_date.date);
                gradeableDueDateContainer.appendChild(dueDateMessage);

                // update gradeableVersion
                const versionMessage = document.createElement("p");
                if(gradeableData.version === 0) {
                    versionMessage.textContent = "No previous submission versions.";
                }
                else {
                    versionMessage.textContent = "You have " + gradeableData.version + " submission version(s).";
                    const gradingMessage = document.createElement("p");
                    const gradingMessagePrefix = `Your highest version (${gradeableData.version}) is `;

                    // update version status (queued, grading, graded)
                    if(gradeableData.is_queued) {
                        gradingMessage.textContent = gradingMessagePrefix + formatQueuePosition(gradeableData.queue_position);
                        adjustPollingDelay(gradeableData);
                        setTimeout(refreshFileContainerClicked, pollingDelay);
                    }
                    else if(gradeableData.is_grading) {
                        gradingMessage.textContent = gradingMessagePrefix + "grading";
                        adjustPollingDelay(gradeableData);
                        setTimeout(refreshFileContainerClicked, pollingDelay);
                    }
                    else if(gradeableData.total_percent === 0){
                        gradingMessage.textContent = gradingMessagePrefix + "graded";
                    }
                    else {
                        const totalPossiblePoints = gradeableData.total_points / gradeableData.total_percent;
                        gradingMessage.textContent = gradingMessagePrefix + `graded (${gradeableData.total_points} of ${totalPossiblePoints}).`;
                    }
                    gradeableGradingContainer.appendChild(gradingMessage);

                }
                gradeableVersionContainer.appendChild(versionMessage);

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