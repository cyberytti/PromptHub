const API_URL = "/api";

    let data = [];
    let currentItemId = null;
    let currentItemBody = "";

    const listContainer = document.getElementById('listContainer');
    const filterTag = document.getElementById('filterTag');
    const filterCategory = document.getElementById('filterCategory');
    const searchInput = document.getElementById('searchInput');
    const totalCount = document.getElementById('totalCount');

    const modalOverlay = document.getElementById('modalOverlay');
    const modalContent = document.getElementById('modalContent');
    const modalTitle = document.getElementById('modalTitle');
    const modalBody = document.getElementById('modalBody');
    const modalBadges = document.getElementById('modalBadges');
    const closeModalBtn = document.getElementById('closeModalBtn');
    const closeModalBtnBottom = document.getElementById('closeModalBtnBottom');
    const copyBtn = document.getElementById('copyBtn');
    const deleteBtn = document.getElementById('deleteBtn');
    const editBtn = document.getElementById('editBtn');

    const editModalOverlay = document.getElementById('editModalOverlay');
    const editModalContent = document.getElementById('editModalContent');
    const editTextarea = document.getElementById('editTextarea');
    const closeEditModalBtn = document.getElementById('closeEditModalBtn');
    const cancelEditBtn = document.getElementById('cancelEditBtn');
    const updateBtn = document.getElementById('updateBtn');
    const toast = document.getElementById('toast');

    // ── API ──

    async function fetchPrompts() {
        const params = new URLSearchParams();
        const tagValue = filterTag.value;
        const catValue = filterCategory.value;
        const searchValue = searchInput.value;
        if (tagValue && tagValue !== 'all') params.append('tag', tagValue);
        if (catValue && catValue !== 'all') params.append('category', catValue);
        if (searchValue) params.append('search', searchValue);

        try {
            const response = await fetch(`${API_URL}/prompts?${params}`);
            data = await response.json();
            renderList();
        } catch (error) {
            console.error('Error fetching prompts:', error);
            showErrorToast('Failed to load prompts');
        }
    }

    async function deletePromptAPI(id) {
        try {
            const response = await fetch(`${API_URL}/prompts/${id}`, { method: 'DELETE' });
            if (response.ok) {
                showToast('Prompt deleted');
                fetchPrompts();
            }
        } catch (error) {
            showErrorToast('Failed to delete prompt');
        }
    }

    async function updatePromptAPI(id, body) {
        try {
            const response = await fetch(`${API_URL}/prompts/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ body })
            });
            if (response.ok) {
                showToast('Prompt updated');
                closeEditModal();
                closeViewModal();
                fetchPrompts();
            } else {
                showErrorToast('Failed to update prompt');
            }
        } catch (error) {
            showErrorToast('Failed to update prompt');
        }
    }

    // ── UI ──

    function truncateText(text, wordCount = 9) {
        const words = text.split(' ');
        return words.length > wordCount ? words.slice(0, wordCount).join(' ') + '...' : text;
    }

    function getBadgeClass(type, value) {
        if (type === 'favorite') return value === 'Favorite' ? 'badge-fav' : 'badge-nfav';
        if (type === 'type') return value === 'User prompt' ? 'badge-user' : 'badge-sys';
        return '';
    }

    function renderList() {
        totalCount.innerText = data.length;
        listContainer.innerHTML = '';

        if (data.length === 0) {
            listContainer.innerHTML = `
                <div class="empty-state">
                    <i class="fa-regular fa-folder-open"></i>
                    <p>No prompts found matching your criteria.</p>
                </div>`;
            return;
        }

        data.forEach(item => {
            const card = document.createElement('div');
            card.className = 'prompt-card';
            card.onclick = () => openModal(item);

            const iconClass = item.type === 'User prompt'
                ? 'fa-user' : 'fa-robot';
            const iconColor = item.type === 'User prompt'
                ? 'color:var(--blue)' : 'color:var(--purple)';

            card.innerHTML = `
                <div class="card-inner">
                    <div class="card-left">
                        <div class="card-icon">
                            <i class="fa-solid ${iconClass}" style="${iconColor};font-size:14px;"></i>
                        </div>
                        <div class="card-text">
                            <div class="card-title">${item.title}</div>
                            <div class="card-preview">${truncateText(item.body)}</div>
                        </div>
                    </div>
                    <div class="card-badges">
                        <span class="badge ${getBadgeClass('favorite', item.favorite)}">
                            ${item.favorite === 'Favorite' ? '★ ' : ''}${item.favorite}
                        </span>
                        <span class="badge ${getBadgeClass('type', item.type)}">${item.type}</span>
                    </div>
                </div>`;
            listContainer.appendChild(card);
        });
    }

    function openModal(item) {
        currentItemId = item.id;
        currentItemBody = item.body;
        modalTitle.innerText = item.title;
        modalBody.innerText = item.body;

        modalBadges.innerHTML = `
            <span class="badge ${getBadgeClass('favorite', item.favorite)}">${item.favorite}</span>
            <span class="badge ${getBadgeClass('type', item.type)}">${item.type}</span>
            <span class="modal-date"><i class="fa-regular fa-calendar" style="margin-right:4px;"></i>${item.date}</span>`;

        modalOverlay.classList.remove('hidden');
        setTimeout(() => {
            modalOverlay.classList.remove('opacity-0');
            modalContent.classList.remove('scale-95');
            modalContent.classList.add('scale-100');
        }, 10);
    }

    function closeViewModal() {
        modalOverlay.classList.add('opacity-0');
        modalContent.classList.remove('scale-100');
        modalContent.classList.add('scale-95');
        setTimeout(() => {
            modalOverlay.classList.add('hidden');
            currentItemId = null;
            currentItemBody = "";
        }, 250);
    }

    function openEditModal() {
        editTextarea.value = currentItemBody;
        editModalOverlay.classList.remove('hidden');
        setTimeout(() => {
            editModalOverlay.classList.remove('opacity-0');
            editModalContent.classList.remove('scale-95');
            editModalContent.classList.add('scale-100');
            editTextarea.focus();
        }, 10);
    }

    function closeEditModal() {
        editModalOverlay.classList.add('opacity-0');
        editModalContent.classList.remove('scale-100');
        editModalContent.classList.add('scale-95');
        setTimeout(() => { editModalOverlay.classList.add('hidden'); }, 250);
    }

    function copyToClipboard() {
        navigator.clipboard.writeText(modalBody.innerText).then(() => showToast('Copied to clipboard!'));
    }

    function handleUpdate() {
        const updatedBody = editTextarea.value.trim();
        if (!updatedBody) { showErrorToast('Prompt body cannot be empty'); return; }
        if (currentItemId !== null) updatePromptAPI(currentItemId, updatedBody);
    }

    let toastTimer;
    function showToast(message = 'Done!') {
        const span = toast.querySelector('span');
        const icon = toast.querySelector('i');
        span.textContent = message;
        toast.classList.remove('error');
        icon.className = 'fa-solid fa-circle-check';
        icon.style.color = 'var(--green)';
        toast.style.borderColor = 'var(--green)';
        toast.classList.add('visible');
        clearTimeout(toastTimer);
        toastTimer = setTimeout(() => toast.classList.remove('visible'), 3000);
    }

    function showErrorToast(message) {
        const span = toast.querySelector('span');
        const icon = toast.querySelector('i');
        span.textContent = message;
        toast.classList.add('error');
        icon.className = 'fa-solid fa-circle-xmark';
        icon.style.color = 'var(--red)';
        toast.style.borderColor = 'var(--red)';
        toast.classList.add('visible');
        clearTimeout(toastTimer);
        toastTimer = setTimeout(() => toast.classList.remove('visible'), 3000);
    }

    // ── Events ──
    filterTag.addEventListener('change', fetchPrompts);
    filterCategory.addEventListener('change', fetchPrompts);
    searchInput.addEventListener('input', debounce(fetchPrompts, 300));
    closeModalBtn.addEventListener('click', closeViewModal);
    //closeModalBtnBottom.addEventListener('click', closeViewModal);
    copyBtn.addEventListener('click', copyToClipboard);
    deleteBtn.addEventListener('click', () => { if (currentItemId !== null) { deletePromptAPI(currentItemId); closeViewModal(); } });
    editBtn.addEventListener('click', openEditModal);
    closeEditModalBtn.addEventListener('click', closeEditModal);
    cancelEditBtn.addEventListener('click', closeEditModal);
    updateBtn.addEventListener('click', handleUpdate);

    modalOverlay.addEventListener('click', e => { if (e.target === modalOverlay) closeViewModal(); });
    editModalOverlay.addEventListener('click', e => { if (e.target === editModalOverlay) closeEditModal(); });

    document.addEventListener('keydown', e => {
        if (e.key === 'Escape') {
            if (!editModalOverlay.classList.contains('hidden')) closeEditModal();
            else if (!modalOverlay.classList.contains('hidden')) closeViewModal();
        }
    });

    function debounce(func, wait) {
        let timeout;
        return function (...args) {
            clearTimeout(timeout);
            timeout = setTimeout(() => func(...args), wait);
        };
    }

    fetchPrompts();