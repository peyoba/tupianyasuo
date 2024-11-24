// 获取DOM元素
const uploadArea = document.getElementById('uploadArea');
const fileInput = document.getElementById('fileInput');
const qualitySlider = document.getElementById('qualitySlider');
const compressBtn = document.getElementById('compressBtn');

// 拖拽上传处理
uploadArea.addEventListener('dragover', (e) => {
    e.preventDefault();
    uploadArea.classList.add('dragover');
});

uploadArea.addEventListener('dragleave', () => {
    uploadArea.classList.remove('dragover');
});

uploadArea.addEventListener('drop', (e) => {
    e.preventDefault();
    uploadArea.classList.remove('dragover');
    handleFiles(e.dataTransfer.files);
});

// 点击上传处理
fileInput.addEventListener('change', (e) => {
    handleFiles(e.target.files);
});

// 处理上传的文件
function handleFiles(files) {
    const file = files[0];
    if (!file.type.startsWith('image/')) {
        alert('请上传图片文件！');
        return;
    }

    // 显示原图预览
    const reader = new FileReader();
    reader.onload = (e) => {
        displayOriginalImage(e.target.result, file);
    };
    reader.readAsDataURL(file);
}

// 显示原图
function displayOriginalImage(dataUrl, file) {
    const img = new Image();
    img.src = dataUrl;
    img.onload = () => {
        // 显示原图信息
        const originalImage = document.querySelector('.original-image .image-container');
        originalImage.innerHTML = `
            <img src="${dataUrl}" class="preview-image" data-original-size="${file.size}">
        `;
        document.querySelector('.original-image .image-info').innerHTML = `
            <p>文件名: ${file.name}</p>
            <p>原始大小: ${(file.size / 1024).toFixed(2)} KB</p>
            <p>尺寸: ${img.width} x ${img.height}</p>
        `;
    };
}

// 压缩图片
function compressImage(dataUrl, quality) {
    return new Promise((resolve) => {
        const img = new Image();
        img.onload = () => {
            const canvas = document.createElement('canvas');
            canvas.width = img.width;
            canvas.height = img.height;
            
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0);
            
            // 压缩图片
            canvas.toBlob((blob) => {
                const compressedUrl = URL.createObjectURL(blob);
                resolve({
                    url: compressedUrl,
                    size: blob.size,
                    width: img.width,
                    height: img.height
                });
            }, 'image/jpeg', quality);
        };
        img.src = dataUrl;
    });
}

// 压缩按钮点击事件
compressBtn.addEventListener('click', async () => {
    const originalImage = document.querySelector('.original-image .image-container img');
    if (!originalImage) {
        alert('请先上传图片！');
        return;
    }

    const quality = qualitySlider.value / 100;
    const result = await compressImage(originalImage.src, quality);
    
    // 计算压缩比例
    const originalSize = parseFloat(originalImage.dataset.originalSize);
    const compressionRatio = ((originalSize - result.size) / originalSize * 100).toFixed(1);
    
    // 显示压缩后的图片和详细信息
    document.querySelector('.compressed-image .image-container').innerHTML = `
        <img src="${result.url}" class="preview-image">
    `;
    document.querySelector('.compressed-image .image-info').innerHTML = `
        <p>压缩后大小: ${(result.size / 1024).toFixed(2)} KB</p>
        <p>尺寸: ${result.width} x ${result.height}</p>
        <p>压缩率: 减小了 ${compressionRatio}%</p>
        <button onclick="downloadImage('${result.url}')" class="button">
            下载压缩后的图片
        </button>
    `;
});

// 改进下载函数
function downloadImage(url, fileName) {
    fetch(url)
        .then(response => response.blob())
        .then(blob => {
            const blobUrl = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = blobUrl;
            link.download = fileName;
            
            // 添加下载反馈
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            
            // 清理 Blob URL
            setTimeout(() => {
                window.URL.revokeObjectURL(blobUrl);
            }, 100);

            // 显示下载成功提示
            showDownloadSuccess();
        })
        .catch(error => {
            console.error('下载出错:', error);
            alert('下载失败，请重试');
        });
}

// 添加下载成功提示函数
function showDownloadSuccess() {
    const successMessage = document.createElement('div');
    successMessage.className = 'download-success';
    successMessage.textContent = '✅ 下载成功！';
    
    document.body.appendChild(successMessage);
    
    // 3秒后移除提示
    setTimeout(() => {
        successMessage.style.opacity = '0';
        setTimeout(() => {
            document.body.removeChild(successMessage);
        }, 300);
    }, 3000);
} 