document.getElementById("reg_form").addEventListener("submit", function(event){
    let reg_password = document.getElementById("reg_password").value
    let reg_repeat_password = document.getElementById("reg_repeat_password").value
    if(reg_password != reg_repeat_password)
    {
        event.preventDefault()
        document.getElementById("error").style.visibility = "visible"
    }
});