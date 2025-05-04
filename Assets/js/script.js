const navbar = document.getElementById("navbar");
const homeSection = document.getElementById("home");
const aboutSection = document.getElementById("about");
const expertiseSection = document.getElementById("expertise");
const contactSection = document.getElementById("contact");

function isSectionVisible(section) {
  const rect = section.getBoundingClientRect();
  return rect.top <= 0 && rect.bottom > 0;
}

function isPastHome() {
  const rect = homeSection.getBoundingClientRect();
  return rect.bottom <= 0;
}

window.addEventListener("scroll", () => {
  if (
    isPastHome() &&
    (isSectionVisible(aboutSection) ||
      isSectionVisible(expertiseSection) ||
      isSectionVisible(contactSection))
  ) {
    navbar.style.display = "block";
  } else {
    navbar.style.display = "none";
  }
});

function select(selector, all = false) {
  return all
    ? document.querySelectorAll(selector)
    : document.querySelector(selector);
}

function on(event, selector, callback) {
  document.addEventListener(event, function (e) {
    if (e.target.matches(selector)) {
      callback(e);
    }
  });
}

on("click", "#navbar .nav-link", function (e) {
  let section = select(this.hash); // Mendapatkan section berdasarkan ID hash link
  if (section) {
    e.preventDefault(); // Mencegah scroll otomatis

    let navbar = select("#navbar");
    let header = select("#header");
    let sections = select("section", true); // Semua section
    let navlinks = select("#navbar .nav-link", true); // Semua link navbar

    // Hapus class 'active' dari semua nav-link
    navlinks.forEach((item) => {
      item.classList.remove("active");
    });

    // Tambahkan class 'active' pada nav-link yang diklik
    this.classList.add("active");

    // Scroll ke section yang sesuai
    section.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }
});

window.addEventListener("scroll", function () {
  let sections = select("section", true); // Semua section
  let navlinks = select("#navbar .nav-link", true); // Semua nav-link

  sections.forEach((section, index) => {
    let rect = section.getBoundingClientRect();
    let link = navlinks[index];

    // Cek apakah section sedang terlihat
    if (
      rect.top <= window.innerHeight / 2 &&
      rect.bottom >= window.innerHeight / 2
    ) {
      // Hapus class active dari semua nav-link
      navlinks.forEach((item) => {
        item.classList.remove("active");
      });
      // Tambahkan class active pada nav-link yang sesuai dengan section yang terlihat
      link.classList.add("active");
    }
  });
});

// Event click: scroll dan set active class
document.querySelectorAll(".nav-link").forEach((link) => {
  link.addEventListener("click", function (e) {
    e.preventDefault();

    const targetSection = document.querySelector(this.getAttribute("href"));
    targetSection.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });

    document
      .querySelectorAll(".nav-link")
      .forEach((link) => link.classList.remove("active"));
    this.classList.add("active");
  });
});

// Event scroll: update class active sesuai section yang sedang tampil
window.addEventListener("scroll", () => {
  const sections = document.querySelectorAll("section");
  const navLinks = document.querySelectorAll(".nav-link");

  let current = "";

  sections.forEach((section) => {
    const sectionTop = section.offsetTop - 100; // bisa disesuaikan
    if (scrollY >= sectionTop) {
      current = section.getAttribute("id");
    }
  });

  navLinks.forEach((link) => {
    link.classList.remove("active");
    if (link.getAttribute("href") === `#${current}`) {
      link.classList.add("active");
    }
  });
});

// Trigger on load (misal user reload di tengah halaman)
window.dispatchEvent(new Event("scroll"));
