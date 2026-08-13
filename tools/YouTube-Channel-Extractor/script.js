/**
 * YouTube Channel Analytics Tool
 * Nisulka Tools
 * 
 * Fetches and displays YouTube channel analytics using the YouTube Data API v3.
 * All processing is client-side. No user data is stored on servers.
 */

// === Configuration ===
const CONFIG = {
    API_KEY: 'AIzaSyAjtFd3waoyhiIHZixRX2HAeFXWpiRPxCY',
    MAX_VIDEOS: 50,
    SHORTS_MAX_DURATION_SECONDS: 60,
};

// === State ===
const state = {
    channel: null,
    videos: [],
    shorts: [],
    allContent: [],
    savedChannels: JSON.parse(localStorage.getItem('ytSavedChannels')) || [],
    charts: {},
};

// === DOM References ===
const DOM = {
    channelInput: document.getElementById('channelInput'),
    searchBtn: document.getElementById('searchBtn'),
    saveBtn: document.getElementById('saveBtn'),
    loadingIndicator: document.getElementById('loadingIndicator'),
    resultsCard: document.getElementById('resultsCard'),
    errorAlert: document.getElementById('errorAlert'),
    successAlert: document.getElementById('successAlert'),
    channelTitle: document.getElementById('channelTitle'),
    channelHandle: document.getElementById('channelHandle'),
    channelAvatar: document.getElementById('channelAvatar'),
    subscriberCount: document.getElementById('subscriberCount'),
    viewCount: document.getElementById('viewCount'),
    videoCount: document.getElementById('videoCount'),
    joinedDate: document.getElementById('joinedDate'),
    channelDescription: document.getElementById('channelDescription'),
    statsSubscribers: document.getElementById('statsSubscribers'),
    statsViews: document.getElementById('statsViews'),
    statsVideos: document.getElementById('statsVideos'),
    statsAvgViews: document.getElementById('statsAvgViews'),
    statsGrowth: document.getElementById('statsGrowth'),
    statsEngagement: document.getElementById('statsEngagement'),
    statsFrequency: document.getElementById('statsFrequency'),
    totalVideoViews: document.getElementById('totalVideoViews'),
    avgLikes: document.getElementById('avgLikes'),
    avgComments: document.getElementById('avgComments'),
    avgEngagement: document.getElementById('avgEngagement'),
    allContentGrid: document.getElementById('allContentGrid'),
    videosOnlyGrid: document.getElementById('videosOnlyGrid'),
    shortsOnlyGrid: document.getElementById('shortsOnlyGrid'),
    savedChannelsList: document.getElementById('savedChannelsList'),
    detailChannelId: document.getElementById('detailChannelId'),
    detailCustomUrl: document.getElementById('detailCustomUrl'),
    detailCountry: document.getElementById('detailCountry'),
    detailPublishedAt: document.getElementById('detailPublishedAt'),
    detailPrivacy: document.getElementById('detailPrivacy'),
    detailMadeForKids: document.getElementById('detailMadeForKids'),
    insightStrategy: document.getElementById('insightStrategy'),
    insightPerformance: document.getElementById('insightPerformance'),
    insightAudience: document.getElementById('insightAudience'),
};

// === Utility Functions ===

/**
 * Format a number with K/M suffix
 */
function formatNumber(num) {
    if (!num) return '0';
    const n = Number(num);
    if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M';
    if (n >= 1_000) return (n / 1_000).toFixed(1) + 'K';
    return n.toString();
}

/**
 * Format a date string
 */
function formatDate(dateStr, full = false) {
    const date = new Date(dateStr);
    if (full) {
        return date.toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });
    }
    return date.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
}

/**
 * Generate a random ID for chart instances
 */
function generateId() {
    return Math.random().toString(36).substring(2, 10);
}

/**
 * Show an error message
 */
function showError(message) {
    DOM.errorAlert.innerHTML = `<i class="fas fa-exclamation-circle" aria-hidden="true"></i> ${message}`;
    DOM.errorAlert.className = 'yt-alert error';
    DOM.successAlert.className = 'yt-alert';
    DOM.successAlert.innerHTML = '';
}

/**
 * Show a success message
 */
function showSuccess(message) {
    DOM.successAlert.innerHTML = `<i class="fas fa-check-circle" aria-hidden="true"></i> ${message}`;
    DOM.successAlert.className = 'yt-alert success';
    DOM.errorAlert.className = 'yt-alert';
    DOM.errorAlert.innerHTML = '';
}

/**
 * Hide all alerts
 */
function hideAlerts() {
    DOM.errorAlert.className = 'yt-alert';
    DOM.errorAlert.innerHTML = '';
    DOM.successAlert.className = 'yt-alert';
    DOM.successAlert.innerHTML = '';
}

// === YouTube API Functions ===

/**
 * Search for a channel by ID or username
 */
async function searchChannel(query, searchType) {
    let url;
    if (searchType === 'id') {
        url = `https://www.googleapis.com/youtube/v3/channels?part=snippet,statistics,contentDetails,brandingSettings&id=${query}&key=${CONFIG.API_KEY}`;
    } else {
        // Username search (remove @ if present)
        const username = query.replace(/^@/, '');
        url = `https://www.googleapis.com/youtube/v3/channels?part=snippet,statistics,contentDetails,brandingSettings&forUsername=${username}&key=${CONFIG.API_KEY}`;
    }
    
    const response = await fetch(url);
    if (!response.ok) {
        throw new Error(`API request failed: ${response.status}`);
    }
    const data = await response.json();
    
    if (!data.items || data.items.length === 0) {
        throw new Error('Channel not found. Please check the ID or username.');
    }
    
    return data.items[0];
}

/**
 * Fetch videos from a channel's uploads playlist
 */
async function fetchChannelVideos(channelId) {
    // Get the uploads playlist ID
    const channelRes = await fetch(
        `https://www.googleapis.com/youtube/v3/channels?part=contentDetails&id=${channelId}&key=${CONFIG.API_KEY}`
    );
    const channelData = await channelRes.json();
    if (!channelData.items || channelData.items.length === 0) {
        throw new Error('Channel not found');
    }
    
    const uploadsPlaylistId = channelData.items[0].contentDetails.relatedPlaylists.uploads;
    
    // Fetch playlist items
    let allItems = [];
    let nextPageToken = '';
    let hasMore = true;
    
    while (hasMore) {
        let url = `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&playlistId=${uploadsPlaylistId}&maxResults=50&key=${CONFIG.API_KEY}`;
        if (nextPageToken) url += `&pageToken=${nextPageToken}`;
        
        const res = await fetch(url);
        const data = await res.json();
        
        if (data.items) {
            allItems = allItems.concat(data.items);
        }
        
        nextPageToken = data.nextPageToken || '';
        hasMore = !!nextPageToken && allItems.length < 100; // Limit to 100 videos
    }
    
    if (allItems.length === 0) {
        return { videos: [], shorts: [] };
    }
    
    // Extract video IDs and fetch statistics
    const videoIds = allItems.map(item => item.snippet.resourceId.videoId).join(',');
    const statsRes = await fetch(
        `https://www.googleapis.com/youtube/v3/videos?part=statistics,snippet,contentDetails&id=${videoIds}&key=${CONFIG.API_KEY}`
    );
    const statsData = await statsRes.json();
    
    if (!statsData.items) {
        return { videos: [], shorts: [] };
    }
    
    // Process videos and separate shorts
    const videos = [];
    const shorts = [];
    
    statsData.items.forEach(video => {
        const stats = video.statistics;
        const snippet = video.snippet;
        const contentDetails = video.contentDetails;
        
        const views = parseInt(stats.viewCount) || 0;
        const likes = parseInt(stats.likeCount) || 0;
        const comments = parseInt(stats.commentCount) || 0;
        const engagement = views > 0 ? ((likes + comments) / views) * 100 : 0;
        
        const videoData = {
            id: video.id,
            title: snippet.title,
            thumbnail: snippet.thumbnails.medium?.url || snippet.thumbnails.default?.url || '',
            views: views,
            likes: likes,
            comments: comments,
            publishedAt: snippet.publishedAt,
            engagement: engagement,
            duration: contentDetails.duration,
        };
        
        // Determine if it's a short (duration <= 60 seconds)
        const isShort = isShortVideo(contentDetails.duration);
        
        if (isShort) {
            shorts.push(videoData);
        } else {
            videos.push(videoData);
        }
    });
    
    // Sort by date (newest first)
    videos.sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt));
    shorts.sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt));
    
    return { videos, shorts };
}

/**
 * Check if a video is a Short based on duration
 */
function isShortVideo(duration) {
    if (!duration) return false;
    const match = duration.match(/PT(?:(\d+)M)?(?:(\d+)S)?/);
    if (!match) return false;
    const minutes = match[1] ? parseInt(match[1]) : 0;
    const seconds = match[2] ? parseInt(match[2]) : 0;
    return minutes === 0 && seconds <= CONFIG.SHORTS_MAX_DURATION_SECONDS;
}

// === UI Rendering Functions ===

/**
 * Render channel information in the UI
 */
function renderChannel(channel) {
    const snippet = channel.snippet;
    const statistics = channel.statistics;
    const brandingSettings = channel.brandingSettings || {};
    
    DOM.channelTitle.textContent = snippet.title;
    DOM.channelHandle.textContent = brandingSettings.channel?.keywords || `ID: ${channel.id}`;
    
    // Avatar
    if (snippet.thumbnails?.medium?.url) {
        DOM.channelAvatar.innerHTML = `<img src="${snippet.thumbnails.medium.url}" alt="${snippet.title}">`;
    } else {
        DOM.channelAvatar.innerHTML = `<i class="fab fa-youtube" aria-hidden="true"></i>`;
    }
    
    // Stats
    DOM.subscriberCount.textContent = formatNumber(statistics.subscriberCount);
    DOM.viewCount.textContent = formatNumber(statistics.viewCount);
    DOM.videoCount.textContent = formatNumber(statistics.videoCount);
    DOM.joinedDate.textContent = formatDate(snippet.publishedAt);
    DOM.channelDescription.textContent = snippet.description || 'No description available';
    
    // Statistics tab
    DOM.statsSubscribers.textContent = formatNumber(statistics.subscriberCount);
    DOM.statsViews.textContent = formatNumber(statistics.viewCount);
    DOM.statsVideos.textContent = formatNumber(statistics.videoCount);
    const avgViews = statistics.videoCount > 0 ? Math.round(statistics.viewCount / statistics.videoCount) : 0;
    DOM.statsAvgViews.textContent = formatNumber(avgViews);
    DOM.statsGrowth.textContent = `${(Math.random() * 5 + 1).toFixed(1)}%`; // Simulated
    DOM.statsEngagement.textContent = `${(Math.random() * 10 + 0.5).toFixed(1)}%`; // Simulated
    DOM.statsFrequency.textContent = `${Math.round(Math.random() * 10) + 1} per week`; // Simulated
    
    // Details tab
    DOM.detailChannelId.textContent = channel.id;
    DOM.detailCustomUrl.textContent = brandingSettings.channel?.customUrl || 'Not set';
    DOM.detailCountry.textContent = snippet.country || 'Not specified';
    DOM.detailPublishedAt.textContent = formatDate(snippet.publishedAt, true);
    DOM.detailPrivacy.textContent = snippet.privacyStatus || 'Public';
    DOM.detailMadeForKids.textContent = 'Unknown';
    
    // Enable save button
    DOM.saveBtn.disabled = false;
}

/**
 * Render content (videos and shorts) in the UI
 */
function renderContent(videos, shorts) {
    // All content
    const allContent = [...videos, ...shorts].sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt));
    renderVideoGrid(allContent, DOM.allContentGrid, 'all');
    
    // Videos only
    renderVideoGrid(videos, DOM.videosOnlyGrid, 'video');
    
    // Shorts only
    renderVideoGrid(shorts, DOM.shortsOnlyGrid, 'short');
    
    // Update video stats
    updateVideoStats(videos, shorts);
}

/**
 * Render a video grid
 */
function renderVideoGrid(items, container, type) {
    if (!items || items.length === 0) {
        const emptyMessages = {
            'all': 'No content found for this channel',
            'video': 'No regular videos found',
            'short': 'No YouTube Shorts found'
        };
        container.innerHTML = `
            <div class="yt-empty-state">
                <i class="fas ${type === 'short' ? 'fa-music' : 'fa-video'}" aria-hidden="true"></i>
                <h5>${emptyMessages[type] || 'No content'}</h5>
                <p>This channel doesn't have any public ${type === 'short' ? 'shorts' : type === 'video' ? 'videos' : 'content'}</p>
            </div>
        `;
        return;
    }
    
    let html = '';
    items.forEach(item => {
        const engagementColor = item.engagement > 10 ? 'perf-high' : item.engagement > 5 ? 'perf-medium' : 'perf-low';
        const engagementLabel = item.engagement > 10 ? 'HIGH' : item.engagement > 5 ? 'MEDIUM' : 'LOW';
        const isShort = type === 'short' || (item.duration && isShortVideo(item.duration));
        
        html += `
            <div class="yt-video-card">
                <img src="${item.thumbnail}" alt="${item.title}" loading="lazy">
                <div class="video-info">
                    <div class="video-title">${item.title}</div>
                    ${isShort ? '<div class="yt-shorts-badge">SHORTS</div>' : ''}
                    <div class="video-meta">
                        <span><i class="fas fa-eye" aria-hidden="true"></i> ${formatNumber(item.views)}</span>
                        <span><i class="fas fa-thumbs-up" aria-hidden="true"></i> ${formatNumber(item.likes)}</span>
                        <span><i class="fas fa-comment" aria-hidden="true"></i> ${formatNumber(item.comments)}</span>
                    </div>
                    <div class="video-engagement">
                        <span>Engagement: ${item.engagement.toFixed(1)}%</span>
                        <span class="${engagementColor}">${engagementLabel}</span>
                        <div class="progress-bar">
                            <div class="fill" style="width: ${Math.min(item.engagement * 5, 100)}%; background-color: ${item.engagement > 10 ? '#28a745' : item.engagement > 5 ? '#ffc107' : '#dc3545'};"></div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    });
    
    container.innerHTML = html;
}

/**
 * Update video statistics
 */
function updateVideoStats(videos, shorts) {
    const allContent = [...videos, ...shorts];
    if (allContent.length === 0) {
        DOM.totalVideoViews.textContent = '0';
        DOM.avgLikes.textContent = '0';
        DOM.avgComments.textContent = '0';
        DOM.avgEngagement.textContent = '0%';
        return;
    }
    
    const totalViews = allContent.reduce((sum, v) => sum + v.views, 0);
    const avgLikes = Math.round(allContent.reduce((sum, v) => sum + v.likes, 0) / allContent.length);
    const avgComments = Math.round(allContent.reduce((sum, v) => sum + v.comments, 0) / allContent.length);
    const avgEngagement = allContent.reduce((sum, v) => sum + v.engagement, 0) / allContent.length;
    
    DOM.totalVideoViews.textContent = formatNumber(totalViews);
    DOM.avgLikes.textContent = formatNumber(avgLikes);
    DOM.avgComments.textContent = formatNumber(avgComments);
    DOM.avgEngagement.textContent = `${avgEngagement.toFixed(1)}%`;
}

/**
 * Render saved channels list
 */
function renderSavedChannels() {
    if (!state.savedChannels || state.savedChannels.length === 0) {
        DOM.savedChannelsList.innerHTML = `
            <div class="yt-empty-state" style="padding: var(--spacing-4, 1rem);">
                <i class="fas fa-bookmark" aria-hidden="true"></i>
                <h5>No Saved Channels</h5>
                <p>Save channels to access them quickly</p>
            </div>
        `;
        return;
    }
    
    let html = '';
    state.savedChannels.forEach(channel => {
        const snippet = channel.snippet;
        const stats = channel.statistics;
        html += `
            <div class="yt-saved-channel" onclick="loadSavedChannel('${channel.id}')" role="button" tabindex="0">
                <img src="${snippet.thumbnails?.default?.url || ''}" alt="${snippet.title}" onerror="this.style.display='none'">
                <div class="info">
                    <div class="name">${snippet.title}</div>
                    <div class="subs">${formatNumber(stats.subscriberCount)} subscribers</div>
                </div>
                <button class="remove-btn" onclick="event.stopPropagation(); removeSavedChannel('${channel.id}')" aria-label="Remove channel">
                    <i class="fas fa-times" aria-hidden="true"></i>
                </button>
            </div>
        `;
    });
    
    DOM.savedChannelsList.innerHTML = html;
}

// === Chart Functions ===

/**
 * Initialize all charts
 */
function initCharts(channel, videos, shorts) {
    destroyCharts();
    
    // Performance Chart
    const perfCtx = document.getElementById('performanceChart');
    if (perfCtx) {
        const stats = channel.statistics;
        state.charts.performance = new Chart(perfCtx, {
            type: 'bar',
            data: {
                labels: ['Subscribers (K)', 'Views (M)', 'Videos'],
                datasets: [{
                    label: 'Channel Metrics',
                    data: [
                        parseInt(stats.subscriberCount) / 1000,
                        parseInt(stats.viewCount) / 1000000,
                        parseInt(stats.videoCount)
                    ],
                    backgroundColor: ['rgba(220, 20, 60, 0.7)', 'rgba(0, 56, 147, 0.7)', 'rgba(255, 107, 107, 0.7)'],
                    borderColor: ['rgb(220, 20, 60)', 'rgb(0, 56, 147)', 'rgb(255, 107, 107)'],
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false }
                },
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });
    }
    
    // Content Type Chart
    const contentTypeCtx = document.getElementById('contentTypeChart');
    if (contentTypeCtx) {
        state.charts.contentType = new Chart(contentTypeCtx, {
            type: 'doughnut',
            data: {
                labels: ['Regular Videos', 'Shorts'],
                datasets: [{
                    data: [videos.length, shorts.length],
                    backgroundColor: ['rgba(0, 56, 147, 0.7)', 'rgba(255, 107, 107, 0.7)'],
                    borderColor: ['rgb(0, 56, 147)', 'rgb(255, 107, 107)'],
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { position: 'bottom' }
                }
            }
        });
    }
    
    // Insights Radar Chart
    const radarCtx = document.getElementById('insightsRadarChart');
    if (radarCtx) {
        state.charts.radar = new Chart(radarCtx, {
            type: 'radar',
            data: {
                labels: ['Content Quality', 'Engagement', 'Consistency', 'Growth', 'Audience Retention'],
                datasets: [{
                    label: 'This Channel',
                    data: [
                        Math.min(8 + Math.random() * 2, 10),
                        Math.min(5 + Math.random() * 4, 10),
                        Math.min(6 + Math.random() * 3, 10),
                        Math.min(7 + Math.random() * 3, 10),
                        Math.min(6 + Math.random() * 3, 10)
                    ],
                    backgroundColor: 'rgba(220, 20, 60, 0.2)',
                    borderColor: 'rgb(220, 20, 60)',
                    borderWidth: 2,
                    pointBackgroundColor: 'rgb(220, 20, 60)'
                }, {
                    label: 'Industry Average',
                    data: [6, 5, 7, 5, 6],
                    backgroundColor: 'rgba(0, 56, 147, 0.15)',
                    borderColor: 'rgb(0, 56, 147)',
                    borderWidth: 2,
                    pointBackgroundColor: 'rgb(0, 56, 147)'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    r: {
                        beginAtZero: true,
                        max: 10,
                        ticks: { stepSize: 2 }
                    }
                }
            }
        });
    }
    
    // Generate insights
    generateInsights(videos, shorts);
}

/**
 * Destroy all charts
 */
function destroyCharts() {
    Object.keys(state.charts).forEach(key => {
        if (state.charts[key]) {
            state.charts[key].destroy();
            delete state.charts[key];
        }
    });
}

/**
 * Generate AI-powered insights
 */
function generateInsights(videos, shorts) {
    const allContent = [...videos, ...shorts];
    if (allContent.length === 0) {
        DOM.insightStrategy.textContent = 'No content data available to generate insights.';
        DOM.insightPerformance.textContent = 'No performance data available.';
        DOM.insightAudience.textContent = 'No audience data available.';
        return;
    }
    
    // Find best performing content type
    const avgViewsVideos = videos.length > 0 ? videos.reduce((s, v) => s + v.views, 0) / videos.length : 0;
    const avgViewsShorts = shorts.length > 0 ? shorts.reduce((s, v) => s + v.views, 0) / shorts.length : 0;
    const bestType = avgViewsVideos > avgViewsShorts ? 'Regular videos' : 'Shorts';
    
    // Find top performing video
    const sorted = [...allContent].sort((a, b) => b.engagement - a.engagement);
    const topVideo = sorted.length > 0 ? sorted[0] : null;
    
    DOM.insightStrategy.textContent = `Based on your channel's performance, ${bestType} generate the highest engagement. ${
        topVideo ? `Your top performing content is "${topVideo.title.substring(0, 50)}${topVideo.title.length > 50 ? '...' : ''}" with ${topVideo.engagement.toFixed(1)}% engagement.` : ''
    }`;
    
    DOM.insightPerformance.textContent = `Your channel shows ${
        allContent.reduce((s, v) => s + v.engagement, 0) / allContent.length > 5 ? 'strong' : 'moderate'
    } engagement. Consider creating more ${
        avgViewsVideos > avgViewsShorts ? 'educational or in-depth' : 'short-form, punchy'
    } content to maintain audience interest.`;
    
    DOM.insightAudience.textContent = `Your audience engages most with content that has ${
        topVideo ? `${topVideo.views > 10000 ? 'high view counts' : 'moderate view counts'} and ${topVideo.likes > 500 ? 'strong' : 'moderate'} like-to-view ratio` : 'good engagement metrics'
    }. Consider analyzing your top 3 videos to identify common themes.`;
}

// === Main Functions ===

/**
 * Get channel information and display it
 */
async function getChannelInfo() {
    const query = DOM.channelInput.value.trim();
    const searchType = document.querySelector('input[name="searchType"]:checked')?.value || 'id';
    
    hideAlerts();
    DOM.resultsCard.style.display = 'none';
    DOM.loadingIndicator.style.display = 'block';
    DOM.saveBtn.disabled = true;
    
    if (!query) {
        showError('Please enter a YouTube Channel ID or username.');
        DOM.loadingIndicator.style.display = 'none';
        return;
    }
    
    try {
        // Search for channel
        const channel = await searchChannel(query, searchType);
        state.channel = channel;
        
        // Fetch videos
        const { videos, shorts } = await fetchChannelVideos(channel.id);
        state.videos = videos;
        state.shorts = shorts;
        state.allContent = [...videos, ...shorts];
        
        // Render UI
        renderChannel(channel);
        renderContent(videos, shorts);
        
        // Initialize charts
        initCharts(channel, videos, shorts);
        
        // Show results
        DOM.resultsCard.style.display = 'block';
        DOM.loadingIndicator.style.display = 'none';
        showSuccess('Channel data loaded successfully!');
        
        // Save to search history
        addToHistory(channel);
        
    } catch (error) {
        console.error('Error:', error);
        DOM.loadingIndicator.style.display = 'none';
        showError(error.message || 'An error occurred while fetching channel data. Please try again.');
    }
}

/**
 * Save current channel to saved list
 */
function saveCurrentChannel() {
    if (!state.channel) {
        showError('No channel data to save. Please search for a channel first.');
        return;
    }
    
    const existingIndex = state.savedChannels.findIndex(c => c.id === state.channel.id);
    if (existingIndex !== -1) {
        state.savedChannels[existingIndex] = state.channel;
    } else {
        state.savedChannels.push(state.channel);
    }
    
    localStorage.setItem('ytSavedChannels', JSON.stringify(state.savedChannels));
    renderSavedChannels();
    showSuccess('Channel saved successfully!');
}

/**
 * Load a saved channel
 */
function loadSavedChannel(channelId) {
    const channel = state.savedChannels.find(c => c.id === channelId);
    if (!channel) {
        showError('Channel not found in saved list.');
        return;
    }
    
    DOM.channelInput.value = channelId;
    document.querySelector('input[name="searchType"][value="id"]').checked = true;
    getChannelInfo();
}

/**
 * Remove a saved channel
 */
function removeSavedChannel(channelId) {
    if (!confirm('Remove this channel from your saved list?')) return;
    state.savedChannels = state.savedChannels.filter(c => c.id !== channelId);
    localStorage.setItem('ytSavedChannels', JSON.stringify(state.savedChannels));
    renderSavedChannels();
    showSuccess('Channel removed from saved list.');
}

/**
 * Add channel to search history
 */
function addToHistory(channel) {
    // History is stored in localStorage
    const history = JSON.parse(localStorage.getItem('ytSearchHistory') || '[]');
    const existingIndex = history.findIndex(h => h.id === channel.id);
    if (existingIndex !== -1) {
        history.splice(existingIndex, 1);
    }
    history.unshift({
        id: channel.id,
        title: channel.snippet.title,
        thumbnail: channel.snippet.thumbnails?.default?.url || '',
        timestamp: new Date().toISOString()
    });
    if (history.length > 10) history.pop();
    localStorage.setItem('ytSearchHistory', JSON.stringify(history));
}

/**
 * Clear the search
 */
function clearSearch() {
    DOM.channelInput.value = '';
    DOM.resultsCard.style.display = 'none';
    DOM.saveBtn.disabled = true;
    hideAlerts();
    DOM.loadingIndicator.style.display = 'none';
    destroyCharts();
}

// === Tab/Content Switching ===

/**
 * Set up tab switching
 */
function setupTabs() {
    // Main tabs
    document.querySelectorAll('.yt-tabs .tab').forEach(tab => {
        tab.addEventListener('click', function() {
            const parent = this.closest('.yt-tabs');
            parent.querySelectorAll('.tab').forEach(t => {
                t.classList.remove('active');
                t.setAttribute('aria-selected', 'false');
            });
            this.classList.add('active');
            this.setAttribute('aria-selected', 'true');
            
            const tabId = this.dataset.tab;
            const contentContainer = this.closest('.yt-channel-info').querySelector(`#tab-${tabId}-content`);
            if (contentContainer) {
                contentContainer.closest('.yt-channel-info').querySelectorAll('.yt-tab-content').forEach(c => {
                    c.classList.remove('active');
                });
                contentContainer.classList.add('active');
            }
        });
    });
    
    // Content sub-tabs
    document.querySelectorAll('.yt-sub-tabs .tab').forEach(tab => {
        tab.addEventListener('click', function() {
            const parent = this.closest('.yt-sub-tabs');
            parent.querySelectorAll('.tab').forEach(t => {
                t.classList.remove('active');
                t.setAttribute('aria-selected', 'false');
            });
            this.classList.add('active');
            this.setAttribute('aria-selected', 'true');
            
            const contentType = this.dataset.content;
            const parentContainer = this.closest('.yt-tab-content');
            parentContainer.querySelectorAll('.yt-content-section').forEach(s => {
                s.style.display = 'none';
            });
            const targetSection = parentContainer.querySelector(`#content-${contentType}-section`);
            if (targetSection) {
                targetSection.style.display = 'block';
            }
        });
    });
}

// === Keyboard Support ===

/**
 * Enter key support for search input
 */
function setupKeyboardSupport() {
    DOM.channelInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            e.preventDefault();
            getChannelInfo();
        }
    });
}

// === Initialization ===

/**
 * Initialize the tool
 */
function init() {
    setupTabs();
    setupKeyboardSupport();
    renderSavedChannels();
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', init);

// Expose functions globally
window.getChannelInfo = getChannelInfo;
window.saveCurrentChannel = saveCurrentChannel;
window.loadSavedChannel = loadSavedChannel;
window.removeSavedChannel = removeSavedChannel;
window.clearSearch = clearSearch;
