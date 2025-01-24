// IMPORT ALL MODULES...
import { getCurrentUser, getEmployeeDataFromDatabase, editEmployeeFromDatabase,updateProfileData, supabaseUrl, logout, checkUserLoginOrNot } from "./db.js";
import { createToastForNotification, hideSpinner, showSpinner, showLoading } from "./utils.js";


// GET ELEMENT...
const editProfileBtn = document.querySelector('.edit-profile-btn');
const model = document.querySelector(".modal");
const cancelBtn = document.querySelector('.cancel-btn');
const taskCardContainer = document.querySelector('.task-card-container');
const profileForm = document.querySelector('.profileForm');
const previewImg = document.querySelector('.previewImg');
const previewFile = document.querySelector('#profile-pic');
const closeImg = document.querySelector('.closeImg');
const logoutBtn = document.querySelector('.logout');


// CHECK ADMIN AUTHHENTICATED OR NOT...
const sessionCheckForEmployee = async () => {
  const session = await checkUserLoginOrNot();
  if (!session) {
    window.location.href = './index.html';
  }
};

sessionCheckForEmployee();
showLoading("Loading Profile...")


logoutBtn.addEventListener("click", async () => {
  showSpinner();
  await logout()
  sessionCheckForEmployee();
  hideSpinner();
});


// ADD LISTNER TO OPEN EDIT PROFILE MODEL...
editProfileBtn.addEventListener("click", () => {
    model.classList.add("active");
});


// remove LISTNER FOR CLOSE EDIT PROFILE MODEL...
cancelBtn.addEventListener("click", () => {
    model.classList.remove("active");
    previewFile.value = '';
    previewImg.src = '';
    previewImg.style.display = 'none';
    closeImg.style.display = 'none';
    
});


// SHOW USER DATA OVER THE EMPLOYEE PAGE...
const showUserData = async () => {
    const User = await getCurrentUser(); 
    const allEmployeeData = await getEmployeeDataFromDatabase();
    const currentEmployeeData = allEmployeeData.filter(({ employeeData }) => employeeData.email === User.email);

    showCurrentDataInPage(currentEmployeeData);
    showTaskInCard(currentEmployeeData);
};

showUserData();

// FUNCTION TO SHOW CURRENT DATA OVER THE PAGE...
const showCurrentDataInPage = (employeeData) => {
    const data = employeeData[0]?.employeeData

    document.querySelector('.profile-photo img').src = `${!data.profilePicture ? './assets/images/human-img.png' : `${supabaseUrl}/storage/v1/object/public/${data.profilePicture}` }`;

    document.querySelector('.employee-name').textContent = data?.fullName;
    document.querySelector('.IT').textContent = data?.department;

    document.querySelector("#assignedCount").innerHTML = data?.taskCount?.assignTask
    document.querySelector("#acceptedCount").innerHTML = data?.taskCount?.acceptedTask
    document.querySelector("#completedCount").innerHTML = data?.taskCount?.completedTask
    document.querySelector("#failedCount").innerHTML = data?.taskCount?.failedTask

    document.querySelector('#fullname').value = data?.fullName
    document.querySelector('#fullname').setAttribute('data-employeeid', employeeData[0]?.id);

    document.querySelector(".fullName").textContent = data?.fullName;
    document.querySelector(".email").innerHTML = data?.email;
    document.querySelector(".salary").innerHTML = data?.salary;
    document.querySelector(".joining-date").innerHTML = data?.joiningDate;
    document.querySelector(".desc").innerHTML = data?.description;
}

// SHOW TASK IN CARD FOR USER INTRACT WITH...
const showTaskInCard = (employeeData) => {
    const data = employeeData[0]?.employeeData;
      taskCardContainer.innerHTML = '';
  if (data.tasks.length === 0) {

    taskCardContainer.innerHTML = `<div class="emty-employee">
            <span><i class="fa-solid fa-users-slash"></i></span>
            <h3>No tasks have been assigned yet.</h3>
          </div>`
  }

  data.tasks.forEach(task => {
    taskCardContainer.innerHTML += `<div class="task-card">
    <div class="task-header">
      <h3 class="task-title">${task.taskTitle}</h3>
    </div>
    <div class="task-body">
      <p class="task-description">
        ${task.taskDescription}.
      </p>
    </div>
    <div class="task-actions">
      <button class="task-btn accept" data-taskid='${task.taskId}'>Accept Task</button>
      <button class="task-btn complete" data-taskid='${task.taskId}'>Complete task</button>
      <button class="task-btn fail" data-taskid='${task.taskId}'>Fail task</button>
    </div>
     </div>`
  });


  // ADD LISTNER ALL BUTTON TO DOING TASK...
   const taskButton = taskCardContainer.querySelectorAll(".task-actions button");
  taskButton.forEach((button) => {
    button.addEventListener('click', async (event) => {
        let name = event.target.textContent;
        let taskId = event.target.dataset.taskid
        
        if (name === 'Accept Task') {
            showSpinner()
            employeeData[0].employeeData.taskCount.acceptedTask++;
            let taskFillter = data.tasks.filter(task => task.taskId !== taskId);
            console.log(taskFillter);
            employeeData[0].employeeData.taskCount.assignTask = taskFillter.length;
            employeeData[0].employeeData.tasks = taskFillter;
        
            await editEmployeeFromDatabase(employeeData[0].employeeData, employeeData[0].id);
            showTaskInCard(employeeData);
            showCurrentDataInPage(employeeData)
            hideSpinner()
            createToastForNotification('success', 'fa-solid fa-circle-check', 'Success', "Task Accepted successfully!");
            
        }else if (name === 'Complete task') {
            showSpinner()
            employeeData[0].employeeData.taskCount.completedTask++;
            let taskFillter = data.tasks.filter(task => task.taskId !== taskId);
            console.log(taskFillter);
            employeeData[0].employeeData.taskCount.assignTask = taskFillter.length;
            employeeData[0].employeeData.tasks = taskFillter;
        
            await editEmployeeFromDatabase(employeeData[0].employeeData, employeeData[0].id);
            showTaskInCard(employeeData);
            showCurrentDataInPage(employeeData)
            hideSpinner();
            createToastForNotification('success', 'fa-solid fa-circle-check', 'Success', "Task Completed successfully!");
            
        }else if (name === 'Fail task') {
            showSpinner()
            employeeData[0].employeeData.taskCount.failedTask++;
            let taskFillter = data.tasks.filter(task => task.taskId !== taskId);
            console.log(taskFillter);
            employeeData[0].employeeData.taskCount.assignTask = taskFillter.length;
            employeeData[0].employeeData.tasks = taskFillter;
        
            await editEmployeeFromDatabase(employeeData[0].employeeData, employeeData[0].id);
            showTaskInCard(employeeData);
            showCurrentDataInPage(employeeData);
            hideSpinner();
            createToastForNotification('success', 'fa-solid fa-circle-check', 'Success', "Task Failed successfully!");

        }else {
            createToastForNotification('error', 'fa-solid fa-circle-exclamation', 'Error', "Something went wrong.");
        }
        
    });
    
  });
  
    
    
};


// PREVIEW IMG CODE FOR SHOW EMPLOYEE PROFILE IMG PREVIEW...
previewFile.addEventListener("change", (event) => {
  const files = event.target.files[0]
  const localUrl = URL.createObjectURL(files)
  previewImg.src = localUrl;
  previewImg.style.display = 'block';
  closeImg.style.display = 'block';
  
});

// DELETE THE IMAGE AND FILE IN PREVIEW WITH THE HELP OF CLOSE BTN...
closeImg.addEventListener('click', (event) => {
  event.stopImmediatePropagation(); 
  event.preventDefault();
  previewFile.value = '';
  previewImg.src = '';
  previewImg.style.display = 'none';
  closeImg.style.display = 'none';
});


// ADD LISTENER TO SUBMIT PROFILE FORM....
profileForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  const form = event.target;
  let fullName = null;
  let profilePictureName = null;
  let employeId = null;

  for (const element of form.elements) {
    if (element.type == 'submit' || element.type === 'button') {
      continue
    }

    if (element.type === 'text') {
      if(!element.value.trim()) {
        createToastForNotification('error', 'fa-solid fa-circle-exclamation', 'Error', "FullName is required.");
      }else {
        fullName = element.value;
        employeId = element.dataset.employeeid;
      }
    }

    if (element.type === 'file') {
      if (element.files.length !== 0) {
        
        profilePictureName = element.files[0];
        
      }
      
      
    }
    
  }

  showSpinner()
  const {findEmployee, errors} = await updateProfileData(fullName, profilePictureName, employeId);



  if (!errors) {
    showCurrentDataInPage([findEmployee]);
    model.classList.remove("active");
    previewFile.value = '';
    previewImg.src = '';
    previewImg.style.display = 'none';
    closeImg.style.display = 'none';
    hideSpinner();
    createToastForNotification('success', 'fa-solid fa-circle-check', 'Success', "Profile Edit successFully!");
  }else {
    model.classList.remove("active");
    previewFile.value = '';
    previewImg.src = '';
    previewImg.style.display = 'none';
    closeImg.style.display = 'none';
    hideSpinner()
    createToastForNotification('error', 'fa-solid fa-circle-exclamation', 'Error', `${errors.message}!`);

  }


});



