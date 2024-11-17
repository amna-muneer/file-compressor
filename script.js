document.getElementById('compress-btn').addEventListener('click', function() {
    const files = document.getElementById('file-input').files;
    
    if (files.length === 0) {
        document.getElementById('message').innerText = 'Please select files to compress.';
        return;
    }

    // Clear previous download links and messages
    const downloadLinksContainer = document.getElementById('download-links');
    downloadLinksContainer.innerHTML = '';
    document.getElementById('message').innerText = 'Compressing files...';

    // Create a new JSZip instance to hold the files
    const zip = new JSZip();

    for (let i = 0; i < files.length; i++) {
        const file = files[i];
        
        if (file.type.startsWith('image/')) {
            // Handle image compression
            compressImage(file)
                .then(compressedBlob => {
                    zip.file(file.name, compressedBlob);  // Add compressed image to zip
                })
                .catch(error => {
                    console.error('Error compressing image:', error);
                    document.getElementById('message').innerText = 'Error compressing image.';
                });
        } else {
            // For other file types, just add them to the zip (without compression)
            zip.file(file.name, file);
        }
    }

    // Generate the zip file once all files are added
    zip.generateAsync({ type: 'blob' }).then(function(content) {
        const zipUrl = URL.createObjectURL(content);

        // Enable the "Download" button and trigger the download when clicked
        const downloadBtn = document.getElementById('download-btn');
        downloadBtn.style.display = 'inline-block';  // Show the button

        // When the "Download" button is clicked, trigger the download
        downloadBtn.addEventListener('click', function() {
            const a = document.createElement('a');
            a.href = zipUrl;
            a.download = 'compressed_files.zip';  // Default name for the zip file
            a.click();
        });

        document.getElementById('message').innerText = 'Files compressed successfully!';
    }).catch(function(error) {
        document.getElementById('message').innerText = 'Error compressing files.';
        console.error('Error creating zip file:', error);
    });
});

function compressImage(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onload = function(event) {
            const img = new Image();
            img.onload = function() {
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');

                const MAX_WIDTH = 800;
                const MAX_HEIGHT = 800;
                let width = img.width;
                let height = img.height;

                if (width > height) {
                    if (width > MAX_WIDTH) {
                        height = Math.round((height * MAX_WIDTH) / width);
                        width = MAX_WIDTH;
                    }
                } else {
                    if (height > MAX_HEIGHT) {
                        width = Math.round((width * MAX_HEIGHT) / height);
                        height = MAX_HEIGHT;
                    }
                }

                canvas.width = width;
                canvas.height = height;
                ctx.drawImage(img, 0, 0, width, height);

                canvas.toBlob(function(blob) {
                    resolve(blob);
                }, file.type, 0.7); // Reduce image quality
            };
            img.onerror = reject;
            img.src = event.target.result;
        };

        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}
