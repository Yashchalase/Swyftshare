const dropZone = document.querySelector(".drop-zone");
const fileInput = document.querySelector("#fileInput");
const browseBtn = document.querySelector("#browseBtn");

const bgProgress = document.querySelector(".bg-progress");
const progressPercent = document.querySelector("#progressPercent");
const progressContainer = document.querySelector(".progress-container");
const progressBar = document.querySelector(".progress-bar");
const status = document.querySelector(".status");

const sharingContainer = document.querySelector(".sharing-container");
const copyURLBtn = document.querySelector("#copyURLBtn");
const fileURL = document.querySelector("#fileURL");
const emailForm = document.querySelector("#emailForm");

const toast = document.querySelector(".toast");

const baseURL = "http://localhost:3000";
const uploadURL = `${baseURL}/api/files`;
const emailURL = `${baseURL}/api/files/send`;

const maxAllowedSize = 100 * 1024 * 1024; // 100 MB

browseBtn.addEventListener("click", () => fileInput.click());

dropZone.addEventListener("dragover", (e) => {
  e.preventDefault();
  dropZone.classList.add("dragged");
});

dropZone.addEventListener("dragleave", () => {
  dropZone.classList.remove("dragged");
});

dropZone.addEventListener("drop", (e) => {
  e.preventDefault();
  dropZone.classList.remove("dragged");

  const files = e.dataTransfer.files;
  if (files.length === 1) {
    if (files[0].size <= maxAllowedSize) {
      fileInput.files = files;
      uploadFile();
    } else {
      showToast("Max file size is 100MB");
    }
  } else {
    showToast("Please upload only one file");
  }
});

fileInput.addEventListener("change", () => {
  if (fileInput.files.length) {
    if (fileInput.files[0].size <= maxAllowedSize) {
      uploadFile();
    } else {
      showToast("Max file size is 100MB");
      fileInput.value = "";
    }
  }
});

const uploadFile = () => {
  const files = fileInput.files;
  if (!files.length) return;

  const formData = new FormData();
  formData.append("myfile", files[0]);

  progressContainer.style.display = "block";

  const xhr = new XMLHttpRequest();

  xhr.upload.onprogress = (event) => {
    const percent = Math.round((100 * event.loaded) / event.total);
    progressPercent.innerText = percent;
    const scaleX = `scaleX(${percent / 100})`;
    bgProgress.style.transform = scaleX;
    progressBar.style.transform = scaleX;
  };

  xhr.onreadystatechange = () => {
    if (xhr.readyState === XMLHttpRequest.DONE) {
      onFileUploadSuccess(xhr.responseText);
    }
  };

  xhr.upload.onerror = () => {
    showToast(`Error uploading file.`);
    fileInput.value = "";
  };

  xhr.open("POST", uploadURL);
  xhr.send(formData);
};

const onFileUploadSuccess = (res) => {
  try {
    const data = JSON.parse(res);
    const url = data.file;

    if (!url) {
      showToast("Upload failed: No file URL returned");
      return;
    }

    fileInput.value = "";
    status.innerText = "Uploaded";
    emailForm.querySelector("button").disabled = false;
    emailForm.querySelector("button").innerText = "Send";

    progressContainer.style.display = "none";
    sharingContainer.style.display = "block"; // ✅ KEEP it visible

    fileURL.value = url;
    console.log("Uploaded file URL:", url);
  } catch (err) {
    showToast("Error parsing server response");
    console.error("Upload error:", err);
  }
};

emailForm.addEventListener("submit", (e) => {
  e.preventDefault();

  const sendBtn = emailForm.querySelector("button");
  sendBtn.disabled = true;
  sendBtn.innerText = "Sending";

  const url = fileURL.value;
  const uuid = url.split("/").pop();

  const formData = {
    uuid,
    emailTo: emailForm.elements["to-email"].value,
    emailFrom: emailForm.elements["from-email"].value,
  };

  fetch(emailURL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(formData),
  })
    .then((res) => res.json())
    .then((data) => {
      if (data.success) {
        showToast("Email Sent!");
        emailForm.reset(); // ✅ Just reset form, don’t hide container
        sendBtn.disabled = false;
        sendBtn.innerText = "Send";
      } else {
        showToast("Failed to send email");
        sendBtn.disabled = false;
        sendBtn.innerText = "Send";
      }
    })
    .catch((err) => {
      console.error("Email error:", err);
      showToast("Something went wrong");
      sendBtn.disabled = false;
      sendBtn.innerText = "Send";
    });
});

copyURLBtn.addEventListener("click", () => {
  fileURL.select();
  document.execCommand("copy");
  showToast("Copied to clipboard");
});

fileURL.addEventListener("click", () => fileURL.select());

let toastTimer;
const showToast = (msg) => {
  clearTimeout(toastTimer);
  toast.innerText = msg;
  toast.classList.add("show");
  toastTimer = setTimeout(() => {
    toast.classList.remove("show");
  }, 2000);
};
