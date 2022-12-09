// We'll disable eslint rule that avoids
// having multiple classes in one file
/* eslint-disable max-classes-per-file, class-methods-use-this */

// -- (c) Book - class to create valid Books -- //
class Book {
  constructor({ title, author = null }) {
    this.title = title;
    this.author = author;
  }

  // -- createLi - returns an <li> with the book info -- //
  createLi() {
    const templateBook = `
    <span>${this.title}</span><span> by ${this.author}</span>
    <button type="button">Remove</button>
    <hr>
    `;
    const liBook = document.createElement('li');
    liBook.innerHTML = templateBook;
    const bookFragment = document.createDocumentFragment();
    bookFragment.appendChild(liBook);
    return bookFragment;
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
      }
    } else {
      this.popError(t.querySelector(':invalid'));
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