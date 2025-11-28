let originalImage = null;
let processedImageData = null;

const upload = document.getElementById("upload");
const brightnessSlider = document.getElementById("brightness");
const valueLabel = document.getElementById("value");
const downloadBtn = document.getElementById("downloadBtn");
const resetBtn = document.getElementById("resetBtn");
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const fileName = document.getElementById("fileName");
const placeholder = document.getElementById("placeholder");
const canvasContainer = document.getElementById("canvasContainer");

// Load image
upload.addEventListener("change", function(e) {
    const file = e.target.files[0];
    if (!file) return;
    
    fileName.textContent = file.name;
    const img = new Image();
    
    img.onload = function () {
        // Calculate canvas size to fit container while maintaining aspect ratio
        const maxWidth = canvasContainer.clientWidth - 40;
        const maxHeight = canvasContainer.clientHeight - 40;
        let width = img.width;
        let height = img.height;
        
        if (width > maxWidth) {
            height = (height * maxWidth) / width;
            width = maxWidth;
        }
        if (height > maxHeight) {
            width = (width * maxHeight) / height;
            height = maxHeight;
        }
        
        canvas.width = width;
        canvas.height = height;
        originalImage = img;
        ctx.drawImage(img, 0, 0, width, height);
        processedImageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        
        // Hide placeholder and enable buttons
        placeholder.classList.add("hidden");
        downloadBtn.disabled = false;
        resetBtn.disabled = false;
        
        // Reset brightness slider
        brightnessSlider.value = 0;
        valueLabel.textContent = "0";
    };
    
    img.onerror = function() {
        alert("Unable to load image. Please select another file. / 이미지를 불러올 수 없습니다. 다른 파일을 선택해주세요.");
        fileName.textContent = "No file selected / 선택된 파일 없음";
    };
    
    img.src = URL.createObjectURL(file);
});

// Brightness adjustment
brightnessSlider.addEventListener("input", function () {
    const value = parseInt(this.value);
    valueLabel.textContent = value;
    if (!originalImage) return;
    
    applyFilters();
});

// Reset function
function resetImage() {
    if (!originalImage) return;
    
    brightnessSlider.value = 0;
    valueLabel.textContent = "0";
    applyFilters();
}

// Download image
function downloadImage() {
    if (!canvas || !originalImage) return;
    
    const link = document.createElement("a");
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
    link.download = `brightness-edited-${timestamp}.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
}

// Apply brightness filter
function applyFilters() {
    if (!originalImage) return;
    
    // Draw original image at current canvas size
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(originalImage, 0, 0, canvas.width, canvas.height);
    
    let imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    let data = imgData.data;
    
    // Apply brightness
    const brightnessValue = parseInt(brightnessSlider.value);
    for (let i = 0; i < data.length; i += 4) {
        data[i]     = Math.min(255, Math.max(0, data[i] + brightnessValue));
        data[i + 1] = Math.min(255, Math.max(0, data[i + 1] + brightnessValue));
        data[i + 2] = Math.min(255, Math.max(0, data[i + 2] + brightnessValue));
    }
    
    ctx.putImageData(imgData, 0, 0);
    processedImageData = imgData;
}

// Event listeners
downloadBtn.addEventListener("click", downloadImage);
resetBtn.addEventListener("click", resetImage);

// Handle window resize
let resizeTimeout;
window.addEventListener("resize", function() {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(function() {
        if (originalImage) {
            // Recalculate canvas size on resize
            const maxWidth = canvasContainer.clientWidth - 40;
            const maxHeight = canvasContainer.clientHeight - 40;
            let width = originalImage.width;
            let height = originalImage.height;
            
            if (width > maxWidth) {
                height = (height * maxWidth) / width;
                width = maxWidth;
            }
            if (height > maxHeight) {
                width = (width * maxHeight) / height;
                height = maxHeight;
            }
            
            canvas.width = width;
            canvas.height = height;
            applyFilters();
        }
    }, 250);
});

