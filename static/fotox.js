// Flag variable, passed from another page 

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
    const h2text = document.getElementById('h2text');
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
}
    // Handle crystal button click to show progress bar
    const progressBarContainer = document.createElement("div");
    const progressBar = document.createElement("div");

    progressBarContainer.classList.add("progress-container");
    progressBar.classList.add("progress-bar");

    progressBarContainer.appendChild(progressBar);
    document.body.appendChild(progressBarContainer);

    progressBar.style.width = `${0}%`;
    progressBarContainer.style.display = "none";


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


//imaginary image API

async function checkPredictionProgress (predictionId){
    let polling = true;
  
    while (polling) {
      try {
        const response = await fetch(`/replicate/progress?predictionId=${predictionId}`, {
          method: "GET",
        });
  
        if (!response.ok) {
          throw new Error("Failed to fetch prediction progress.");
        }
  
        const data = await response.json();
  
        // Update UI based on the status
        if (data.status === "starting") {
          progressBar.style.width = "25%";
        } else if (data.status === "processing") {
          progressBar.style.width = "50%";
        } else if (data.status === "succeeded") {
          progressBar.style.width = "100%";
          console.log("Prediction succeeded:", data.output);

          const outputUrl = encodeURIComponent(data.output);
          window.location.href = `/index_n?outputUrl=${outputUrl}`;

          polling = false; // Exit the loop
          progressBarContainer.style.display = "none";
        } else if (data.status === "failed") {
          progressBar.style.width = "0%";
          console.error("Prediction failed.");
          polling = false; // Exit the loop
          progressBarContainer.style.display = "none";
        }
  
        // Wait 500 milliseconds before checking again
        await new Promise((resolve) => setTimeout(resolve, 500));
      } catch (error) {
        console.error("Error checking progress:", error.message);
        polling = false; // Stop polling on error
      }
    }
  }





document.getElementById("img_form").addEventListener("submit",async function (e) {
    e.preventDefault(); // Prevent the default form submission

    // Gather form data
    const formData = new FormData(this);
    const data = {
        prompt: formData.get("img_prompt"),
      };
    try {
      const response = await fetch("/replicatepredict", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "CSRF-Token": Cookies.get("XSRF-TOKEN"), // Append CSRF Token
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        alert(`Error: ${errorData.error}`);
        
         
      } else {
        const successData = await response.json();
        console.log(successData)
       
        // Call once to trigger immediately
        predictionId = successData.id;

        // Show progress bar container
        progressBarContainer.style.display = "block";

        // Call the function to check progress
        await checkPredictionProgress(predictionId);
        // progress bar here
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      alert("An error occurred.");
    }

  });