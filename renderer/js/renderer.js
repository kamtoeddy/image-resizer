const form = document.querySelector("#img-form");
const img = document.querySelector("#img");
const outputPath = document.querySelector("#output-path");
const filename = document.querySelector("#filename");
const widthInput = document.querySelector("#width");
const heightInput = document.querySelector("#height");

const { ipcRenderer, os, path, toast } = modules;

function loadImage(e) {
  const file = e.target.files[0];

  if (!isImageFile(file)) return showToast("Please select an image", false);

  const image = new Image();
  image.src = URL.createObjectURL(file);

  image.onload = function () {
    widthInput.value = this.width;
    heightInput.value = this.height;
  };

  form.style.display = "block";
  filename.innerText = file.name;
  outputPath.innerText = path.join(os.getHomeDir(), "imageresizer");
}

function sendImage(e) {
  e.preventDefault();

  const imageFile = img.files[0],
    width = widthInput.value,
    height = heightInput.value,
    imgPath = imageFile?.path;

  if (!imageFile) return showToast("Please select an image", false);

  if (width === "" || height === "")
    return showToast("Please fill in a height & width", false);

  // send to main using ipcRenderer

  ipcRenderer.send("image:resize", { imgPath, width, height });
}

// listen for "image:resize-done" event
ipcRenderer.on("image:resize-done", () => showToast("Resize complete!"));

/**
 * Checks if provided file is valid
 * @param {File} file
 * @return {boolean}
 */
function isImageFile(file) {
  const acceptedTypes = ["image/gif", "image/png", "image/jpeg"];

  return file && acceptedTypes.includes(file?.["type"]);
}

function showToast(message, success = true) {
  toast({
    text: message,
    duration: 5000,
    close: false,
    style: {
      background: success ? "green" : "red",
      color: "white",
      textAlign: "center",
    },
  });
}

img.addEventListener("change", loadImage);
form.addEventListener("submit", sendImage);
