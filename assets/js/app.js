// We'll disable eslint rule that avoids
// having multiple classes in one file
/* eslint-disable max-classes-per-file, class-methods-use-this, no-unused-vars */

// -- (c) Book - class to create valid Books -- //
class Book {
  constructor({ title, author = null }) {
    this.title = title;
    this.author = author;
  }

  // -- createLi - returns an <li> with the book info -- //
  createLi() {
    const templateBook = `
    <span class="book-title">${this.toTitleCase()}</span>
    <span>by</span>
    <span class="book-author">${this.author}</span>
    <button type="button">Remove</button>`;
    const liBook = document.createElement('li');
    liBook.innerHTML = templateBook;
    const bookFragment = document.createDocumentFragment();
    bookFragment.appendChild(liBook);
    return bookFragment;
  }

  /* To Title Case © 2018 David Gouch | https://github.com/gouch/to-title-case */
  toTitleCase() {
    const smallWords = /^(a|an|and|as|is|at|but|by|en|for|if|in|nor|of|on|or|per|the|to|v.?|vs.?|via)$/i;
    const alphanumericPattern = /([A-Za-z0-9\u00C0-\u00FF])/;
    const wordSeparators = /([ :–—-])/;

    return this.title.toLowerCase().split(wordSeparators)
      .map((current, index, array) => {
        if (
          /* Check for small words */
          /* Skip first and last word */
          /* Ignore title end and subtitle start */
          /* Ignore small words that start a hyphenated phrase */
          current.search(smallWords) > -1
          && index !== 0
          && index !== array.length - 1
          && array[index - 3] !== ':'
          && array[index + 1] !== ':'
          && (array[index + 1] !== '-'
          || (array[index - 1] === '-' && array[index + 1] === '-'))
        ) {
          return current.toLowerCase();
        }

        /* Ignore intentional capitalization */
        if (current.substr(1).search(/[A-Z]|\../) > -1) {
          return current;
        }

        /* Ignore URLs */
        if (array[index + 1] === ':' && array[index + 2] !== '') {
          return current;
        }

        /* Capitalize the first letter */
        return current.replace(alphanumericPattern,
          (match) => match.toUpperCase());
      })
      .join('');
  }
}

// -- (c) Library - class to store valid Books -- //
// -   it also insert, delete to localStorage   - //
class Library {
  constructor() {
    let readBooks = JSON.parse(localStorage.getItem('abData'));
    readBooks ??= [];
    this.books = readBooks.map((book) => new Book(book));
  }

  // -- save - writes the library to the localStorage -- //
  save() {
    localStorage.setItem('abData', JSON.stringify(this.books));
  }

  // -- has - verifies if a book is already in the library -- //
  has({ title: nBook }) {
    this.books.some(({ title: b }) => b.toLowerCase() === nBook.toLowerCase());
  }

  // -- insert - inserts a newBook into the library -- //
  insert(newBook) {
    this.books.push(newBook);
    this.save();
    return newBook;
  }

  // -- delete - deletes the sBook from the library -- //
  delete({ title: sBook }) {
    const previousBooks = this.books.length;

    this.books = this.books.filter(({ title: b }) => b.toLowerCase() !== sBook.toLowerCase());

    return (previousBooks !== this.books.length);
  }
}

// -- (c) App - class to user interface -- //
// -   it also insert, delete to localStorage   - //
class App {
  constructor() {
    this.library = new Library();
    this.addForm = document.forms.addbook;
    this.formInputs = this.addForm.querySelectorAll('input');
    this.booksUl = document.getElementById('bookslist');
    this.menu = document.getElementById('nav-menu');
    this.link = document.getElementsByClassName('selected');
    this.screen = document.getElementsByClassName('active');
  }

  // -- getLiteralBook - returns a book object in literal notation -- //
  getLiteralBook() {
    const literalBook = { };
    const arrFormInputs = Array.from(this.formInputs);

    arrFormInputs.forEach((formInput) => {
      literalBook[formInput.id] = formInput.value;
    });

    return literalBook;
  }

  // -- displayBook - inserts a book in the DOM -- //
  displayBook(book) {
    const bookLi = book.createLi();
    this.booksUl.appendChild(bookLi);
  }

  // -- listBooks - list all the books from the library -- //
  listBooks() {
    if (this.library.books.length > 0) {
      this.library.books.forEach((book) => {
        this.displayBook(book);
      });
    }
  }

  // -- popError - shows a custom error if title/author are invalid -- //
  popError(iInput) {
    if (!iInput.validity.customError) {
      if (iInput.validity.valueMissing) {
        iInput.setCustomValidity(`Book ${iInput.placeholder} is required and can't be empty.`);
      } else if (iInput.validity.tooShort) {
        iInput.setCustomValidity(`Book ${iInput.placeholder} length must be 6 chars at least.`);
      } else if (iInput.validity.patternMismatch) {
        iInput.setCustomValidity(`Book ${iInput.placeholder} can't start or end with spaces.`);
      } else {
        iInput.setCustomValidity('');
      }
    }
    iInput.focus();
    iInput.reportValidity();
  }

  // -- removeBook - it deletes a Book from the DOM -- //
  removeBook(event) {
    const { target: t, target: { parentElement: pe } } = event;
    if (t.type === 'button') {
      const delBook = new Book({ title: pe.firstElementChild.textContent });
      if (this.library.delete(delBook)) {
        this.library.save();
        pe.parentNode.removeChild(pe);
      }
    }
  }

  // -- addBook - inserts a book into the library & display the book in the DOM -- //
  addBook(event) {
    const { target: t, target: { elements: e } } = event;
    event.preventDefault();

    // -- with customError and not empty value we have to check again if the book exists -- //
    if (e.title.value && e.title.validity.customError) {
      e.title.setCustomValidity('');
    }
    if (e.author.value && e.author.validity.customError) {
      e.author.setCustomValidity('');
    }

    if (t.checkValidity()) {
      const checkBook = new Book({ title: e.title.value });
      if (this.library.has(checkBook)) {
        e.title.setCustomValidity(`The Book ${e.title.value} already exists. No duplicates allowed.`);
        this.popError(e.title);
      } else {
        const newBook = new Book(this.getLiteralBook());
        this.displayBook(newBook);
        this.library.insert(newBook);
        t.reset();
        e.title.focus();
        this.menu.children[1].children[0].click();
      }
    } else {
      this.popError(t.querySelector(':invalid'));
    }
  }

  showMenu(event) {
    const { target: t } = event;
    event.preventDefault();

    if (t.tagName === 'A' && t.className !== 'logo' && t.className !== 'selected') {
      this.link[0].classList.toggle('selected');
      t.classList.toggle('selected');
      this.link = document.getElementsByClassName('selected');

      const currentScreen = document.getElementsByClassName('active');
      currentScreen[0].classList.toggle('active');

      const nextScreen = document.querySelector(t.dataset.target);
      nextScreen.classList.toggle('active');
    } else {
      const listLink = document.querySelector('nav ul [data-target="#list"]');
      if (listLink.className !== 'selected') {
        listLink.click();
      }
    }
  }
}

// -- app - is the interface with the user -- //
const app = new App();

// - When the DOM is ready, the books from the localStorage are shown - //
window.addEventListener('DOMContentLoaded', app.listBooks());

// -- Listen to the submit event on the form -- //
app.addForm.addEventListener('submit', (e) => app.addBook(e));

// -- Listen to the click event on the list of books -- //
app.booksUl.addEventListener('click', (e) => app.removeBook(e));

// -- Liste to the click event on the navbar options -- //
app.menu.addEventListener('click', (e) => app.showMenu(e));

// -- to show the date and time running -- //
// Function to format 1 in 01
const zeroFill = (n) => `0${n}`.slice(-2);

// Creates interval
const interval = setInterval(() => {
  // Get current time
  const now = new Date();

  // Format date as in mm/dd/aaaa hh:ii:ss
  const curDay = `${zeroFill((now.getMonth() + 1))}/${zeroFill(now.getUTCDate())}/${now.getFullYear()}`;
  const curTim = `${zeroFill(now.getHours())}:${zeroFill(now.getMinutes())}:${zeroFill(now.getSeconds())}`;
  const dateTime = `${curDay} ${curTim}`;
  // Display the date and time on the screen using div#date-time
  document.getElementById('showdaytime').innerHTML = dateTime;
}, 1000);
