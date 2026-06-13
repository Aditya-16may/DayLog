const tx = document.getElementById('postInput');
const openBtn = document.getElementById("open-upload");
const closeBTn = document.getElementById("close-modal-btn");
const uploadForm = document.getElementById("upload-form");
const fileInput = document.getElementById("file-input")
const modal = document.getElementById("upload-modal")
const fileNameDisplay = document.getElementById("file-name-display")

openBtn.addEventListener("click",()=>{
    modal.classList.remove("hidden");
    modal.classList.add("flex");
})


closeBTn.addEventListener("click",()=>{
    modal.classList.remove("flex");
    modal.classList.add("hidden");

    uploadForm.reset();
    fileNameDisplay.textContent = "No file chosen";
    fileNameDisplay.className = "bg-zinc-800 text-zinc-400 text-sm";
})

fileInput.addEventListener("change", function() {
    if (this.files && this.files.length > 0) {
        fileNameDisplay.textContent = this.files[0].name;
        fileNameDisplay.classList.remove("text-zinc-400");
        fileNameDisplay.classList.add("text-olive-400", "font-medium"); 
    } else {
        fileNameDisplay.textContent = "No file chosen";
        fileNameDisplay.classList.remove("text-olive-400", "font-medium");
        fileNameDisplay.classList.add("text-zinc-400");
    }
});


tx.addEventListener("input", function () {
    this.style.height = "auto";
    this.style.height = this.scrollHeight + "px";
})