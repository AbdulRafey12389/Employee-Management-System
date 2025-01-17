const registerBtn = document.getElementById('register')
const container = document.getElementById('container')
const loginBtn = document.getElementById('login')

console.log(registerBtn,container,loginBtn);

registerBtn.addEventListener('click',()=>{
    container.classList.add('active')
})

login.addEventListener('click',()=>{
    container.classList.remove('active')
})
