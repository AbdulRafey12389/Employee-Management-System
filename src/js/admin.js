import { validateForm, employeeData, validateTaskForm } from "./validate.js";
import { createToastForNotification, getRelativeTime, hideSpinner, showLoading, showSpinner } from "./utils.js";
import { 
  createEmployeeDataInDatabase,
  getEmployeeDataFromDatabase,
  deleteDataFromDatabase, 
  editEmployeeFromDatabase,
  checkUserLoginOrNot,
  logout,
  supabaseUrl} from "./db.js";

// Get elements
const toggleSidebar = document.getElementById('toggleSidebar');
const sidebar = document.getElementById('sidebar');
const closeSidebar = document.getElementById('closeToggleSidebar');
const roles = document.querySelectorAll('.role');
const employeeModal = document.getElementById("employeeModal");
const taskModal = document.getElementById("taskModal");
const openTaskModal = document.getElementById("openTaskModal");
const closeTaskModal = document.getElementById("closeTaskModal");
const modal = document.getElementById("modal");
const openModal = document.getElementById("openModal");
const closeModal = document.getElementById("closeModal");
const form = document.getElementById("employeeForm");
const taskForm = document.querySelector('#taskForm');
const logoutBtn = document.querySelector('.logout-btn');


// CHECK ADMIN AUTHHENTICATED OR NOT...
const sessionCheckForAdmin = async () => {
  const session = await checkUserLoginOrNot();
  if (!session) {
    window.location.href = './index.html';
  }
};

sessionCheckForAdmin();
showLoading("Loading Admin Panal...")


logoutBtn.addEventListener("click", async () => {
  showSpinner();
  await logout()
  sessionCheckForAdmin();
  hideSpinner();
});



// Toggle Sidebar
toggleSidebar.addEventListener('click', () => {
  sidebar.classList.toggle('active');
});

// Toggle Sidebar with close button
closeSidebar.addEventListener('click', () => {
  sidebar.classList.remove('active');
});

// Handle active role
roles.forEach(role => {
  role.addEventListener('click', async (e) => {
    roles.forEach(r => r.classList.remove('active')); 
    role.classList.add('active'); 
    sidebar.classList.remove('active');

    const department = e.target.textContent
    const employeesdata = await getEmployeeDataFromDatabase();

    if (department === 'All Employees') {
        showEmployeeCard(employeesdata);
    }else {
      const departmentEmployeeData = employeesdata.filter((elements) => {
        return elements.employeeData.department === department;
      })

      showEmployeeCard(departmentEmployeeData)
    }
  });
});

document.addEventListener("DOMContentLoaded", () => {
   const roles = document.querySelector('.role');
   roles.click();
})


// Open modal
openModal.addEventListener("click", () => {
  modal.classList.add('active');
});

// Close modal
closeModal.addEventListener("click", () => {
  modal.classList.remove('active');
  form.querySelector('.btn-green').innerHTML = '<span><i class="fa-solid fa-user-plus"></i></span> Add Employee'
  document.querySelector('#email').removeAttribute('readonly');
  document.querySelector('#password').removeAttribute('readonly');
  form.removeAttribute('data-edit-id');
  form.reset();

});

// Close modal on outside click
window.addEventListener("click", (e) => {
  if (e.target === modal) {
    modal.classList.remove('active');
    form.querySelector('.btn-green').textContent = 'Add Employee'
    form.removeAttribute('data-edit-id');
    form.reset();
  }
});


// Open modal
openTaskModal.addEventListener("click", () => {
  taskModal.classList.add('active');
});

// Close modal
closeTaskModal.addEventListener("click", () => {
  taskModal.classList.remove('active');
  taskForm.reset();
});

// Close modal on outside click
window.addEventListener("click", (e) => {
  if (e.target === taskModal) {
    taskModal.classList.remove('active');
  }
});

// Close modal on outside click
window.addEventListener("click", (e) => {
  if (e.target === employeeModal) {
    employeeModal.classList.remove('active');
  }
});


// FORM SUBMITION OR VALIDATION STARTED HERE....
form.addEventListener("submit", async function (event) {
  event.preventDefault();
  
  const form = event.target;
  const editId = form.getAttribute('data-edit-id');
  const roles = document.querySelector('.role');

  // Call reusable validation function
  const isValid = await validateForm(form, editId);
  
  if (editId) {
    document.querySelector('#password').setAttribute('readonly', '');
  }else {
    document.querySelector('#password').removeAttribute('readonly');
  }

  if (editId && isValid) {
    showSpinner();
    const editEmployeeData = await editEmployeeFromDatabase(employeeData, editId);
    showEmployeeCard(editEmployeeData);
    hideSpinner();

    roles.classList.add('active')
    roles.click();
    modal.classList.remove('active');
    document.querySelector('#email').removeAttribute('readonly');
    document.querySelector('#password').removeAttribute('readonly');
    form.querySelector('.btn-green').innerHTML = '<span><i class="fa-solid fa-user-plus"></i></span> Add Employee'
    form.removeAttribute('data-edit-id');
    createToastForNotification('success', 'fa-solid fa-circle-check', 'Success', "Employee updated successfully!");
    form.reset();
    return
  }

  if (isValid) {
    
    showSpinner();
    const getEmployeeData = await createEmployeeDataInDatabase(employeeData);
    showEmployeeCard(getEmployeeData);
    hideSpinner();

    roles.classList.add('active')
    roles.click();
    form.reset();
    modal.classList.remove('active')
    createToastForNotification('success', 'fa-solid fa-circle-check', 'Success', "Employee created successfully!");
    
  }
});


// SHOW EMPLOYEE CARD IN HTML. THAT FUNCTIONALITY STARTED HERE...
const employeeContainer = document.querySelector('.employee-list-card-container');
const showEmployeeCard = (employeeData) => {
  
  employeeContainer.innerHTML = '';
  if (employeeData.length === 0) {
    
    employeeContainer.innerHTML = `<div class="emty-employee">
            <span><i class="fa-solid fa-users-slash"></i></span>
            <h3>No employee has been created so far.</h3>
          </div>`
    employeeContainer.querySelector('.emty-employee').classList.add('active')
  }
  
  showEmailInCreateTask()
  employeeData.forEach(({ id, employeeData }) => {
    
    employeeContainer.innerHTML += `<div class="employee-card"  data-employeeid='${id}' id="employee-card">
                <div class="card-header">
                  <img src="${!employeeData.profilePicture ? "./assets/images/human-img.png" : `${supabaseUrl}/storage/v1/object/public/${employeeData.profilePicture}` }" alt="Profile Picture" class="profile-pic">
                </div>
                <div class="card-body">
                  <h2 class="employee-name">${employeeData.fullName}</h2>
                  <p class="employee-department">Department: ${employeeData.department}</p>
                  <p class="employee-description">
                   ${employeeData.description}
                  </p>
                  <div class="date-div">
                    <p>${getRelativeTime(employeeData.createdAt)}</p>
                  </div>
                </div>
    </div>`

              
  });
            
  employeeContainer.querySelectorAll('.employee-card').forEach((element) => { 
    
    element.addEventListener('click', employeeDetailModel);
  })
};


// make the employeeData into the employeeDetailData...
const employeeDetailModel = async (event) => {
  const id = event.currentTarget.dataset.employeeid;
  
  
  const detailData = await getEmployeeDataFromDatabase();
  const detailEmployeeDataForModel = detailData.find((employee) => employee.id === id);

  showDataInEmployeeDetailModel(detailEmployeeDataForModel)
  
  employeeModal.classList.add('active')
  
};

// SHOW THE EMPLOYEE MODEL WITH CURRENT EMPLOYEE DATA...
const showDataInEmployeeDetailModel = ({ id, employeeData }) => {
  
  employeeModal.innerHTML = `<div class="modal-content employee-detail">
          <span id="closeEmployeeModal" class="close" >&times;</span>
          <div class="cover-video">
            <video src="./assets/videos/cover-video.mp4" muted autoplay loop alt='cover video'></video>
          </div>
          <div class="profile-section">
            <img src="${!employeeData.profilePicture ? "./assets/images/human-img.png" : `${supabaseUrl}/storage/v1/object/public/${employeeData.profilePicture}` }" alt="Profile Picture" class="profile-pic-modal">
            <h1>${employeeData?.fullName}</h1>
            <p>Department  <span>${employeeData?.department}</span></p>
          </div>

          <div class="taskDetail">
            <h2>Employee Task Details:</h2>
            <ul>
                <li><strong>ASSIGN TASK:</strong> <span>${employeeData?.taskCount?.assignTask}</span></li>
                <li><strong>ACCEPTED TASK:</strong> <span>${employeeData?.taskCount?.acceptedTask}</span></li>
                <li><strong>COMPLETED TASK:</strong> <span>${employeeData?.taskCount?.completedTask}</span></li>
                <li><strong>FAILED TASK:</strong> <span>${employeeData?.taskCount?.failedTask}</span></li>
            </ul>
          </div>

          <div class="details">
            <h2>Employee Persnal Information:</h2>
            <ul>
                <li><strong>Email:</strong> ${employeeData?.email}</li>
                <li><strong>Phone:</strong> ${employeeData?.phone}</li>
                <li><strong>Joining Date:</strong> ${employeeData?.joiningDate}</li>
                <li><strong>Salary:</strong> $${employeeData?.salary}</li>
            </ul>
          </div>

          <div class="btns">
            <button class="EditBtn"><span><i class="fa-solid fa-pen-to-square"></i></span> Edit Employee</button>
            <button class="deleteBtn"><span><i class="fa-solid fa-trash"></i></span> Delete Employee</button>
          </div>
    </div>`

  // Close modal
  employeeModal.querySelector('#closeEmployeeModal').addEventListener("click", () => {
    employeeModal.classList.remove('active');
  });

  // DELETE EMPLOYEE FROM UI AND DATABASE
  employeeModal.querySelector('.deleteBtn').addEventListener("click", async (event) => {
    showSpinner();
    const error = await deleteDataFromDatabase(id, employeeData.userId);
    const roles = document.querySelector('.role');
    if (!error) {
      const data = await getEmployeeDataFromDatabase();
      showEmployeeCard(data);
      hideSpinner();
      roles.classList.add('active')
      roles.click();
      employeeModal.classList.remove('active'); 
      createToastForNotification('success', 'fa-solid fa-circle-check', 'Success', "Employee deleted successfully.");    
    }else {
      createToastForNotification('error', 'fa-solid fa-circle-exclamation', 'Error',"There is an error to deleting employee.");
    }
  });

  // EDIT EMPLOYEE FROM UI AND DATABASE
  employeeModal.querySelector('.EditBtn').addEventListener("click", async (event) => {
    form.querySelector('.btn-green').innerHTML = '<span><i class="fa-solid fa-pen-to-square"></i></span> Update Employee'

    employeeModal.classList.remove('active')
    modal.classList.add("active")

    // Pre-fill the form with employee data
    document.querySelector('#fullName').value = employeeData.fullName;
    document.querySelector('#email').value = employeeData.email;
    document.querySelector('#email').setAttribute('readonly', '');
    document.querySelector('#password').value = employeeData.password;
    document.querySelector('#password').setAttribute('readonly', '');
    document.querySelector('#phone').value = employeeData.phone;
    document.querySelector('#joiningDate').value = employeeData.joiningDate;
    document.querySelector('#salary').value = employeeData.salary;
    document.querySelector('#department').value = employeeData.department;
    document.querySelector('#description').value = employeeData.description;

    form.setAttribute('data-edit-id', id);
  });
};


// SHOW ALL EMPLOYEE EMAIL IN CREATE TASK MODEL...
const showEmailInCreateTask = async () => {
  const data = await getEmployeeDataFromDatabase();
  const select = taskForm.querySelector('#employeeEmail');

  select.innerHTML = '';
  select.innerHTML = `<option value="">Select Employee</option>`;
  if (data.length > 0) {
    data.forEach(({employeeData}) => {
      select.innerHTML += `<option value="${employeeData.email}">${employeeData.email}</option>`;
    });
  }
  
};

// CREATE TASK FOR EMPLOYEES TO DOING SOMETHING...
taskForm.addEventListener('submit', async (event) => {
  event.preventDefault();

  const form = event.target;
  const currentEmail = form.querySelector('#employeeEmail').value;
  

  // Validate the form
  
  const isValid = await validateTaskForm(form);

  if (isValid) {
    taskModal.classList.remove("active")
    createToastForNotification('success', 'fa-solid fa-circle-check', 'Success', `${currentEmail} has been assigned a task.`);
    
    taskForm.reset();
  }
  

});




