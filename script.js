document.addEventListener('DOMContentLoaded', () => {
    // Theme setup
    const themeToggle = document.getElementById('theme-toggle');
    const themeIcon = document.getElementById('theme-icon');
    
    // Check local storage or default to light theme
    let currentTheme = localStorage.getItem('theme') || 'light';
    
    // Apply theme
    if (currentTheme === 'dark') {
        document.documentElement.setAttribute('data-theme', 'dark');
        themeIcon.textContent = '☀️';
    } else {
        document.documentElement.removeAttribute('data-theme');
        themeIcon.textContent = '🌙';
    }

    // Toggle theme on click
    if (themeToggle) {
        themeToggle.addEventListener('click', () => {
            currentTheme = currentTheme === 'light' ? 'dark' : 'light';
            localStorage.setItem('theme', currentTheme);
            
            if (currentTheme === 'dark') {
                document.documentElement.setAttribute('data-theme', 'dark');
                themeIcon.textContent = '☀️';
            } else {
                document.documentElement.removeAttribute('data-theme');
                themeIcon.textContent = '🌙';
            }
        });
    }

    // Set current year in footer
    const yearEl = document.getElementById('year');
    if (yearEl) {
        yearEl.textContent = new Date().getFullYear();
    }

    const path = window.location.pathname;
    
    // Determine if we are on index.html or post.html based on pathname or existence of elements
    const postsContainer = document.getElementById('posts-container');
    const postContent = document.getElementById('post-content');

    if (postsContainer) {
        loadPostsList();
    } else if (postContent) {
        loadSinglePost();
    }
});

async function fetchPosts() {
    try {
        const isLocal = window.location.hostname === '127.0.0.1' || window.location.hostname === 'localhost';
        const apiUrl = isLocal 
            ? 'http://localhost:3000/api/posts' 
            : 'https://blog-ragulkannadasan.vercel.app/api/posts';
            
        const response = await fetch(apiUrl);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error('Error fetching posts:', error);
        return [];
    }
}

let allPosts = [];

async function loadPostsList() {
    const container = document.getElementById('posts-container');
    const searchInput = document.getElementById('search-input');
    const sortSelect = document.getElementById('sort-select');
    
    allPosts = await fetchPosts();

    function updatePosts() {
        let filtered = [...allPosts];
        
        // Apply search filter
        if (searchInput && searchInput.value) {
            const query = searchInput.value.toLowerCase();
            filtered = filtered.filter(post => 
                post.title.toLowerCase().includes(query) || 
                post.summary.toLowerCase().includes(query)
            );
        }
        
        // Apply sort
        if (sortSelect) {
            if (sortSelect.value === 'newest') {
                filtered.sort((a, b) => new Date(b.date) - new Date(a.date));
            } else if (sortSelect.value === 'oldest') {
                filtered.sort((a, b) => new Date(a.date) - new Date(b.date));
            }
        } else {
            // Default to newest
            filtered.sort((a, b) => new Date(b.date) - new Date(a.date));
        }

        renderPosts(filtered);
    }

    // Initial render
    updatePosts();

    // Event listeners
    if (searchInput) {
        searchInput.addEventListener('input', updatePosts);
    }
    
    if (sortSelect) {
        sortSelect.addEventListener('change', updatePosts);
    }
}

function renderPosts(postsToRender) {
    const container = document.getElementById('posts-container');
    container.innerHTML = ''; // Clear previous posts

    if (postsToRender.length === 0) {
        container.innerHTML = '<p>No posts found.</p>';
        return;
    }

    postsToRender.forEach(post => {
        const card = document.createElement('a');
        card.href = `post.html?id=${post.id}`;
        card.className = 'post-card';
        
        // Format date nicely
        const dateObj = new Date(post.date);
        const formattedDate = dateObj.toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        });

        card.innerHTML = `
            <span class="post-date">${formattedDate}</span>
            <h2>${post.title}</h2>
            <p>${post.summary}</p>
        `;
        
        container.appendChild(card);
    });
}

async function loadSinglePost() {
    const container = document.getElementById('post-content');
    
    // Get ID from URL
    const urlParams = new URLSearchParams(window.location.search);
    const postId = urlParams.get('id');

    if (!postId) {
        container.innerHTML = `
            <div class="post-header"><h1>Error</h1></div>
            <div class="markdown-body"><p>No post ID specified in URL.</p></div>
        `;
        return;
    }

    const posts = await fetchPosts();
    const post = posts.find(p => p.id === postId);

    if (!post) {
        container.innerHTML = `
            <div class="post-header"><h1>Post not found</h1></div>
            <div class="markdown-body"><p>The post you are looking for does not exist.</p></div>
        `;
        return;
    }

    // Format date
    const dateObj = new Date(post.date);
    const formattedDate = dateObj.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    });

    // Parse markdown (assuming marked.js is loaded in HTML)
    const htmlContent = marked.parse(post.content);

    container.innerHTML = `
        <div class="post-header">
            <span class="post-date" style="color: var(--accent-secondary); margin-bottom: 1rem; display: block; font-weight: 500;">${formattedDate}</span>
            <h1>${post.title}</h1>
        </div>
        <div class="markdown-body">
            ${htmlContent}
        </div>
    `;
}
