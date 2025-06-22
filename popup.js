document.addEventListener('DOMContentLoaded', () => {
    let allData = {};
    let todayChart, last7Chart, siteDetailChart;

    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');
    const themeToggle = document.getElementById('theme-toggle');
    const searchInput = document.getElementById('search-websites');
    const sortSelect = document.getElementById('sort-by');

    const modal = document.getElementById('site-detail-modal');
    const modalCloseBtn = document.querySelector('.close-btn');
    const modalTitle = document.getElementById('modal-title');

    const formatTime = (seconds) => {
        if (seconds < 60) return `${seconds}s`;
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        if (m < 60) return `${m}m ${s}s`;
        const h = Math.floor(m / 60);
        const min = m % 60;
        return `${h}h ${min}m`;
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
    };

    const renderTodayChart = (todayData) => {
        const ctx = document.getElementById('today-chart').getContext('2d');
        if (todayChart) todayChart.destroy();

        const sites = todayData.sites || {};
        const sortedSites = Object.entries(sites).sort(([, a], [, b]) => b - a).slice(0, 7);
        const otherTime = Object.values(sites).slice(7).reduce((acc, time) => acc + time, 0);

        const labels = sortedSites.map(([site]) => site);
        const data = sortedSites.map(([, time]) => time);

        if (otherTime > 0) {
            labels.push('Other');
            data.push(otherTime);
        }

        if (labels.length === 0) {
            ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
            ctx.font = '14px Arial';
            ctx.fillStyle = getComputedStyle(document.body).getPropertyValue('--text-color');
            ctx.textAlign = 'center';
            ctx.fillText('No browsing data for today', ctx.canvas.width / 2, ctx.canvas.height / 2);
            return;
        }

        todayChart = new Chart(ctx, {
            type: 'pie',
            data: {
                labels: labels,
                datasets: [{
                    data: data,
                    backgroundColor: ['#8ab4f8', '#fdd663', '#a1c299', '#f28b82', '#c58af9', '#78d9ec', '#fcad70', '#ff8a65'],
                    borderColor: 'rgba(0,0,0,0)',
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        position: 'top',
                        labels: { 
                            color: getComputedStyle(document.body).getPropertyValue('--text-color'),
                            font: { size: 12 }
                        }
                    },
                    tooltip: {
                        callbacks: {
                            label: (context) => `${context.label}: ${formatTime(context.raw)}`
                        }
                    }
                }
            }
        });
    };

    const renderLast7DaysChart = (historyData) => {
        const ctx = document.getElementById('last7-chart').getContext('2d');
        if (last7Chart) last7Chart.destroy();

        const labels = [];
        const data = [];
        for (let i = 6; i >= 0; i--) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            const dateStr = d.toISOString().slice(0, 10);
            labels.push(formatDate(dateStr));
            data.push(historyData[dateStr] || 0);
        }

        last7Chart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Time Spent',
                    data: data,
                    backgroundColor: '#8ab4f8',
                    borderRadius: 4,
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        callbacks: {
                            label: (context) => `Time: ${formatTime(context.raw)}`
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            color: getComputedStyle(document.body).getPropertyValue('--text-color'),
                            callback: (value) => formatTime(value)
                        },
                        grid: { color: getComputedStyle(document.body).getPropertyValue('--border-color') }
                    },
                    x: {
                        ticks: { color: getComputedStyle(document.body).getPropertyValue('--text-color') },
                        grid: { color: 'transparent' }
                    }
                }
            }
        });
    };

    const renderSiteDetailChart = (hostname, dailyUsage) => {
        const ctx = document.getElementById('site-detail-chart').getContext('2d');
        if (siteDetailChart) siteDetailChart.destroy();

        const labels = [];
        const data = [];
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);

        const usageEntries = Object.entries(dailyUsage)
            .map(([date, time]) => ({ date: new Date(date), time }))
            .filter(entry => entry.date >= sevenDaysAgo)
            .sort((a, b) => a.date - b.date);

        if (usageEntries.length === 0) {
            ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
            ctx.font = '14px Arial';
            ctx.fillStyle = getComputedStyle(document.body).getPropertyValue('--text-color');
            ctx.textAlign = 'center';
            ctx.fillText('No recent data for this site', ctx.canvas.width / 2, ctx.canvas.height / 2);
            modalTitle.textContent = `${hostname} - No recent data`;
            return;
        }

        modalTitle.textContent = `Last 7 Days Usage: ${hostname}`;

        siteDetailChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: usageEntries.map(e => formatDate(e.date)),
                datasets: [{
                    label: 'Time Spent',
                    data: usageEntries.map(e => e.time),
                    backgroundColor: '#8ab4f8',
                    borderRadius: 4,
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        callbacks: {
                            label: (context) => `Time: ${formatTime(context.raw)}`
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            color: getComputedStyle(document.body).getPropertyValue('--text-color'),
                            callback: (value) => formatTime(value)
                        },
                        grid: { color: getComputedStyle(document.body).getPropertyValue('--border-color') }
                    },
                    x: {
                        ticks: { color: getComputedStyle(document.body).getPropertyValue('--text-color') },
                        grid: { color: 'transparent' }
                    }
                }
            }
        });
    };

    const renderToday = (data) => {
        const todayData = data.today || { totalTime: 0, sites: {} };
        document.getElementById('total-time-today').textContent = formatTime(todayData.totalTime);
        document.getElementById('sites-visited-today').textContent = Object.keys(todayData.sites).length;
        renderTodayChart(todayData);
        renderWebsiteList(data);
    };

    const renderLast7Days = (data) => {
        const history = data.weeklyHistory || {};
        const times = Object.values(history);
        const totalTime = times.reduce((sum, time) => sum + time, 0);
        const avgDaily = times.length > 0 ? totalTime / times.length : 0;

        document.getElementById('average-daily').textContent = formatTime(Math.round(avgDaily));

        let maxTime = 0;
        let mostActiveDay = '-';
        for (const [date, time] of Object.entries(history)) {
            if (time > maxTime) {
                maxTime = time;
                mostActiveDay = formatDate(date);
            }
        }
        document.getElementById('most-active-day').textContent = mostActiveDay;

        renderLast7DaysChart(history);
    };

    const renderWebsiteList = (data) => {
        const container = document.getElementById('website-list-container');
        container.innerHTML = '';
        let sites = Object.entries(data.allSites || {});

        const query = searchInput.value.toLowerCase();
        if (query) {
            sites = sites.filter(([hostname]) => hostname.toLowerCase().includes(query));
        }

        const sortBy = sortSelect.value;
        sites.sort(([hostA, dataA], [hostB, dataB]) => {
            switch (sortBy) {
                case 'time-asc': return dataA.totalTime - dataB.totalTime;
                case 'alpha-asc': return hostA.localeCompare(hostB);
                case 'alpha-desc': return hostB.localeCompare(hostA);
                default: return dataB.totalTime - dataA.totalTime;
            }
        });

        if (sites.length === 0) {
            container.innerHTML = `<div class="website-item" style="cursor: default;"><div class="website-info"><div class="hostname">No websites visited yet</div></div></div>`;
            return;
        }

        sites.forEach(([hostname, siteData]) => {
            const item = document.createElement('div');
            item.className = 'website-item';
            item.dataset.hostname = hostname;
            item.innerHTML = `
                <div class="website-info">
                    <div class="hostname">${hostname}</div>
                    <div class="last-visited">Last visited: ${formatDate(siteData.lastVisited)}</div>
                </div>
                <div class="website-time">${formatTime(siteData.totalTime)}</div>
            `;
            item.addEventListener('click', () => {
                renderSiteDetailChart(hostname, siteData.dailyUsage || {});
                modal.style.display = 'block';
            });
            container.appendChild(item);
        });
    };

    const loadDataAndRender = () => {
        chrome.storage.local.get(['today', 'weeklyHistory', 'allSites', 'theme'], (result) => {
            allData = result;

            if (result.theme === 'light') {
                document.body.classList.add('light-mode');
                themeToggle.textContent = '☀️';
            } else {
                document.body.classList.remove('light-mode');
                themeToggle.textContent = '🌙';
            }

            const activeTabId = document.querySelector('.tab-btn.active').dataset.tab;
            renderTab(activeTabId);

            document.getElementById('last-updated').textContent = `Last updated: ${new Date().toLocaleTimeString()}`;
        });
    };

    const renderTab = (tabId) => {
        if (tabId === 'today') renderToday(allData);
        if (tabId === 'last7days') renderLast7Days(allData);
    };

    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            const tabId = button.dataset.tab;
            tabButtons.forEach(btn => btn.classList.remove('active'));
            tabContents.forEach(content => content.classList.remove('active'));

            button.classList.add('active');
            document.getElementById(tabId).classList.add('active');

            renderTab(tabId);
        });
    });

    themeToggle.addEventListener('click', () => {
        document.body.classList.toggle('light-mode');
        const isLight = document.body.classList.contains('light-mode');
        themeToggle.textContent = isLight ? '☀️' : '🌙';
        chrome.storage.local.set({ theme: isLight ? 'light' : 'dark' });
        loadDataAndRender(); 
    });

    searchInput.addEventListener('input', () => renderWebsiteList(allData));
    sortSelect.addEventListener('change', () => renderWebsiteList(allData));

    modalCloseBtn.onclick = () => { modal.style.display = "none"; };
    window.onclick = (event) => {
        if (event.target == modal) {
            modal.style.display = "none";
        }
    };

    loadDataAndRender();
});