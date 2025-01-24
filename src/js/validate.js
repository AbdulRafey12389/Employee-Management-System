import { createEmployeeDataInDatabase, createTaskForEmployees, getEmployeeDataFromDatabase } from "./db.js";
import { createToastForNotification, hideSpinner, showSpinner } from "./utils.js";



const validateForm = async function (form, editId) {
  const elements = form.elements;
  let isValid = true;

  for (let element of elements) {
    // Skip validation for buttons and non-required fields
    if (element.type === "submit" || element.type === "button") {
      continue;
    }

    // Check if the field is empty
    if (!element.value.trim()) {
      isValid = false;
      createToastForNotification('error', 'fa-solid fa-circle-exclamation', 'Error', `${element.name} ${element.name === 'department' ? 'selection' : '' } is required.`);
    }

    // Additional validations (e.g., email format, phone number)
    if (element.type === "email" && element.value.trim()) {
      if (!isValidEmail(element.value)) {
        isValid = false;
        createToastForNotification('error', 'fa-solid fa-circle-exclamation', 'Error', "Invalid email address.");
       
      }

      if (!editId) {
        const isEMailSomeORnot = await isEmailSome(element.value)  
  
        if(isEMailSomeORnot) {
          isValid = false;
          createToastForNotification('error', 'fa-solid fa-circle-exclamation', 'Error', "Email already exists try another email.");
        }
      }

    }

    if (element.name === "password" && element.value.trim()) {
      if (!isValidPassword(element.value)) {
        isValid = false;
        createToastForNotification('error', 'fa-solid fa-circle-exclamation', 'Error', "Password must be at least 8 characters long.");
      }
    }

    if (element.name === "phoneNumber" && element.value.trim()) {
      if (!isValidPhoneNumber(element.value)) {
        isValid = false;
        createToastForNotification('error', 'fa-solid fa-circle-exclamation', 'Error',"Invalid phone number.");
      }
    }
    
}

  

  if (isValid) {
    saveFormData(form)
  }
  
  return isValid;
}


// Helper function for email validation
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Password validation function
function isValidPassword(password) {
  return password.length >= 8; // Password must be at least 8 characters long
}

// Helper function for phone number validation
function isValidPhoneNumber(phone) {
  const phoneRegex = /^[0-9]{10}$/; // Adjust this regex for your phone number format
  return phoneRegex.test(phone);
}

// checkEMail is not same...
async function isEmailSome (email) {
  const data = await getEmployeeDataFromDatabase()
  let isEMailSomeORnot = null;
  const isEMailSomeCheck = data.find(({employeeData}) => employeeData.email === email);

  if (typeof(isEMailSomeCheck) === 'object') {
    isEMailSomeORnot = true
  }else {
    isEMailSomeORnot = false;
  }
  
  return isEMailSomeORnot
  
  
}


// Save form data into the global object
const employeeData = {}
function saveFormData(form) {

  const formData = new FormData(form);

  // Populate the global employeeData object
  formData.forEach((value, key) => {
    employeeData[key] = value.trim();
  });

  // Add additional processing if needed
  employeeData.createdAt = new Date().getTime();
  employeeData.profilePicture = null
  employeeData.tasks = [];
  employeeData.taskCount = {
    assignTask: employeeData.tasks.length,
    acceptedTask: 0,
    failedTask: 0,
    completedTask: 0
  }
}




// validate Create Task form
async function validateTaskForm(form) {
  const elements = form.elements;
  let isValid = true;

  for (let element of elements) {
    // Skip validation for buttons and non-required fields
    if (element.type === "submit" || element.type === "button") {
      continue;
    }

    // Check if the field is empty
    if (!element.value.trim()) {
      console.log("rennnn");
      
      isValid = false;
      createToastForNotification('error', 'fa-solid fa-circle-exclamation', 'Error', `${element.name} ${element.name === 'Employee email' ? 'selection' : '' } is required.`);
    }

  } 

  if (isValid) {
    await saveTaskFormData(form)
  }


  return isValid

}



async function saveTaskFormData(formdata) {
  
  const taskEmail = formdata.querySelector('#employeeEmail').value

  const taskData = {
    taskId: Date.now().toString(),
    taskTitle: formdata.querySelector('#taskTitle').value,
    taskDescription: formdata.querySelector('#taskDescription').value,
  }

  showSpinner()

  const data = await getEmployeeDataFromDatabase();

  const updatedEmployeData = data.find(({employeeData}) => employeeData.email === taskEmail);
  
  updatedEmployeData.employeeData.tasks.push(taskData);

  updatedEmployeData.employeeData.taskCount.assignTask = updatedEmployeData.employeeData.tasks.length;

  hideSpinner();
  

  await createTaskForEmployees(updatedEmployeData);

}


export {
    validateForm,
    employeeData,
    validateTaskForm,
}