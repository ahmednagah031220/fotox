// Flag variable, passed from another page 
// Initialize the page based on the flag value
window.onload = function () {
    let flag = localStorage.getItem("flag"); // Change this value to test different behaviors (0 or 1)
    const btnImg = document.getElementById("btn-img");
    const uploadContainer = document.querySelector(".upload-box-container");
    const idContainer = document.querySelector(".id-container"); // Select id-container
    const image = document.getElementById("main-image");
    const crystalBtn = document.getElementById("per_crystal");
    const img_crystal = document.getElementById("img_crystal");
    const dropdownContent = document.querySelector(".dropdown-content");
    const uploadIcon = document.getElementById("upload-icon");
    const header_text = document.getElementById('title-text');
    const dropdown_icon = document.getElementById("dropdown-icon");
    const img_form = document.getElementById("img_form");
    const per_form = document.getElementById("per_form");
    
    let uploadedFile = null;
    if (flag === "0") {
        // Case: Imaginary
        img_form.style.display = "block";
        per_form.style.display = "none";  
        image.src = "./asset/img/Fox.png";

    } else if (flag === "1") {       // Case: Personalize
 
        dropdownContent.style.display = "none"; 
        uploadContainer.style.display = "none"; 
        idContainer.style.display = "none";
        img_form.style.display = "none";
        per_form.style.display = "block";   
        image.src = './asset/img/person.png';

        // Toggle dropdown visibility when clicking btn-img
        btnImg.addEventListener("click", () => {
            if (dropdownContent.style.display === "none") {
                dropdownContent.style.display = "block";
            } else {
                dropdownContent.style.display = "none"; 
            }
        });

        // Hide dropdown menu if clicking outside
        document.addEventListener("click", (event) => {
            if (!btnImg.contains(event.target) && !dropdownContent.contains(event.target)) {
                dropdownContent.style.display = "none"; 
            }
        });

        // Add event listener for dropdown menu clicks
        dropdownContent.addEventListener("click", (event) => {
            const option = event.target.textContent;
            if (option === "create new") {
                uploadContainer.style.display = "flex"; 
                idContainer.style.display = "none"; 
                btnImg.textContent = "Create New";
            } else {
                btnImg.textContent = option; 
                uploadContainer.style.display = "none"; 
                idContainer.style.display = "flex"; 
            }
            dropdownContent.style.display = "none"; 
        });

        // Handle upload button click
        document.getElementById("btn-upload").addEventListener("click", () => {
            const fileInput = document.createElement("input");
            fileInput.type = "file";
            fileInput.accept = ".zip";  
            fileInput.click();
        
            fileInput.addEventListener("change", () => {
                uploadedFile = fileInput.files[0]; 
                if (uploadedFile) {
                    const isZipFile = uploadedFile.type === "application/zip" || uploadedFile.name.endsWith(".zip");
        
                    if (!isZipFile) {
                        alert("Please upload a valid .zip file.");
                        uploadedFile = null;
                        return;
                    }

                } else {
                    alert("No file selected. Please upload a .zip file.");
                }
            });
        });
        
        // Handle upload-icon click
        uploadIcon.addEventListener("click", () => {
            if (!uploadedFile) {
                alert("Please upload a .zip file first.");
                return; 
            }
        
            // Simulate processing
            uploadIcon.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i>';
            setTimeout(() => {
                uploadIcon.innerHTML = '<i class="fas fa-check"></i>';
            }, 2000); 
        });
        

        
        idContainer.addEventListener("click", () => {
            const idValue = parseInt(idInput.value); // Parse the input value
            if (idValue < 0) {
                alert("ID should be a positive number");
            }
        });
    }

    // Handle crystal button click to show progress bar
    let isProgressBarActive = false;
    function showProgress(){
        if (isProgressBarActive) return; 

        isProgressBarActive = true; 

        // Create progress bar
        const progressBarContainer = document.createElement("div");
        const progressBar = document.createElement("div");

        progressBarContainer.classList.add("progress-container");
        progressBar.classList.add("progress-bar");
        progressBarContainer.appendChild(progressBar);
        document.body.appendChild(progressBarContainer);

        // Simulate loading
        let width = 0;
        const interval = setInterval(() => {
            if (width >= 100) {
                clearInterval(interval);
                progressBarContainer.remove(); 
                isProgressBarActive = false; 
            } else {
                width++;
                progressBar.style.width = `${width}%`;
            }
        }, 50);
    }


    img_crystal.addEventListener("click", () => {
        showProgress(); 
    });
    crystalBtn.addEventListener("click", () => {
        showProgress();
    });
};


// Progress bar styles
const style = document.createElement("style");
style.innerHTML = `
    .progress-container {
        position: fixed;
        bottom: 20px;
        left: 20px;
        width: 300px;
        height: 20px;
        background-color: #ddd;
        border-radius: 10px;
        overflow: hidden;
        z-index: 1000;
    }

    .progress-bar {
        height: 100%;
        background-color: #4F378B;
        width: 0%;
        transition: width 0.1s;
    }
`;
document.head.appendChild(style);
