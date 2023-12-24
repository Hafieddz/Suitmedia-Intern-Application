// Hide Header when scrolling
const header = document.getElementById('header');
let lastScrollTop = 0;

window.addEventListener('scroll', function () {
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;

    if (scrollTop > lastScrollTop) {
        header.style.top = '-100px';  
    } else {
        // Scroll up
        header.style.top = '0';        
        header.style.backgroundColor = rgba(255, 103, 0, 0.7);

        if (scrollTop == 0) {
            header.style.backgroundColor = '#FF6700';
        }
    }

    lastScrollTop = scrollTop;
});

// Script for Active Navbar
const navLinkEls = document.querySelectorAll('.nav_link');
const windowPathName = window.location.pathname;

navLinkEls.forEach(navLinkEl => {
    const navLinkPathname = new URL(navLinkEl.href).pathname;

    if ((windowPathName === navLinkPathname) || (windowPathName === '/index.html' && navLinkPathname === '/')) {
        navLinkEl.classList.add('nav_link_active');
    }
});

// Select Dropdown
const selectFieldPage = document.getElementById('select-field-page');
const selectFieldSort = document.getElementById('select-field-sort');
const selectTextPage = document.getElementById('select-text-page');
const selectTextSort = document.getElementById('select-text-sort');
const optionsPage = document.getElementsByClassName('optionsPage');
const optionSort = document.getElementsByClassName('optionSort');
const show_page = document.getElementById('show-page');
const show_sort = document.getElementById('show-sort');
const listShow = document.getElementById('list-show');

selectFieldPage.onclick = function () {
    show_page.classList.toggle('hide');
}

selectFieldSort.onclick = function () {
    show_sort.classList.toggle('hide');
}

for (option of optionsPage) {
    option.onclick = function () {
        const selectedValue = this.textContent.trim();
        const itemsPerPage = parseInt(selectedValue); 

        window.location.href = `${window.location.pathname}?itemsPerPage=${itemsPerPage}`;

    }
}

for (option of optionSort) {
    option.onclick = function () {
        selectTextSort.innerHTML = this.textContent;
    }
}

// API & Pagination
const queryString = window.location.search;
const urlParams = new URLSearchParams(queryString);
const itemsPerPage = parseInt(urlParams.get('itemsPerPage')) || 10;

selectTextPage.innerText = itemsPerPage;
listShow.innerText = 'Showing 1- ' + itemsPerPage + ' of 100'
let currentPage = 1; // Current page



prevBtn.addEventListener("click", () => {
    if (currentPage > 1) {
        currentPage--;
        fetchIdeas();
    }
});

nextBtn.addEventListener("click", () => {
    const totalPages = 10;

    if (currentPage < totalPages) {
        currentPage++;
        fetchIdeas();
    }
});

function fetchIdeas() {
    const apiUrl = "https://suitmedia-backend.suitdev.com/api/ideas";
    const params = {
        "page[number]": currentPage,
        "page[size]": itemsPerPage,
        "append": ['small_image', 'medium_image'],
        "sort": 'published_at'
    };

    const urlWithParams = new URL(apiUrl);
    Object.keys(params).forEach(key => urlWithParams.searchParams.append(key, params[key]));

    fetch(urlWithParams, {
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        }
    })
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            if (data && data.data && Array.isArray(data.data)) {
                const cardContent = document.getElementById("card-content");
                cardContent.innerHTML = ""; // Clear existing content

                data.data.forEach(idea => {
                    const imageUrl = idea.medium_image && idea.medium_image.length > 0 && idea.medium_image[0].url;

                    cardContent.innerHTML += `
                    <div class="card">
                        <div class="card-img">
                            <img src="${imageUrl || 'placeholder.jpg'}" alt="" >
                        </div>  
                        <div class="card-info">
                            <p> ${formatDate(idea.published_at)} </p>
                            <h4 class="card-text">
                                ${idea.title}
                            </h4>
                        </div>
                    </div>`;
                });

                // Update pagination links
                updatePaginationLinks(data.meta.totalPages);
            } else {
                console.error("Invalid data structure:", data);
            }
        })
        .catch(error => console.error("Error fetching data:", error));
}

function updatePaginationLinks(totalPages) {
    const currentPageSpan = document.getElementById("currentPage");
    currentPageSpan.textContent = currentPage ;
}

document.addEventListener("DOMContentLoaded", function () {
    fetchIdeas(); // Initial fetch on page load
});


function formatDate(dateString) {
    const options = { day: 'numeric', month: 'long', year: 'numeric' };
    return new Date(dateString).toLocaleDateString('id-ID', options);
}
