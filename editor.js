document.addEventListener('DOMContentLoaded', () => {
    // Set default date
    const dateInput = document.getElementById('post-date');
    if (dateInput) {
        dateInput.valueAsDate = new Date();
    }

    // Initialize EasyMDE
    let easyMDE;
    const textArea = document.getElementById('md-editor');
    if (textArea) {
        easyMDE = new EasyMDE({
            element: textArea,
            spellChecker: false,
            autofocus: true,
            status: ['lines', 'words', 'cursor'],
            placeholder: "Write your masterpiece here...",
            renderingConfig: {
                singleLineBreaks: false,
                codeSyntaxHighlighting: true,
            }
        });
    }

    // Handle Generation
    const generateBtn = document.getElementById('generate-btn');
    const outputSection = document.getElementById('output-section');
    const jsonOutput = document.getElementById('json-output');

    if (generateBtn) {
        generateBtn.addEventListener('click', () => {
            const title = document.getElementById('post-title').value.trim();
            const summary = document.getElementById('post-summary').value.trim();
            const date = document.getElementById('post-date').value;
            const content = easyMDE ? easyMDE.value().trim() : '';

            if (!title || !content) {
                alert('Title and Content are required!');
                return;
            }

            // Create URL-friendly ID
            const id = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

            const postObject = {
                id,
                title,
                date,
                summary,
                content
            };

            // Format as string to include inside the array
            // Adding a trailing comma makes it easier to paste at the start of the posts array
            const jsonString = JSON.stringify(postObject, null, 4) + ",";

            jsonOutput.textContent = jsonString;
            outputSection.style.display = 'block';
            
            // Scroll to output
            outputSection.scrollIntoView({ behavior: 'smooth' });
        });
    }

    // Handle Copy
    const copyBtn = document.getElementById('copy-btn');
    if (copyBtn) {
        copyBtn.addEventListener('click', () => {
            if (jsonOutput.textContent) {
                navigator.clipboard.writeText(jsonOutput.textContent).then(() => {
                    const originalText = copyBtn.textContent;
                    copyBtn.textContent = 'Copied!';
                    setTimeout(() => {
                        copyBtn.textContent = originalText;
                    }, 2000);
                }).catch(err => {
                    console.error('Failed to copy: ', err);
                    alert('Failed to copy. Please manually select and copy the JSON.');
                });
            }
        });
    }
});
