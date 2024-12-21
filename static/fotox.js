// Flag variable, passed from another page 
async function loadNames() {
  try {
    const response = await fetch("/fetch-names", { method: "GET", credentials: "include" }); // Include cookies
    const data = await response.json();

    if (response.ok) {
      const nameList = document.querySelector(".dropdown-content");

      // Clear existing content
      nameList.innerHTML = "";

      // Add names as <a> elements
      data.names.forEach((name) => {
        const nameLink = document.createElement("a");
        nameLink.href = "#";
        nameLink.textContent = name;
        nameList.appendChild(nameLink);
      });

      const nameLink = document.createElement("a");
      nameLink.href = "#";
      nameLink.textContent = "create new";
      nameList.appendChild(nameLink);
    } else {
      console.error("Error fetching names:", data.error);
      alert("Failed to load names: " + data.error);
    }
  } catch (error) {
    console.error("Error connecting to server:", error);
    alert("An error occurred while loading names.");
  }
}

window.onload = function () {
  let flag = localStorage.getItem("flag"); // Change this value to test different behaviors (0 or 1)
  const btnImg = document.getElementById("btn-img");
  const uploadContainer = document.querySelector(".upload-box-container");
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
  const training_name = document.getElementById("training-name");
  crystalBtn.disabled = true;

  let uploadedFile = null;
  if (flag === "0") {
    // Case: Imaginary
    img_form.style.display = "block";
    per_form.style.display = "none";
    image.src = "./asset/img/Fox.png";


  } else if (flag === "1") {       // Case: Personalize
    loadNames()
    dropdownContent.style.display = "none";
    uploadContainer.style.display = "none";
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
      if (option == "create new") {
        crystalBtn.disabled = false;
        uploadContainer.style.display = "flex";
        btnImg.textContent = "Create New";
        document.getElementById("training-name").placeholder = "Enter Model Name";
      } else {
        crystalBtn.disabled = false;
        btnImg.textContent = option;
        uploadContainer.style.display = "none";
        document.getElementById("training-name").placeholder = "What do you want to generate?";
      }
      dropdownContent.style.display = "none";
    });

    // Handle upload button click
    document.getElementById("btn-upload").addEventListener("click", () => {
      const fileInput = document.createElement("input");
      fileInput.type = "file";
      fileInput.style.display = "none";
      fileInput.accept = ".zip";
      fileInput.name = "uploadedFile"
      fileInput.click();
      per_form.append(fileInput);

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


  }

  // Handle crystal button click to show progress bar
  let isProgressBarActive = false;

};



// Progress bar styles
const style = document.createElement("style");
style.innerHTML = 
  ` .progress-container {
        position: fixed;
        bottom: 20px;
        left: 50px;
        width: 300px;
        height: 20px;
        background-color: #ddd;
        border-radius: 10px;
        overflow: hidden;
        z-index: 1000;
    }

    #progressBar_Text{
    text-align: center;
    color:white;
    }

    .progress-bar {
        height: 100%;
        background-color: #4F378B;
        width: 0%;
        color:white;
        transition: width 0.1s;
    }
    .progress-container-small {
        position: fixed;
        bottom: 20px;
        left: 20px;
        width: 300px;
        height: 5px;
        background-color: #ddd;
        border-radius: 10px;
        overflow: hidden;
        z-index: 1000;
    }

    .progress-bar-small {
        height: 100%;
        background-color: #4F378B;
        width: 0%;
        transition: width 0.1s;
    }`

    
    
;
document.head.appendChild(style);



const progressBarContainer = document.createElement("div");
const progressBar_Text = document.createElement("h6");
const progressBar = document.createElement("div");

progressBarContainer.classList.add("progress-container");
progressBar.classList.add("progress-bar");
progressBar_Text.id = "progressBar_Text";

progressBar_Text.style.display = "none";
progressBar_Text.style.color = "black";
progressBar_Text.style.fontSize = "0.7rem";

progressBarContainer.appendChild(progressBar_Text);
progressBarContainer.appendChild(progressBar);



document.body.appendChild(progressBarContainer);


// Second progress bar (small)
const progressBarContainerSmall = document.createElement("div");
const progressBarSmall = document.createElement("div");

progressBarContainerSmall.classList.add("progress-container-small");
progressBarSmall.classList.add("progress-bar-small");

progressBarContainerSmall.appendChild(progressBarSmall);

document.body.appendChild(progressBarContainerSmall);


progressBar.style.width = `${0}%`;
progressBarContainer.style.display = "none";
progressBarContainerSmall.style.display = "none";



async function checkPredictionProgress(predictionId, model_name) {
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
        progressBarSmall.style.width = "25%";
      } else if (data.status === "processing") {
        progressBarSmall.style.width = "50%";
      } else if (data.status === "succeeded") {
        progressBarSmall.style.width = "100%";
        console.log("Prediction succeeded:", data.output);

        const outputUrl = encodeURIComponent(data.output);
        const promptParam = encodeURIComponent(data.prompt); // Encode the prompt to include in the URL
        // Redirect to the new page with both outputUrl and prompt as query parameters
        const model = encodeURIComponent(model_name);

        window.location.href = `/index_n?outputUrl=${outputUrl}&prompt=${promptParam}&model=${model}`;
        progressBarContainerSmall.style.display = "none";
        polling = false; // Exit the loop
      } else if (data.status === "failed") {
        progressBar.style.width = "0%";
        console.error("Prediction failed.");
        polling = false; // Exit the loop
      }

      // Wait 500 milliseconds before checking again
      await new Promise((resolve) => setTimeout(resolve, 500));
    } catch (error) {
      console.error("Error checking progress:", error.message);
      polling = false; // Stop polling on error
    }
  }
}


// Img images
document.getElementById("img_form").addEventListener("submit", async function (e) {
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
      progressBarContainerSmall.style.display = "block";

      // Call the function to check progress
      await checkPredictionProgress(predictionId, null);
      // progress bar here
    }
  } catch (error) {
    console.error("Error submitting form:", error);
    alert("An error occurred.");
  }
});



// Personal images 

// Handle form submission
per_form.addEventListener("submit", async (e) => {
  e.preventDefault();
  selected_value = document.getElementById("btn-img").innerText;

  if (selected_value == "Create New") {

    document.getElementById("per_crystal").disabled = true;
    document.querySelector(".upload-box-container").style.display = "none";


    const formData = new FormData(per_form);

    try {
      const response = await fetch("/per_req", {
        method: "POST",
        headers: {
          "CSRF-Token": Cookies.get("XSRF-TOKEN"), // Append CSRF Token
        },
        body: formData,
      });

      const result = await response.json();

      if (response.ok) {
        alert("Success: " + result.message);
        const trainingId = result.training_id; // Replace with your training ID

        async function fetchTrainingLogs() {
          try {
            const response = await fetch(`/training_status/${trainingId}`);
            const data = await response.json();

            if (data.error) {
              console.error("Error fetching training logs:", data.error);
              return;
            }

            progressBar_Text.style.display = "block";
            progressBarContainer.style.display = "block";

            // Extract and parse progress logs
            const logs = data.progressLogs || "";
            const progressRegex = /flux_train_replicate:\s+(\d+)%\|.*?\|\s+(\d+)\/(\d+)/g;

            let latestProgress = { percentage: 0, currentStep: 0, totalSteps: 0 };
            let match;

            // Find the latest match for progress
            while ((match = progressRegex.exec(logs)) !== null) {
              latestProgress = {
                percentage: parseInt(match[1], 10), // Extract percentage
                currentStep: parseInt(match[2], 10), // Extract current step
                totalSteps: parseInt(match[3], 10), // Extract total steps
              };
            }

            // Log the progress or display it
            console.log(`Progress: ${latestProgress.percentage}%`);
            console.log(`Step: ${latestProgress.currentStep}/${latestProgress.totalSteps}`);

            // Handle case when currentStep is 0
            if (latestProgress.currentStep === 0) {

              progressBar_Text.textContent = "Processing and getting the data ready...";
              progressBar.style.width = `${0}%`;
            } else {
              // Update UI with progress
              progressBar.style.width = `${latestProgress.percentage}%`;
              progressBar_Text.textContent = `${latestProgress.percentage}% (Step ${latestProgress.currentStep}/${latestProgress.totalSteps})`;

            }

            // Handle status
            if (data.status === "succeeded") {
              clearInterval(progressInterval);
              progressBar_Text.style.display = "none";
              progressBarContainer.style.display = "none";
              document.getElementById("per_crystal").disabled = false;

            } else if (data.status === "failed") {
              clearInterval(progressInterval);
              progressBar_Text.textContent = "Training Failed!";

            }
          } catch (error) {
            console.error("Error fetching training logs:", error);
          }
        }

        // Poll every 5 seconds
        const progressInterval = setInterval(fetchTrainingLogs, 2000);
        fetchTrainingLogs(); // Fetch immediately
      } else {
        alert("Error: " + result.error);
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      alert("Failed to submit form.");
    }
  } else {
    document.getElementById("per_crystal").disabled = true;
    // Gather form data
    const formData = new FormData(per_form);
    const data = {
      prompt: formData.get("per_prompt"),
      modelname: selected_value
    };
    try {
      const response = await fetch("/replicatePersonalpredict", {
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
        await checkPredictionProgress(predictionId, selected_value);
        // progress bar here
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      alert("An error occurred.");
    }
  }
});