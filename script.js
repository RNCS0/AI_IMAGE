
        document.addEventListener('DOMContentLoaded', function() {
            const generateBtn = document.getElementById('generate-btn');
            const promptInput = document.getElementById('prompt');
            const apiKeyInput = document.getElementById('api-key');
            const outputImage = document.getElementById('output-image');
            const placeholder = document.getElementById('placeholder');
            const loading = document.getElementById('loading');
            const errorMessage = document.getElementById('error-message');
            const successMessage = document.getElementById('success-message');
            
            generateBtn.addEventListener('click', async function() {
                const prompt = promptInput.value.trim();
                const apiKey = apiKeyInput.value.trim();
                
                errorMessage.style.display = 'none';
                successMessage.style.display = 'none';
                
                if (!prompt) {
                    showError('Please describe the image you want to generate');
                    return;
                }
                
                if (!apiKey) {
                    showError('Please enter your Stability AI API key');
                    return;
                }
                
                loading.style.display = 'block';
                generateBtn.disabled = true;
                placeholder.style.display = 'block';
                outputImage.style.display = 'none';
                
                try {
                    const imageData = await generateImageWithStabilityAI(prompt, apiKey);
                    
                    placeholder.style.display = 'none';
                    outputImage.style.display = 'block';
                    outputImage.src = imageData;
                    
                } catch (error) {
                    console.error('Error:', error);
                    showError(`Failed to generate image: ${error.message}`);
                } finally {
                    loading.style.display = 'none';
                    generateBtn.disabled = false;
                }
            });
            
            async function generateImageWithStabilityAI(prompt, apiKey) {
                const engineId = 'stable-diffusion-xl-1024-v1-0';
                const apiHost = 'https://api.stability.ai';
                const url = `${apiHost}/v1/generation/${engineId}/text-to-image`;
                
                const response = await fetch(url, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json',
                        'Authorization': `Bearer ${apiKey}`
                    },
                    body: JSON.stringify({
                        text_prompts: [
                            {
                                text: prompt
                            }
                        ],
                        cfg_scale: 7,
                        height: 1024,
                        width: 1024,
                        steps: 30,
                    })
                });
                
                if (!response.ok) {
                    const errorText = await response.text();
                    throw new Error(`API Error: ${response.status} ${response.statusText} - ${errorText}`);
                }
                
                const responseJSON = await response.json();
                
                if (responseJSON.artifacts && responseJSON.artifacts.length > 0) {
                    const imageData = responseJSON.artifacts[0].base64;
                    return `data:image/png;base64,${imageData}`;
                } else {
                    throw new Error('No image data received from API');
                }
            }
            
            function showError(message) {
                errorMessage.textContent = message;
                errorMessage.style.display = 'block';
            }
            
            function showSuccess(message) {
                successMessage.textContent = message;
                successMessage.style.display = 'block';
                
                setTimeout(() => {
                    successMessage.style.display = 'none';
                }, 5000);
            }
        });
