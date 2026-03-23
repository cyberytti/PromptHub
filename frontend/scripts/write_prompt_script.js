document.addEventListener('DOMContentLoaded', function () {
        const API_URL = "/api";

        const textarea = document.getElementById('message');
        const saveButton = document.getElementById('save_button');
        const saveModal = document.getElementById('saveModal');
        const saveForm = document.getElementById('saveForm');
        const cancelButton = document.getElementById('cancelButton');
        const promptNameInput = document.getElementById('promptName');
        const promptTagSelect = document.getElementById('promptTag');
        const promptCategorySelect = document.getElementById('promptCategory');
        const toast = document.getElementById('toast');
        const charStatus = document.getElementById('charStatus');
        const wordStatus = document.getElementById('wordStatus');
        const positionStatus = document.getElementById('positionStatus');
        const lineNumbers = document.getElementById('lineNumbers');
        const modifiedDot = document.getElementById('modifiedDot');
        const fileLabel = document.getElementById('fileLabel');
        const minimapContent = document.getElementById('minimapContent');

        function updateLineNumbers() {
            const lines = textarea.value.split('\n');
            let html = '';
            for (let i = 1; i <= Math.max(lines.length, 1); i++) {
                html += `<div class="ln">${i}</div>`;
            }
            lineNumbers.innerHTML = html;
        }

        function updateMinimap() {
            const lines = textarea.value.split('\n');
            let html = '';
            lines.forEach(line => {
                const filled = line.trim().length > 0;
                const w = Math.min(100, Math.max(20, line.length * 3));
                html += `<div class="minimap-line${filled ? ' filled' : ''}" style="width:${w}%"></div>`;
            });
            minimapContent.innerHTML = html;
        }

        function updateStats() {
            const val = textarea.value;
            const chars = val.length;
            const words = val.trim() === '' ? 0 : val.trim().split(/\s+/).length;
            charStatus.textContent = chars.toLocaleString() + ' chars';
            wordStatus.textContent = words.toLocaleString() + ' words';

            if (chars > 0) {
                modifiedDot.style.display = 'block';
                fileLabel.textContent = 'Unsaved changes';
                fileLabel.style.color = 'var(--orange)';
            } else {
                modifiedDot.style.display = 'none';
                fileLabel.textContent = 'No changes';
                fileLabel.style.color = 'var(--text-3)';
            }
        }

        function updatePosition() {
            const text = textarea.value;
            const pos = textarea.selectionStart;
            const before = text.substring(0, pos);
            const lines = before.split('\n');
            const ln = lines.length;
            const col = lines[lines.length - 1].length + 1;
            positionStatus.textContent = `Ln ${ln}, Col ${col}`;
        }

        textarea.addEventListener('input', () => { updateLineNumbers(); updateStats(); updateMinimap(); });
        textarea.addEventListener('keyup', updatePosition);
        textarea.addEventListener('click', updatePosition);
        textarea.addEventListener('mouseup', updatePosition);

        textarea.addEventListener('keydown', function (e) {
            if (e.key === 'Tab') {
                e.preventDefault();
                const start = this.selectionStart;
                const end = this.selectionEnd;
                this.value = this.value.substring(0, start) + '    ' + this.value.substring(end);
                this.selectionStart = this.selectionEnd = start + 4;
                updateLineNumbers(); updateStats(); updateMinimap();
            }
            if ((e.metaKey || e.ctrlKey) && e.key === 's') {
                e.preventDefault();
                openModal();
            }
        });

        function openModal() {
            const content = textarea.value.trim();
            if (!content) { shakeButton(); return; }
            saveModal.classList.add('active');
            setTimeout(() => promptNameInput.focus(), 100);
        }

        function closeModal() {
            saveModal.classList.remove('active');
            saveForm.reset();
        }

        function shakeButton() {
            saveButton.style.transform = 'translateX(-3px)';
            setTimeout(() => { saveButton.style.transform = 'translateX(3px)'; }, 60);
            setTimeout(() => { saveButton.style.transform = 'translateX(-2px)'; }, 120);
            setTimeout(() => { saveButton.style.transform = 'translateX(0)'; }, 180);
        }

        saveButton.addEventListener('click', openModal);
        cancelButton.addEventListener('click', closeModal);
        saveModal.addEventListener('click', e => { if (e.target === saveModal) closeModal(); });
        document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });

        saveForm.addEventListener('submit', async function (e) {
            e.preventDefault();

            const promptData = {
                title: promptNameInput.value.trim(),
                body: textarea.value.trim(),
                favorite: promptTagSelect.value === 'favorite' ? 'Favorite' : 'Not favorite',
                type: promptCategorySelect.value === 'system' ? 'System prompt' : 'User prompt'
            };

            const originalHTML = saveButton.innerHTML;
            saveButton.innerHTML = `
                <svg class="spin" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="12" cy="12" r="10" stroke-dasharray="31.4" stroke-dashoffset="10"/>
                </svg>
                Saving...`;
            saveButton.disabled = true;

            try {
                const response = await fetch(`${API_URL}/prompts`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(promptData)
                });

                if (response.ok) {
                    closeModal();
                    textarea.value = '';
                    saveForm.reset();
                    updateLineNumbers(); updateStats(); updateMinimap();

                    toast.querySelector('span').textContent = `"${promptData.title}" saved!`;
                    toast.classList.add('show');
                    setTimeout(() => toast.classList.remove('show'), 3200);

                    fileLabel.textContent = 'Saved';
                    fileLabel.style.color = 'var(--green)';
                    modifiedDot.style.display = 'none';
                    setTimeout(() => {
                        fileLabel.textContent = 'No changes';
                        fileLabel.style.color = 'var(--text-3)';
                    }, 3000);
                } else {
                    throw new Error('Failed to save');
                }
            } catch (error) {
                console.error('Error saving:', error);
                alert('Failed to save prompt. Please try again.');
            } finally {
                saveButton.innerHTML = originalHTML;
                saveButton.disabled = false;
            }
        });

        updateLineNumbers(); updateStats(); updateMinimap();
    });