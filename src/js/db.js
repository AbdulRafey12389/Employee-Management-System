import { showSpinner } from "./utils.js";

// Create a single supabase client for interacting with your database
const supabaseUrl = 'https://blnsduymaghqlgtcznjm.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJsbnNkdXltYWdocWxndGN6bmptIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczNzEyMTcxMiwiZXhwIjoyMDUyNjk3NzEyfQ.zselt0fgOmGWSq87dXf-xm_WmvUVBZTrFp9cfuGtGJ8';
const supabaseClient = supabase.createClient(supabaseUrl, supabaseKey)


// SIGNUP FOR EMPLOYEES...
const signUp = async (email, password) => {
  const { data, error } = await supabaseClient.auth.signUp({
  email,
  password
  });

  return { data, error }

}


const loginAdminAndEmployee = async (email, password) => {
  const { data, error } = await supabaseClient.auth.signInWithPassword({
    email,
    password
  })

  return { data, error }

};

const logout = async () => {
  await supabaseClient.auth.signOut();
};


const checkUserLoginOrNot = async () => {
    const { data, error } = await supabaseClient.auth.getSession()
    return data.session;

};


const  getAllUsers = async () => {
  const { data: { users } } = await supabaseClient.auth.admin.listUsers()
  return users

};


const getCurrentUser = async () => {
  const { data: { user } } = await supabaseClient.auth.getUser()

  return user;

};


const createEmployeeDataInDatabase = async (employeeData) => {
  
  await signUp(employeeData.email, employeeData.password);
  const allUsers = await getAllUsers();
  const CurrentUser =  allUsers.filter((user) => user.email === employeeData.email);
  employeeData.userId = CurrentUser[0].id
  
  await supabaseClient
  .from('EmployeeData')
  .insert({employeeData})

  const getData =  await getEmployeeDataFromDatabase();

  return getData;
  

}


const getEmployeeDataFromDatabase = async () => {
  const { data  } = await supabaseClient
  .from('EmployeeData')
  .select()


  return data;

};




const deleteDataFromDatabase = async (employeeId, userId) => {

  await supabaseClient.auth.admin.deleteUser(userId);


  const { error } = await supabaseClient
  .from('EmployeeData')
  .delete()
  .eq('id', employeeId);

  await getEmployeeDataFromDatabase();

  return error;
  
  
};

const editEmployeeFromDatabase = async (employeeData, employeeId) => {

  await supabaseClient
  .from('EmployeeData')
  .update({employeeData})
  .eq('id', employeeId)

  const data = await getEmployeeDataFromDatabase()
  return data
  
  
};


const createTaskForEmployees = async ({id, employeeData}) => {

  const { error } = await supabaseClient
  .from('EmployeeData')
  .update({employeeData})
  .eq('id', id)

  
};


const updateProfileData = async (userName, image, employeeId) => {
  let fileData = null;
  let errors = null;
  
  if (image) {
  
    const { data, error } = await supabaseClient
    .storage
    .from('images')
    .upload(`${Date.now()}-${image.name}`, image, {
      cacheControl: "3600",
      upsert: false,
    })

    errors = error;
    fileData = data;
  }

  const currentEmployee = await getEmployeeDataFromDatabase();

  const findEmployee = currentEmployee.find((data) => data.id === employeeId);

  if (image) {
    findEmployee.employeeData.profilePicture = fileData.fullPath;   
  }

  findEmployee.employeeData.fullName = userName;

  await editEmployeeFromDatabase(findEmployee.employeeData, employeeId);

  return {findEmployee, errors};
  
  

};




export {
    createEmployeeDataInDatabase,
    getEmployeeDataFromDatabase,
    deleteDataFromDatabase,
    editEmployeeFromDatabase,
    createTaskForEmployees,
    loginAdminAndEmployee,
    checkUserLoginOrNot,
    getCurrentUser,
    logout,
    updateProfileData,
    supabaseUrl
}

